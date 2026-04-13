import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { createWebhook, getUserWebhooks, deleteWebhook } from "@/modules/webhooks/webhook-service";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const webhooks = await getUserWebhooks((session.user as any).id);
  return NextResponse.json({ success: true, data: webhooks });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await req.json();
  const webhook = await createWebhook((session.user as any).id, body);
  return NextResponse.json({ success: true, data: webhook }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await req.json();
  await deleteWebhook(id, (session.user as any).id);
  return NextResponse.json({ success: true });
}
