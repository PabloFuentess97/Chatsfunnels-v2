import prisma from "@/lib/prisma";
import { Link } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export type RotationStrategy =
  | "adaptive"       // Smart: combines weight + deficit + priority (default)
  | "least-clicks"   // Always picks the link with fewest clicks
  | "weighted"       // Pure weight-based probabilistic selection
  | "priority"       // Priority tiers, then least-clicks within tier
  | "round-robin";   // Strict sequential rotation

export interface RotationConfig {
  strategy: RotationStrategy;
  clicksPerRound?: number;
}

// ─── Link Cache (avoids DB read on every redirect) ─────────────────────────

interface CachedLinks {
  links: Link[];
  fetchedAt: number;
}

const linkCache = new Map<string, CachedLinks>();
const CACHE_TTL_MS = 5_000; // 5 second TTL

async function getActiveLinks(funnelId: string): Promise<Link[]> {
  const now = Date.now();
  const cached = linkCache.get(funnelId);

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.links;
  }

  const links = await prisma.link.findMany({
    where: { funnelId, isActive: true },
    orderBy: [{ priority: "desc" }, { order: "asc" }],
  });

  linkCache.set(funnelId, { links, fetchedAt: now });
  return links;
}

export function invalidateCache(funnelId: string): void {
  linkCache.delete(funnelId);
}

export function invalidateAllCaches(): void {
  linkCache.clear();
}

// ─── Main Entry Point ──────────────────────────────────────────────────────

export async function selectNextLink(
  funnelId: string,
  config?: RotationConfig
): Promise<Link | null> {
  const links = await getActiveLinks(funnelId);

  if (links.length === 0) return null;
  if (links.length === 1) return links[0];

  const strategy = config?.strategy ?? "adaptive";

  switch (strategy) {
    case "least-clicks":
      return selectByLeastClicks(links);
    case "weighted":
      return selectByPureWeight(links);
    case "priority":
      return selectByPriority(links);
    case "round-robin":
      return selectRoundRobin(links, config?.clicksPerRound ?? 10);
    case "adaptive":
    default:
      return selectAdaptive(links);
  }
}

// ─── Strategy: Adaptive Weighted Fair Queuing ──────────────────────────────
// Combines weight, click deficit, and priority into a single score.
// Uses softmax normalization to convert scores to probabilities,
// ensuring no link is fully starved while high-weight links get proportionally more traffic.

function selectAdaptive(links: Link[]): Link {
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const avgClicks = totalClicks / links.length || 1;
  const totalWeight = links.reduce((sum, l) => sum + l.weight, 0);
  const maxPriority = Math.max(...links.map((l) => l.priority));

  const scores = links.map((link) => {
    // 1. Weight ratio: how much of total weight this link represents
    const weightRatio = link.weight / totalWeight;

    // 2. Click deficit: how far behind this link is vs its fair share
    //    fair share = totalClicks * (weight / totalWeight)
    const fairShare = totalClicks * weightRatio;
    const deficit = Math.max(0, fairShare - link.clicks);
    const deficitScore = deficit / (avgClicks + 1); // normalized

    // 3. Priority boost (exponential to strongly favor high-priority)
    const priorityScore = maxPriority > 0
      ? Math.pow(2, link.priority) / Math.pow(2, maxPriority)
      : 1;

    // Combined score: base weight + deficit correction + priority
    const score = weightRatio * 2 + deficitScore * 3 + priorityScore * 0.5;

    return score;
  });

  // Softmax-like normalization for smooth probability distribution
  // Use temperature to control how "sharp" the distribution is
  const temperature = 1.5;
  const maxScore = Math.max(...scores);
  const expScores = scores.map((s) => Math.exp((s - maxScore) / temperature));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probabilities = expScores.map((e) => e / sumExp);

  // Weighted random selection using cumulative distribution
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < links.length; i++) {
    cumulative += probabilities[i];
    if (random <= cumulative) return links[i];
  }

  return links[links.length - 1];
}

// ─── Strategy: Least Clicks ────────────────────────────────────────────────
// Deterministic: always pick the link with fewest clicks.
// Tiebreaker: highest priority, then highest weight.

function selectByLeastClicks(links: Link[]): Link {
  let best = links[0];
  for (let i = 1; i < links.length; i++) {
    const l = links[i];
    if (
      l.clicks < best.clicks ||
      (l.clicks === best.clicks && l.priority > best.priority) ||
      (l.clicks === best.clicks && l.priority === best.priority && l.weight > best.weight)
    ) {
      best = l;
    }
  }
  return best;
}

// ─── Strategy: Pure Weight ─────────────────────────────────────────────────
// Purely probabilistic based on weight. Ignores click counts entirely.

function selectByPureWeight(links: Link[]): Link {
  const totalWeight = links.reduce((sum, l) => sum + l.weight, 0);
  let random = Math.random() * totalWeight;

  for (const link of links) {
    random -= link.weight;
    if (random <= 0) return link;
  }

  return links[links.length - 1];
}

// ─── Strategy: Priority Tiers ──────────────────────────────────────────────
// Groups links by priority. Only considers the highest-priority tier.
// Within the tier, uses least-clicks for fair distribution.

function selectByPriority(links: Link[]): Link {
  const maxPriority = Math.max(...links.map((l) => l.priority));
  const topTier = links.filter((l) => l.priority === maxPriority);
  return selectByLeastClicks(topTier);
}

// ─── Strategy: Round Robin ─────────────────────────────────────────────────
// Each link gets exactly `clicksPerRound` clicks before rotating.
// Deterministic ordering by `order` field.

function selectRoundRobin(links: Link[], clicksPerRound: number): Link {
  const sorted = [...links].sort((a, b) => a.order - b.order);
  const cycleLength = clicksPerRound * sorted.length;
  const totalClicks = sorted.reduce((sum, l) => sum + l.clicks, 0);
  const position = totalClicks % cycleLength;
  const index = Math.floor(position / clicksPerRound) % sorted.length;
  return sorted[index];
}

// ─── Click Recording (optimized with parallel writes) ──────────────────────

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
  // Run click insert and link counter update in parallel within a transaction
  await prisma.$transaction([
    prisma.click.create({
      data: { linkId, funnelId, ...clickData },
    }),
    prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    }),
  ]);

  // Update the cached click count so subsequent requests
  // within the TTL window see the updated value
  const cached = linkCache.get(funnelId);
  if (cached) {
    const link = cached.links.find((l) => l.id === linkId);
    if (link) link.clicks += 1;
  }
}
