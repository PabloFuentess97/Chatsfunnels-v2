import { NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { getDashboardStats } from "@/services/analytics-service";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const stats = await getDashboardStats((session.user as any).id);
  return NextResponse.json({ success: true, data: stats });
}
