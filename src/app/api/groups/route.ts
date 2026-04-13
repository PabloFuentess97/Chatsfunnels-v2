import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { createGroup, getUserGroups } from "@/services/round-service";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const groups = await getUserGroups((session.user as any).id);
  return NextResponse.json({ success: true, data: groups });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await req.json();
  const group = await createGroup((session.user as any).id, body);
  return NextResponse.json({ success: true, data: group }, { status: 201 });
}
