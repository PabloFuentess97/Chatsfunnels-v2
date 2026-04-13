import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { amount, description } = await req.json();

    if (!amount || typeof amount !== "number") {
      return NextResponse.json({ success: false, error: "Cantidad requerida" }, { status: 400 });
    }

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: { credits: { increment: amount } },
        select: { id: true, credits: true },
      });

      await tx.credit.create({
        data: {
          userId: id,
          amount,
          type: amount > 0 ? "BONUS" : "USAGE",
          description: description || (amount > 0 ? "Creditos agregados por admin" : "Creditos restados por admin"),
        },
      });

      return u;
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Admin credits error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
