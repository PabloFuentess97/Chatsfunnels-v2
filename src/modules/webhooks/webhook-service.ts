import prisma from "@/lib/prisma";
import { WebhookEvent } from "@/types";

export async function triggerWebhook(
  userId: string,
  event: WebhookEvent
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      userId,
      isActive: true,
      events: { has: event.type },
    },
  });

  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhook.secret,
          "X-Webhook-Event": event.type,
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error(`Webhook delivery failed for ${webhook.id}:`, error);
    }
  }
}

export async function createWebhook(
  userId: string,
  data: { url: string; events: string[] }
) {
  const secret = crypto.randomUUID();
  return prisma.webhook.create({
    data: {
      userId,
      url: data.url,
      events: data.events,
      secret,
    },
  });
}

export async function getUserWebhooks(userId: string) {
  return prisma.webhook.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteWebhook(id: string, userId: string) {
  return prisma.webhook.delete({ where: { id, userId } });
}
