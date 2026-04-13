import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { startRound } from "@/services/round-service";
import { apiSuccess, apiServerError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { groupId, maxClicks } = await req.json();
    const round = await startRound(groupId, maxClicks || 100);
    return apiSuccess(round, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/rounds");
  }
}
