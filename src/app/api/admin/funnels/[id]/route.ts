import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

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
    await prisma.funnel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin funnel delete error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
