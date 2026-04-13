import prisma from "@/lib/prisma";
import { apiSuccess, apiServerError } from "@/lib/api-utils";

export async function GET() {
  try {
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

    return apiSuccess({ topUsers, topFunnels });
  } catch (error) {
    return apiServerError(error, "GET /api/ranking");
  }
}
