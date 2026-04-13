import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { getFunnelById, updateFunnel, deleteFunnel } from "@/services/funnel-service";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const funnel = await getFunnelById(id, getUserId(session));
    if (!funnel) {
      return apiError("Not found", 404);
    }
    return apiSuccess(funnel);
  } catch (error) {
    return apiServerError(error, "GET /api/funnels/[id]");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const funnel = await updateFunnel(id, getUserId(session), body);
    return apiSuccess(funnel);
  } catch (error) {
    return apiServerError(error, "PUT /api/funnels/[id]");
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
    await deleteFunnel(id, getUserId(session));
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/funnels/[id]");
  }
}
