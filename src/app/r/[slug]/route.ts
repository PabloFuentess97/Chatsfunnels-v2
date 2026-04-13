import { NextRequest, NextResponse } from "next/server";
import { selectNextLink, recordClick } from "@/modules/funnels/rotation";
import { checkRateLimit, isDuplicateClick, isBot } from "@/modules/antifraud/rate-limiter";
import { parseUserAgent } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // ── Extract request metadata (zero cost) ──
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || "";

  // ── Anti-fraud checks FIRST (no DB, pure in-memory) ──
  if (isBot(userAgent)) {
    return new NextResponse(null, { status: 403 });
  }
  if (!checkRateLimit(ip).allowed) {
    return new NextResponse(null, { status: 429 });
  }
  if (isDuplicateClick(ip, slug)) {
    return new NextResponse(null, { status: 429 });
  }

  // ── Single DB query: funnel + tracking pixels in one shot ──
  const funnel = await prisma.funnel.findUnique({
    where: { slug },
    select: {
      id: true,
      isActive: true,
      userId: true,
      clicksPerRound: true,
      trackingPixels: {
        select: { type: true, pixelId: true, script: true },
      },
    },
  });

  if (!funnel || !funnel.isActive) {
    return new NextResponse(null, { status: 404 });
  }

  // ── Also fetch user-level pixels (that apply to all funnels) ──
  const userPixels = await prisma.trackingPixel.findMany({
    where: { userId: funnel.userId, funnelId: null },
    select: { type: true, pixelId: true, script: true },
  });

  const allPixels = [...funnel.trackingPixels, ...userPixels];

  // ── Link selection (uses in-memory cache, no DB on hot path) ──
  const link = await selectNextLink(funnel.id, {
    strategy: "adaptive",
    clicksPerRound: funnel.clicksPerRound,
  });

  if (!link) {
    return new NextResponse(null, { status: 404 });
  }

  // ── Parse UA once ──
  const parsed = parseUserAgent(userAgent);

  // ── Record click + deduct credit in parallel (non-blocking for redirect) ──
  const writeOps = Promise.all([
    recordClick(link.id, funnel.id, {
      ip,
      userAgent,
      device: parsed.device,
      browser: parsed.browser,
      os: parsed.os,
      referer,
    }),
    prisma.user.update({
      where: { id: funnel.userId },
      data: { credits: { decrement: 1 } },
    }),
  ]).catch((err) => {
    console.error("Click recording failed:", err);
  });

  // Don't await writes - redirect immediately for best latency
  // The writes will complete in the background
  void writeOps;

  // ── Serve response ──
  if (allPixels.length > 0) {
    return servePixelPage(allPixels, link.url);
  }

  return NextResponse.redirect(link.url, 302);
}

// ── Pixel injection page ──────────────────────────────────────────────────

interface PixelData {
  type: string;
  pixelId: string;
  script: string | null;
}

function servePixelPage(pixels: PixelData[], targetUrl: string): NextResponse {
  const safeUrl = targetUrl.replace(/"/g, "&quot;");

  const pixelScripts = pixels
    .map((p) => {
      if (p.type === "FACEBOOK" && p.pixelId) {
        return `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${p.pixelId}');fbq('track','PageView');</script>`;
      }
      if (p.type === "GOOGLE_ANALYTICS" && p.pixelId) {
        return `<script async src="https://www.googletagmanager.com/gtag/js?id=${p.pixelId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${p.pixelId}');</script>`;
      }
      if (p.type === "CUSTOM" && p.script) {
        return p.script;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting...</title>${pixelScripts}<meta http-equiv="refresh" content="1;url=${safeUrl}"></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#666;font-family:system-ui"><p>Redirecting...</p><script>setTimeout(function(){window.location.href="${safeUrl}"},800);</script></body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
