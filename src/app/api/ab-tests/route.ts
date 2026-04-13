import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const tests = await prisma.aBTest.findMany({
      where: { userId: getUserId(session) },
      include: {
        originalPage: { select: { id: true, name: true, slug: true } },
        variantPage: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(tests);
  } catch (error) {
    return apiServerError(error, "GET /api/ab-tests");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { name, originalPageId, variantPageId, trafficSplit } = await req.json();
    const userId = getUserId(session);

    // Verify ownership of both pages
    const pages = await prisma.landingPage.findMany({
      where: { id: { in: [originalPageId, variantPageId] }, userId },
    });

    if (pages.length !== 2) {
      return apiError("Both pages must belong to you", 400);
    }

    const test = await prisma.aBTest.create({
      data: {
        name,
        userId,
        originalPageId,
        variantPageId,
        trafficSplit: trafficSplit || 50,
      },
    });

    return apiSuccess(test, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/ab-tests");
  }
}
