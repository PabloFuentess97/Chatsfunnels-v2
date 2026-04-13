import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { createFunnel, getUserFunnels } from "@/services/funnel-service";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const funnels = await getUserFunnels((session.user as any).id);
  return NextResponse.json({ success: true, data: funnels });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const funnel = await createFunnel((session.user as any).id, body);
    return NextResponse.json({ success: true, data: funnel }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
