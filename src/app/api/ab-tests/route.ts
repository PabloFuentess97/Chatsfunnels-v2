import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const tests = await prisma.aBTest.findMany({
    where: { userId: (session.user as any).id },
    include: {
      originalPage: { select: { id: true, name: true, slug: true } },
      variantPage: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: tests });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { name, originalPageId, variantPageId, trafficSplit } = await req.json();
  const userId = (session.user as any).id;

  // Verify ownership of both pages
  const pages = await prisma.landingPage.findMany({
    where: { id: { in: [originalPageId, variantPageId] }, userId },
  });

  if (pages.length !== 2) {
    return NextResponse.json({ success: false, error: "Both pages must belong to you" }, { status: 400 });
  }

  const test = await prisma.aBTest.create({
    data: {
      name,
      userId,
      originalPageId,
      variantPageId,
      trafficSplit: trafficSplit || 50,
    },
  });

  return NextResponse.json({ success: true, data: test }, { status: 201 });
}
