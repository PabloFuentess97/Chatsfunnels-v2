import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { getFunnelAnalytics } from "@/services/analytics-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { funnelId } = await params;
  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "30");

  const analytics = await getFunnelAnalytics(funnelId, days);
  return NextResponse.json({ success: true, data: analytics });
}
