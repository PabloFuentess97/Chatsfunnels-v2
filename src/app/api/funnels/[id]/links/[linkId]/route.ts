import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { updateLink, deleteLink } from "@/services/funnel-service";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id: funnelId, linkId } = await params;
    const userId = getUserId(session);

    // Verify the funnel belongs to the authenticated user
    const funnel = await prisma.funnel.findFirst({
      where: { id: funnelId, userId },
    });
    if (!funnel) return apiError("Not found", 404);

    const body = await req.json();
    const link = await updateLink(linkId, body);
    return apiSuccess(link);
  } catch (error) {
    return apiServerError(error, "PUT /api/funnels/[id]/links/[linkId]");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id: funnelId, linkId } = await params;
    const userId = getUserId(session);

    // Verify the funnel belongs to the authenticated user
    const funnel = await prisma.funnel.findFirst({
      where: { id: funnelId, userId },
    });
    if (!funnel) return apiError("Not found", 404);

    await deleteLink(linkId);
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/funnels/[id]/links/[linkId]");
  }
}
