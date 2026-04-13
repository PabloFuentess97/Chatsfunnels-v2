import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiServerError, getUserId } from "@/lib/api-utils";

// Public endpoint for form submissions from landing pages
export async function POST(req: NextRequest) {
  try {
    const { landingPageId, formBlockId, data } = await req.json();

    if (!landingPageId || !formBlockId || !data) {
      return apiError("Missing fields", 400);
    }

    const submission = await prisma.formSubmission.create({
      data: {
        landingPageId,
        formBlockId,
        data,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    return apiSuccess({ id: submission.id }, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/form-submissions");
  }
}

// Authenticated endpoint to list submissions for a user's pages
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const url = new URL(req.url);
    const pageId = url.searchParams.get("pageId");

    if (!pageId) {
      return apiError("pageId required", 400);
    }

    // Verify ownership
    const page = await prisma.landingPage.findFirst({
      where: { id: pageId, userId: getUserId(session) },
    });

    if (!page) {
      return apiError("Not found", 404);
    }

    const submissions = await prisma.formSubmission.findMany({
      where: { landingPageId: pageId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess(submissions);
  } catch (error) {
    return apiServerError(error, "GET /api/form-submissions");
  }
}
