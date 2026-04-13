import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function createFunnel(
  userId: string,
  data: { name: string; description?: string; clicksPerRound?: number }
) {
  const slug = generateSlug(data.name);

  // Check credits
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.credits < 10) {
    throw new Error("Insufficient credits to create a funnel");
  }

  const funnel = await prisma.$transaction(async (tx) => {
    const f = await tx.funnel.create({
      data: {
        name: data.name,
        slug,
        description: data.description || "",
        userId,
        clicksPerRound: data.clicksPerRound || 10,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: 10 } },
    });

    await tx.credit.create({
      data: {
        userId,
        amount: -10,
        type: "USAGE",
        description: `Created funnel: ${data.name}`,
      },
    });

    return f;
  });

  return funnel;
}

export async function getUserFunnels(userId: string) {
  return prisma.funnel.findMany({
    where: { userId },
    include: {
      links: { orderBy: { order: "asc" } },
      _count: { select: { clicks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFunnelById(id: string, userId: string) {
  return prisma.funnel.findFirst({
    where: { id, userId },
    include: {
      links: { orderBy: { order: "asc" } },
      _count: { select: { clicks: true } },
    },
  });
}

export async function getFunnelBySlug(slug: string) {
  return prisma.funnel.findUnique({
    where: { slug },
    include: {
      links: { where: { isActive: true }, orderBy: { order: "asc" } },
    },
  });
}

export async function updateFunnel(
  id: string,
  userId: string,
  data: { name?: string; description?: string; isActive?: boolean; clicksPerRound?: number }
) {
  return prisma.funnel.update({
    where: { id, userId },
    data,
  });
}

export async function deleteFunnel(id: string, userId: string) {
  return prisma.funnel.delete({
    where: { id, userId },
  });
}

export async function addLink(
  funnelId: string,
  data: { url: string; weight?: number; priority?: number }
) {
  const lastLink = await prisma.link.findFirst({
    where: { funnelId },
    orderBy: { order: "desc" },
  });

  return prisma.link.create({
    data: {
      url: data.url,
      funnelId,
      order: (lastLink?.order || 0) + 1,
      weight: data.weight || 1.0,
      priority: data.priority || 0,
    },
  });
}

export async function updateLink(
  id: string,
  data: { url?: string; weight?: number; priority?: number; order?: number; isActive?: boolean }
) {
  return prisma.link.update({
    where: { id },
    data,
  });
}

export async function deleteLink(id: string) {
  return prisma.link.delete({ where: { id } });
}

export async function exportFunnel(id: string, userId: string) {
  const funnel = await prisma.funnel.findFirst({
    where: { id, userId },
    include: { links: true },
  });

  if (!funnel) throw new Error("Funnel not found");

  return {
    name: funnel.name,
    description: funnel.description,
    clicksPerRound: funnel.clicksPerRound,
    links: funnel.links.map((l) => ({
      url: l.url,
      order: l.order,
      weight: l.weight,
      priority: l.priority,
    })),
  };
}

export async function importFunnel(
  userId: string,
  data: {
    name: string;
    description?: string;
    clicksPerRound?: number;
    links: { url: string; order: number; weight: number; priority: number }[];
  }
) {
  const slug = generateSlug(data.name);

  return prisma.funnel.create({
    data: {
      name: data.name,
      slug,
      description: data.description || "",
      userId,
      clicksPerRound: data.clicksPerRound || 10,
      links: {
        create: data.links.map((l) => ({
          url: l.url,
          order: l.order,
          weight: l.weight || 1.0,
          priority: l.priority || 0,
        })),
      },
    },
    include: { links: true },
  });
}
