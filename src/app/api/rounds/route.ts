import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { startRound } from "@/services/round-service";

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { groupId, maxClicks } = await req.json();
  try {
    const round = await startRound(groupId, maxClicks || 100);
    return NextResponse.json({ success: true, data: round }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
