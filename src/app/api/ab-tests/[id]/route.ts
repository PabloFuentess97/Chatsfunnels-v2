import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  try {
    const test = await prisma.aBTest.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.trafficSplit !== undefined && { trafficSplit: body.trafficSplit }),
        ...(body.status === "running" && { startedAt: new Date() }),
        ...(body.status === "completed" && { endedAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, data: test });
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
    await prisma.aBTest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
}
