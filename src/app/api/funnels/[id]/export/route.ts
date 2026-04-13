import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { exportFunnel } from "@/services/funnel-service";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const data = await exportFunnel(id, getUserId(session));
    return apiSuccess(data);
  } catch (error) {
    return apiServerError(error, "GET /api/funnels/[id]/export");
  }
}
