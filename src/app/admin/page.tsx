import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Card, PageHeader, StatCard, Badge, EmptyState, btnGhostCls } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — VÉLORA Admin",
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function sevenDaysAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const today = startOfToday();
  const weekAgo = sevenDaysAgo();

  const [
    totalProducts,
    publishedProducts,
    pendingProducts,
    trendingPublished,
    featuredProducts,
    articlesCount,
    clicksToday,
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
    db.clickEvent.count({ where: { createdAt: { gte: today } } }),
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
      include: { product: { select: { title: true, slug: true } }, merchant: { select: { name: true } } },
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
        select: { id: true, title: true, slug: true, price: true, currency: true },
      })
    : [];
  const topById = new Map(topProducts.map((p) => [p.id, p]));

  const stats = [
    { label: "Total Products", value: totalProducts, href: "/admin/products" },
    { label: "Published", value: publishedProducts, href: "/admin/products?status=PUBLISHED" },
    { label: "Pending Review", value: pendingProducts, href: "/admin/products?status=PENDING" },
    { label: "Trending Published", value: trendingPublished, href: "/admin/trending" },
    { label: "Featured", value: featuredProducts, href: "/admin/products" },
    { label: "Articles", value: articlesCount, href: "/admin/articles" },
    { label: "Clicks Today", value: clicksToday, href: "/admin/clicks" },
    { label: "Subscribers", value: subscribersCount, href: "/admin/subscribers" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Catalog health, traffic and content at a glance."
        actions={
          <Link href="/admin/products/new" className={btnGhostCls}>
            Add Product
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <StatCard label={s.label} value={s.value} />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Top Products by Clicks</h2>
          <p className="mb-4 text-xs text-ink/50">Last 7 days</p>
          {topClicks.length === 0 ? (
            <p className="text-sm text-ink/50">No click data yet.</p>
          ) : (
            <ul className="divide-y divide-sand">
              {topClicks.map((c) => {
                const p = c.productId ? topById.get(c.productId) : undefined;
                return (
                  <li key={c.productId ?? "none"} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      {p ? (
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="block truncate text-sm font-medium text-ink hover:text-golddeep"
                        >
                          {p.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-ink/50">Unknown product</span>
                      )}
                      <span className="text-xs text-ink/50">
                        {p?.price != null
                          ? formatPrice(Number(p.price), p.currency ?? "USD")
                          : "No price"}
                      </span>
                    </div>
                    <Badge tone="gold">{c._count.id} clicks</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Recent Clicks</h2>
          <p className="mb-4 text-xs text-ink/50">Latest affiliate click-throughs</p>
          {recentClicks.length === 0 ? (
            <p className="text-sm text-ink/50">No clicks recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand text-left text-xs uppercase tracking-wide text-ink/50">
                    <th className="py-2 pr-3 font-semibold">Product</th>
                    <th className="py-2 pr-3 font-semibold">Merchant</th>
                    <th className="py-2 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {recentClicks.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 pr-3 text-ink">
                        {c.product ? c.product.title : "—"}
                      </td>
                      <td className="py-2 pr-3 text-ink/70">{c.merchant?.name ?? "—"}</td>
                      <td className="whitespace-nowrap py-2 text-ink/60">
                        {c.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Data Quality Notes</h2>
        <p className="mb-4 text-xs text-ink/50">Items that may need attention</p>
        {noAffiliateUrl === 0 && noImages === 0 && unverified === 0 ? (
          <EmptyState title="Catalog looks healthy" hint="No missing affiliate links, images or unverified sources found." />
        ) : (
          <ul className="space-y-2 text-sm">
            {noAffiliateUrl > 0 && (
              <li className="flex items-center justify-between rounded-md bg-gold/10 px-4 py-3">
                <span className="text-ink">
                  {noAffiliateUrl} published product{noAffiliateUrl === 1 ? "" : "s"} without an
                  affiliate URL
                </span>
                <Link href="/admin/products?status=PUBLISHED" className={btnGhostCls + " px-3 py-1.5"}>
                  Review
                </Link>
              </li>
            )}
            {noImages > 0 && (
              <li className="flex items-center justify-between rounded-md bg-gold/10 px-4 py-3">
                <span className="text-ink">
                  {noImages} product{noImages === 1 ? "" : "s"} without any images
                </span>
                <Link href="/admin/products" className={btnGhostCls + " px-3 py-1.5"}>
                  Review
                </Link>
              </li>
            )}
            {unverified > 0 && (
              <li className="flex items-center justify-between rounded-md bg-gold/10 px-4 py-3">
                <span className="text-ink">
                  {unverified} product{unverified === 1 ? "" : "s"} with unavailable data source
                </span>
                <Link href="/admin/trending" className={btnGhostCls + " px-3 py-1.5"}>
                  Review
                </Link>
              </li>
            )}
          </ul>
        )}
      </Card>
    </div>
  );
}
