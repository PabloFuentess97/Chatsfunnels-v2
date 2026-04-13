import prisma from "@/lib/prisma";

export async function getFunnelAnalytics(funnelId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const previousStart = new Date(since);
  previousStart.setDate(previousStart.getDate() - days);

  const [
    totalClicks,
    previousClicks,
    clicksByDay,
    clicksByHour,
    clicksByCountry,
    clicksByDevice,
    clicksByBrowser,
    clicksByOS,
    topLinks,
    recentClicksList,
  ] = await Promise.all([
    prisma.click.count({
      where: { funnelId, createdAt: { gte: since } },
    }),

    prisma.click.count({
      where: { funnelId, createdAt: { gte: previousStart, lt: since } },
    }),

    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "Click"
      WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    prisma.$queryRaw<{ hour: number; count: bigint }[]>`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::bigint as count
      FROM "Click"
      WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
      GROUP BY hour
      ORDER BY hour ASC
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

    prisma.$queryRaw<{ browser: string; count: bigint }[]>`
      SELECT COALESCE(browser, 'Unknown') as browser, COUNT(*)::bigint as count
      FROM "Click"
      WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 8
    `,

    prisma.$queryRaw<{ os: string; count: bigint }[]>`
      SELECT COALESCE(os, 'Unknown') as os, COUNT(*)::bigint as count
      FROM "Click"
      WHERE "funnelId" = ${funnelId} AND "createdAt" >= ${since}
      GROUP BY os
      ORDER BY count DESC
      LIMIT 8
    `,

    prisma.link.findMany({
      where: { funnelId },
      select: { id: true, url: true, clicks: true, weight: true, priority: true },
      orderBy: { clicks: "desc" },
      take: 10,
    }),

    prisma.click.findMany({
      where: { funnelId, createdAt: { gte: since } },
      select: {
        id: true,
        ip: true,
        country: true,
        device: true,
        browser: true,
        referer: true,
        createdAt: true,
        link: { select: { url: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const trend = previousClicks > 0
    ? Math.round(((totalClicks - previousClicks) / previousClicks) * 100)
    : totalClicks > 0 ? 100 : 0;

  // Fill in missing hours (0-23)
  const hourMap = new Map(clicksByHour.map((h) => [h.hour, Number(h.count)]));
  const fullHourly = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i.toString().padStart(2, "0")}:00`,
    count: hourMap.get(i) || 0,
  }));

  return {
    totalClicks,
    previousClicks,
    trend,
    clicksByDay: clicksByDay.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
    clicksByHour: fullHourly,
    clicksByCountry: clicksByCountry.map((r) => ({
      country: r.country,
      count: Number(r.count),
    })),
    clicksByDevice: clicksByDevice.map((r) => ({
      device: r.device,
      count: Number(r.count),
    })),
    clicksByBrowser: clicksByBrowser.map((r) => ({
      browser: r.browser,
      count: Number(r.count),
    })),
    clicksByOS: clicksByOS.map((r) => ({
      os: r.os,
      count: Number(r.count),
    })),
    topLinks,
    recentClicks: recentClicksList.map((c) => ({
      id: c.id,
      ip: c.ip,
      country: c.country,
      device: c.device,
      browser: c.browser,
      referer: c.referer,
      url: c.link.url,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function getDashboardStats(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const previousStart = new Date(since);
  previousStart.setDate(previousStart.getDate() - 30);

  const [
    totalFunnels,
    totalClicks,
    previousTotalClicks,
    totalLinks,
    user,
    recentClicks,
    topFunnels,
    clicksByDevice,
    clicksByCountry,
  ] = await Promise.all([
    prisma.funnel.count({ where: { userId } }),

    prisma.click.count({
      where: { funnel: { userId }, createdAt: { gte: since } },
    }),

    prisma.click.count({
      where: { funnel: { userId }, createdAt: { gte: previousStart, lt: since } },
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

    prisma.funnel.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        _count: { select: { clicks: true, links: true } },
      },
      orderBy: { clicks: { _count: "desc" } },
      take: 5,
    }),

    prisma.$queryRaw<{ device: string; count: bigint }[]>`
      SELECT COALESCE(c.device, 'Unknown') as device, COUNT(*)::bigint as count
      FROM "Click" c
      JOIN "Funnel" f ON c."funnelId" = f.id
      WHERE f."userId" = ${userId} AND c."createdAt" >= ${since}
      GROUP BY c.device
      ORDER BY count DESC
    `,

    prisma.$queryRaw<{ country: string; count: bigint }[]>`
      SELECT COALESCE(c.country, 'Unknown') as country, COUNT(*)::bigint as count
      FROM "Click" c
      JOIN "Funnel" f ON c."funnelId" = f.id
      WHERE f."userId" = ${userId} AND c."createdAt" >= ${since}
      GROUP BY c.country
      ORDER BY count DESC
      LIMIT 8
    `,
  ]);

  const clicksTrend = previousTotalClicks > 0
    ? Math.round(((totalClicks - previousTotalClicks) / previousTotalClicks) * 100)
    : totalClicks > 0 ? 100 : 0;

  return {
    totalFunnels,
    totalClicks,
    totalLinks,
    credits: user?.credits || 0,
    clicksTrend,
    recentClicks: recentClicks.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
    topFunnels: topFunnels.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      isActive: f.isActive,
      clicks: f._count.clicks,
      links: f._count.links,
    })),
    clicksByDevice: clicksByDevice.map((r) => ({
      device: r.device,
      count: Number(r.count),
    })),
    clicksByCountry: clicksByCountry.map((r) => ({
      country: r.country,
      count: Number(r.count),
    })),
  };
}
