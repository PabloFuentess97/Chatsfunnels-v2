import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { addMemberToGroup, removeMemberFromGroup } from "@/services/round-service";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const { linkUrl } = await req.json();
    const member = await addMemberToGroup(id, getUserId(session), linkUrl);
    return apiSuccess(member, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/groups/[id]/members");
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
    const { userId } = await req.json();
    await removeMemberFromGroup(id, userId || getUserId(session));
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/groups/[id]/members");
  }
}
