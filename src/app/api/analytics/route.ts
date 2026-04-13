import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { getDashboardStats } from "@/services/analytics-service";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const stats = await getDashboardStats(getUserId(session));
    return apiSuccess(stats);
  } catch (error) {
    return apiServerError(error, "GET /api/analytics");
  }
}
