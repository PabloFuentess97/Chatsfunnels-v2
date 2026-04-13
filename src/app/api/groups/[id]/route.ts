import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { getGroupWithMembers } from "@/services/round-service";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const group = await getGroupWithMembers(id);
    if (!group) {
      return apiError("Not found", 404);
    }
    return apiSuccess(group);
  } catch (error) {
    return apiServerError(error, "GET /api/groups/[id]");
  }
}
