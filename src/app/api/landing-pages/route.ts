import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 8);
}

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const pages = await prisma.landingPage.findMany({
    where: { userId: (session.user as any).id },
    include: { funnel: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: pages });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { name, funnelId, content, template } = await req.json();
  const slug = generateSlug(name || "page");

  const page = await prisma.landingPage.create({
    data: {
      name: name || "Untitled Page",
      userId: (session.user as any).id,
      funnelId: funnelId || null,
      content: content || template || [],
      slug,
    },
  });

  return NextResponse.json({ success: true, data: page }, { status: 201 });
}
