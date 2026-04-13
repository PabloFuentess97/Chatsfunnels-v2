import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const page = await prisma.landingPage.findFirst({
      where: { id, userId: getUserId(session) },
      include: { funnel: { select: { id: true, name: true, slug: true } } },
    });

    if (!page) {
      return apiError("Not found", 404);
    }

    return apiSuccess(page);
  } catch (error) {
    return apiServerError(error, "GET /api/landing-pages/[id]");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();

    const page = await prisma.landingPage.update({
      where: { id, userId: getUserId(session) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.published !== undefined && { published: body.published }),
        ...(body.funnelId !== undefined && { funnelId: body.funnelId || null }),
      },
    });

    return apiSuccess(page);
  } catch (error) {
    return apiServerError(error, "PUT /api/landing-pages/[id]");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    await prisma.landingPage.delete({
      where: { id, userId: getUserId(session) },
    });
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/landing-pages/[id]");
  }
}
