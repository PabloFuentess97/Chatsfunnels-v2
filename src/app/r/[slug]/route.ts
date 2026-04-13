import { NextRequest, NextResponse } from "next/server";
import { getFunnelBySlug } from "@/services/funnel-service";
import { selectNextLink, recordClick } from "@/modules/funnels/rotation";
import { checkRateLimit, isDuplicateClick, isBot } from "@/modules/antifraud/rate-limiter";
import { parseUserAgent } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || "";

  // Anti-fraud checks
  if (isBot(userAgent)) {
    return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  if (isDuplicateClick(ip, slug)) {
    return NextResponse.json({ error: "Duplicate click" }, { status: 429 });
  }

  // Find funnel
  const funnel = await getFunnelBySlug(slug);
  if (!funnel || !funnel.isActive) {
    return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
  }

  // Select next link using smart rotation
  const link = await selectNextLink(funnel.id, {
    strategy: "weighted",
    clicksPerRound: funnel.clicksPerRound,
  });

  if (!link) {
    return NextResponse.json({ error: "No active links" }, { status: 404 });
  }

  // Parse user agent
  const parsed = parseUserAgent(userAgent);

  // Record click
  await recordClick(link.id, funnel.id, {
    ip,
    userAgent,
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
    referer,
  });

  // Deduct credit from funnel owner
  await prisma.user.update({
    where: { id: funnel.userId },
    data: { credits: { decrement: 1 } },
  });

  // Check for tracking pixels
  const pixels = await prisma.trackingPixel.findMany({
    where: { OR: [{ funnelId: funnel.id }, { userId: funnel.userId, funnelId: null }] },
  });

  // If tracking pixels exist, serve an intermediate page with pixels
  if (pixels.length > 0) {
    const pixelScripts = pixels.map((p) => {
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
    }).join("\n");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting...</title>${pixelScripts}<meta http-equiv="refresh" content="1;url=${link.url}"></head><body><p>Redirecting...</p><script>setTimeout(function(){window.location.href="${link.url}"},1000);</script></body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Direct redirect if no pixels
  return NextResponse.redirect(link.url, 302);
}
