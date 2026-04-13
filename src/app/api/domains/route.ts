import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const domains = await prisma.domain.findMany({
      where: { userId: getUserId(session) },
      include: { funnel: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(domains);
  } catch (error) {
    return apiServerError(error, "GET /api/domains");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { domain, funnelId } = await req.json();
    const d = await prisma.domain.create({
      data: {
        domain,
        userId: getUserId(session),
        funnelId: funnelId || null,
      },
    });
    return apiSuccess(d, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/domains");
  }
}
