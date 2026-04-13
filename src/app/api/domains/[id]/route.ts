import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    await prisma.domain.delete({
      where: { id, userId: getUserId(session) },
    });
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/domains/[id]");
  }
}
