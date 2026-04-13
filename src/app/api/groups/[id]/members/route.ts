import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { addMemberToGroup, removeMemberFromGroup } from "@/services/round-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;
  const { linkUrl } = await req.json();
  try {
    const member = await addMemberToGroup(id, (session.user as any).id, linkUrl);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;
  const { userId } = await req.json();
  await removeMemberFromGroup(id, userId || (session.user as any).id);
  return NextResponse.json({ success: true });
}
