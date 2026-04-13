import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { createFunnel, getUserFunnels } from "@/services/funnel-service";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const funnels = await getUserFunnels(getUserId(session));
    return apiSuccess(funnels);
  } catch (error) {
    return apiServerError(error, "GET /api/funnels");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await req.json();
    const funnel = await createFunnel(getUserId(session), body);
    return apiSuccess(funnel, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/funnels");
  }
}
