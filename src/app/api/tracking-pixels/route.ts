import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const pixels = await prisma.trackingPixel.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: pixels });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { name, type, pixelId, script, funnelId } = await req.json();
  const pixel = await prisma.trackingPixel.create({
    data: {
      userId: (session.user as any).id,
      name,
      type,
      pixelId: pixelId || "",
      script: script || null,
      funnelId: funnelId || null,
    },
  });

  return NextResponse.json({ success: true, data: pixel }, { status: 201 });
}
