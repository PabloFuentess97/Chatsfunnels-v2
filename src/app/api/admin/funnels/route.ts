import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] }
      : {};

    const [funnels, total] = await Promise.all([
      prisma.funnel.findMany({
        where,
        select: {
          id: true, name: true, slug: true, isActive: true, createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { clicks: true, links: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.funnel.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { funnels, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin funnels error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
