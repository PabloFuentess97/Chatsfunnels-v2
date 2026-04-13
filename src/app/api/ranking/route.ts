import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const [topUsers, topFunnels] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { funnels: true } },
      },
      orderBy: { funnels: { _count: "desc" } },
      take: 20,
    }),
    prisma.funnel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        user: { select: { name: true } },
        _count: { select: { clicks: true } },
      },
      orderBy: { clicks: { _count: "desc" } },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: { topUsers, topFunnels },
  });
}
