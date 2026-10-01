import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats
 * Dashboard aggregates: counts, top products by clicks (7d), recent clicks,
 * and data-quality notes.
 */
export async function GET() {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalProducts,
    publishedProducts,
    pendingProducts,
    trendingPublished,
    featuredProducts,
    articlesCount,
    comparisonsCount,
    merchantsCount,
    clicksToday,
    clicksWeek,
    subscribersCount,
    topClicks,
    recentClicks,
    noAffiliateUrl,
    noImages,
    unverified,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.product.count({ where: { status: "PENDING" } }),
    db.product.count({ where: { trendStatus: "PUBLISHED" } }),
    db.product.count({ where: { isFeatured: true } }),
    db.article.count(),
    db.comparison.count(),
    db.merchant.count(),
    db.clickEvent.count({ where: { createdAt: { gte: today } } }),
    db.clickEvent.count({ where: { createdAt: { gte: weekAgo } } }),
    db.newsletterSubscriber.count(),
    db.clickEvent.groupBy({
      by: ["productId"],
      where: { createdAt: { gte: weekAgo }, productId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    db.clickEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        product: { select: { id: true, title: true, slug: true } },
        merchant: { select: { id: true, name: true } },
      },
    }),
    db.product.count({ where: { status: "PUBLISHED", affiliateUrl: null } }),
    db.product.count({ where: { images: { none: {} } } }),
    db.product.count({ where: { dataSource: "UNAVAILABLE" } }),
  ]);

  const topProductIds = topClicks
    .map((c) => c.productId)
    .filter((id): id is string => id !== null);
  const topProducts = topProductIds.length
    ? await db.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const topById = new Map(topProducts.map((p) => [p.id, p]));

  return NextResponse.json({
    counts: {
      totalProducts,
      publishedProducts,
      pendingProducts,
      trendingPublished,
      featuredProducts,
      articlesCount,
      comparisonsCount,
      merchantsCount,
      clicksToday,
      clicksWeek,
      subscribersCount,
    },
    topProductsByClicks7d: topClicks.map((c) => ({
      productId: c.productId,
      product: c.productId ? topById.get(c.productId) ?? null : null,
      clicks: c._count.id,
    })),
    recentClicks,
    dataQuality: {
      publishedWithoutAffiliateUrl: noAffiliateUrl,
      productsWithoutImages: noImages,
      productsWithUnavailableSource: unverified,
    },
  });
}
