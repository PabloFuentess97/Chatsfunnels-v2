import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const domains = await prisma.domain.findMany({
    where: { userId: (session.user as any).id },
    include: { funnel: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: domains });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { domain, funnelId } = await req.json();
  try {
    const d = await prisma.domain.create({
      data: {
        domain,
        userId: (session.user as any).id,
        funnelId: funnelId || null,
      },
    });
    return NextResponse.json({ success: true, data: d }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Domain already exists" },
      { status: 409 }
    );
  }
}
