import { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/modules/auth/auth-guard";
import { createWebhook, getUserWebhooks, deleteWebhook } from "@/modules/webhooks/webhook-service";
import { apiSuccess, apiServerError, getUserId } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const webhooks = await getUserWebhooks(getUserId(session));
    return apiSuccess(webhooks);
  } catch (error) {
    return apiServerError(error, "GET /api/webhooks");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await req.json();
    const webhook = await createWebhook(getUserId(session), body);
    return apiSuccess(webhook, 201);
  } catch (error) {
    return apiServerError(error, "POST /api/webhooks");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await req.json();
    await deleteWebhook(id, getUserId(session));
    return apiSuccess(null);
  } catch (error) {
    return apiServerError(error, "DELETE /api/webhooks");
  }
}
