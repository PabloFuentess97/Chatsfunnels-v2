import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicPageClient from "./client";

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try by ID first, then by slug
  const page = await prisma.landingPage.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      published: true,
    },
    include: {
      funnel: { select: { slug: true } },
      user: {
        select: {
          trackingPixels: {
            where: { funnelId: null },
            select: { type: true, pixelId: true, script: true },
          },
        },
      },
    },
  });

  if (!page) notFound();

  const pixels = page.user.trackingPixels;
  const funnelSlug = page.funnel?.slug || null;

  return (
    <PublicPageClient
      blocks={page.content as any[]}
      pixels={pixels}
      funnelSlug={funnelSlug}
    />
  );
}
