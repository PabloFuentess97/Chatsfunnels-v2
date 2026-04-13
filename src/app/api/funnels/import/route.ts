import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { importFunnel } from "@/services/funnel-service";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await req.json();
    const funnel = await importFunnel(getUserId(session), body);
    return apiSuccess(funnel, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/funnels/import");
  }
}
