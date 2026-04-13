import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const userId = getUserId(session);
    const [user, history] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
      prisma.credit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return apiSuccess({ balance: user?.credits || 0, history });
  } catch (error) {
    return apiServerError(error, "GET /api/credits");
  }
}
