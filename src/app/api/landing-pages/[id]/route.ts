import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;
  const page = await prisma.landingPage.findFirst({
    where: { id, userId: (session.user as any).id },
    include: { funnel: { select: { id: true, name: true, slug: true } } },
  });

  if (!page) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: page });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  try {
    const page = await prisma.landingPage.update({
      where: { id, userId: (session.user as any).id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.published !== undefined && { published: body.published }),
        ...(body.funnelId !== undefined && { funnelId: body.funnelId || null }),
      },
    });

    return NextResponse.json({ success: true, data: page });
  } catch {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;
  try {
    await prisma.landingPage.delete({
      where: { id, userId: (session.user as any).id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
}
