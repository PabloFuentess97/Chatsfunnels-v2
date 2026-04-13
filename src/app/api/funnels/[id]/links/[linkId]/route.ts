import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { updateLink, deleteLink } from "@/services/funnel-service";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { linkId } = await params;
  const body = await req.json();
  try {
    const link = await updateLink(linkId, body);
    return NextResponse.json({ success: true, data: link });
  } catch {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { linkId } = await params;
  try {
    await deleteLink(linkId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
}
