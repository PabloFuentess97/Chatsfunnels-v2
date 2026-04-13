import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { getFunnelAnalytics } from "@/services/analytics-service";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { funnelId } = await params;
    const userId = getUserId(session);

    // Verify the funnel belongs to the authenticated user
    const funnel = await prisma.funnel.findFirst({
      where: { id: funnelId, userId },
    });
    if (!funnel) return apiError("Not found", 404);

    const url = new URL(req.url);
    const days = Math.max(1, Math.min(365, parseInt(url.searchParams.get("days") || "30") || 30));

    const analytics = await getFunnelAnalytics(funnelId, days);
    return apiSuccess(analytics);
  } catch (error) {
    return apiServerError(error, "GET /api/analytics/[funnelId]");
  }
}
