import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { createGroup, getUserGroups } from "@/services/round-service";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const groups = await getUserGroups(getUserId(session));
    return apiSuccess(groups);
  } catch (error) {
    return apiServerError(error, "GET /api/groups");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await req.json();
    const group = await createGroup(getUserId(session), body);
    return apiSuccess(group, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/groups");
  }
}
