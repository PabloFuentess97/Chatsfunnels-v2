import { NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const [totalUsers, totalFunnels, totalClicks, totalPages, activeUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.funnel.count(),
      prisma.click.count(),
      prisma.landingPage.count(),
      prisma.user.count({ where: { funnels: { some: {} } } }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, credits: true, createdAt: true, _count: { select: { funnels: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const totalCredits = await prisma.user.aggregate({ _sum: { credits: true } });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalFunnels,
        totalClicks,
        totalPages,
        activeUsers,
        totalCredits: totalCredits._sum.credits || 0,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
