import { NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const userId = (session.user as any).id;
  const [user, history] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
    prisma.credit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: { balance: user?.credits || 0, history },
  });
}
