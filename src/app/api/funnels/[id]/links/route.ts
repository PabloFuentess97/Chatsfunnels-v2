import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { addLink } from "@/services/funnel-service";
import { apiSuccess, apiServerError } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const link = await addLink(id, body);
    return apiSuccess(link, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/funnels/[id]/links");
  }
}
