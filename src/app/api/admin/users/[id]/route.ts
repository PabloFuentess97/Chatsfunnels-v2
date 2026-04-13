import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, credits: true, createdAt: true, updatedAt: true,
        _count: { select: { funnels: true, clicks: true, landingPages: true, groups: true } },
        creditHistory: { orderBy: { createdAt: "desc" }, take: 20 },
        funnels: { select: { id: true, name: true, slug: true, isActive: true, _count: { select: { clicks: true, links: true } } }, take: 10 },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.credits !== undefined && { credits: body.credits }),
      },
      select: { id: true, name: true, email: true, role: true, credits: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Prevent self-deletion
    if (id === (session.user as any).id) {
      return NextResponse.json({ success: false, error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
