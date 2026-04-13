import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const pixels = await prisma.trackingPixel.findMany({
      where: { userId: getUserId(session) },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(pixels);
  } catch (error) {
    return apiServerError(error, "GET /api/tracking-pixels");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { name, type, pixelId, script, funnelId } = await req.json();
    const pixel = await prisma.trackingPixel.create({
      data: {
        userId: getUserId(session),
        name,
        type,
        pixelId: pixelId || "",
        script: script || null,
        funnelId: funnelId || null,
      },
    });

    return apiSuccess(pixel, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/tracking-pixels");
  }
}
