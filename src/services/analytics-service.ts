import prisma from "@/lib/prisma";

export async function getFunnelAnalytics(funnelId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalClicks, clicksByDay, clicksByCountry, clicksByDevice, topLinks] =
    await Promise.all([
      prisma.click.count({ where: { funnelId, createdAt: { gte: since } } }),

      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      prisma.$queryRaw<{ country: string; count: bigint }[]>`
        SELECT COALESCE(country, 'Unknown') as country, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      `,

      prisma.$queryRaw<{ device: string; count: bigint }[]>`
        SELECT COALESCE(device, 'Unknown') as device, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
        GROUP BY device
        ORDER BY count DESC
      `,

      prisma.link.findMany({
        where: { funnelId },
        select: { url: true, clicks: true },
        orderBy: { clicks: "desc" },
        take: 10,
      }),
    ]);

  return {
    totalClicks,
    clicksByDay: clicksByDay.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
    clicksByCountry: clicksByCountry.map((r) => ({
      country: r.country,
      count: Number(r.count),
    })),
    clicksByDevice: clicksByDevice.map((r) => ({
      device: r.device,
      count: Number(r.count),
    })),
    topLinks,
  };
}

export async function getDashboardStats(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [totalFunnels, totalClicks, totalLinks, user, recentClicks] =
    await Promise.all([
      prisma.funnel.count({ where: { userId } }),
      prisma.click.count({
        where: { funnel: { userId } },
      }),
      prisma.link.count({
        where: { funnel: { userId } },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(c."createdAt") as date, COUNT(*)::bigint as count
        FROM "Click" c
        JOIN "Funnel" f ON c."funnelId" = f.id
        WHERE f."userId" = ${userId} AND c."createdAt" >= ${since}
        GROUP BY DATE(c."createdAt")
        ORDER BY date ASC
      `,
    ]);

  return {
    totalFunnels,
    totalClicks,
    totalLinks,
    credits: user?.credits || 0,
    recentClicks: recentClicks.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
  };
}
