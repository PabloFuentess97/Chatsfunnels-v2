import prisma from "@/lib/prisma";
import { Link } from "@prisma/client";

interface RotationConfig {
  strategy: "weighted" | "least-clicks" | "priority" | "round-robin";
  clicksPerRound?: number;
}

export async function selectNextLink(
  funnelId: string,
  config?: RotationConfig
): Promise<Link | null> {
  const links = await prisma.link.findMany({
    where: { funnelId, isActive: true },
    orderBy: [{ priority: "desc" }, { order: "asc" }],
  });

  if (links.length === 0) return null;
  if (links.length === 1) return links[0];

  const strategy = config?.strategy || "weighted";

  switch (strategy) {
    case "least-clicks":
      return selectByLeastClicks(links);
    case "priority":
      return selectByPriority(links);
    case "round-robin":
      return selectRoundRobin(links, config?.clicksPerRound || 10);
    case "weighted":
    default:
      return selectByWeight(links);
  }
}

function selectByLeastClicks(links: Link[]): Link {
  // Find the minimum click count
  const minClicks = Math.min(...links.map((l) => l.clicks));
  // Get all links with the minimum clicks
  const candidates = links.filter((l) => l.clicks === minClicks);
  // Among those, pick the one with highest priority, then highest weight
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.weight - a.weight;
  });
  return candidates[0];
}

function selectByWeight(links: Link[]): Link {
  // Combine weight with inverse click ratio for balance
  const maxClicks = Math.max(...links.map((l) => l.clicks), 1);

  const scored = links.map((link) => {
    // Weight factor (higher weight = more traffic)
    const weightFactor = link.weight;
    // Click deficit factor (fewer clicks relative to max = higher score)
    const clickDeficit = 1 - link.clicks / (maxClicks + 1);
    // Priority bonus
    const priorityBonus = link.priority * 0.1;
    // Combined score
    const score = weightFactor * (1 + clickDeficit) + priorityBonus;
    return { link, score };
  });

  // Weighted random selection based on scores
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  let random = Math.random() * totalScore;

  for (const { link, score } of scored) {
    random -= score;
    if (random <= 0) return link;
  }

  return scored[scored.length - 1].link;
}

function selectByPriority(links: Link[]): Link {
  // Group by priority level
  const maxPriority = Math.max(...links.map((l) => l.priority));
  const topPriority = links.filter((l) => l.priority === maxPriority);

  // Among same priority, use least-clicks
  return selectByLeastClicks(topPriority);
}

function selectRoundRobin(links: Link[], clicksPerRound: number): Link {
  // Each link gets clicksPerRound clicks before moving to next
  const totalClicksInCycle = clicksPerRound * links.length;
  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  // Calculate current position in the cycle
  const totalClicks = sortedLinks.reduce((sum, l) => sum + l.clicks, 0);
  const positionInCycle = totalClicks % totalClicksInCycle;
  const currentLinkIndex = Math.floor(positionInCycle / clicksPerRound);

  return sortedLinks[currentLinkIndex % sortedLinks.length];
}

export async function recordClick(
  linkId: string,
  funnelId: string,
  clickData: {
    ip: string;
    country?: string;
    city?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    referer?: string;
    userId?: string;
  }
): Promise<void> {
  await prisma.$transaction([
    prisma.click.create({
      data: {
        linkId,
        funnelId,
        ...clickData,
      },
    }),
    prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    }),
  ]);
}
