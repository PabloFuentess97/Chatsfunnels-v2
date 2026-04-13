import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 8);
}

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const pages = await prisma.landingPage.findMany({
      where: { userId: getUserId(session) },
      include: { funnel: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return apiSuccess(pages);
  } catch (error) {
    return apiServerError(error, "GET /api/landing-pages");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { name, funnelId, content, template } = await req.json();
    const slug = generateSlug(name || "page");

    const page = await prisma.landingPage.create({
      data: {
        name: name || "Untitled Page",
        userId: getUserId(session),
        funnelId: funnelId || null,
        content: content || template || [],
        slug,
      },
    });

    return apiSuccess(page, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/landing-pages");
  }
}
