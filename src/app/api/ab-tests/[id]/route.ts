import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const userId = getUserId(session);
    const body = await req.json();

    const test = await prisma.aBTest.update({
      where: { id, userId },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.trafficSplit !== undefined && { trafficSplit: body.trafficSplit }),
        ...(body.status === "running" && { startedAt: new Date() }),
        ...(body.status === "completed" && { endedAt: new Date() }),
      },
    });

    return apiSuccess(test);
  } catch (error) {
    return apiServerError(error, "PUT /api/ab-tests/[id]");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const userId = getUserId(session);
    await prisma.aBTest.delete({ where: { id, userId } });
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/ab-tests/[id]");
  }
}
