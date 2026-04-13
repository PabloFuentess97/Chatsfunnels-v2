import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import prisma from "@/lib/prisma";

// Public endpoint for form submissions from landing pages
export async function POST(req: NextRequest) {
  try {
    const { landingPageId, formBlockId, data } = await req.json();

    if (!landingPageId || !formBlockId || !data) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
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

    return NextResponse.json({ success: true, data: { id: submission.id } }, { status: 201 });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}

// Authenticated endpoint to list submissions for a user's pages
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const url = new URL(req.url);
  const pageId = url.searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json({ success: false, error: "pageId required" }, { status: 400 });
  }

  // Verify ownership
  const page = await prisma.landingPage.findFirst({
    where: { id: pageId, userId: (session.user as any).id },
  });

  if (!page) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const submissions = await prisma.formSubmission.findMany({
    where: { landingPageId: pageId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: submissions });
}
