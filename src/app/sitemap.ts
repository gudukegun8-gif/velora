import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "/",
  "/trending",
  "/about",
  "/affiliate-disclosure",
  "/privacy",
  "/terms",
  "/contact",
  "/editorial-policy",
  "/guides",
];

function fallbackSitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = fallbackSitemap();

  try {
    const [products, articles, comparisons, categories] = await Promise.all([
      db.product.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      db.comparison.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({
        // Only collections that actually render products: a category page
        // shows its own products plus its children's, so mirror that here.
        // Empty collections (no curated picks yet) stay out of the sitemap.
        where: {
          OR: [
            { products: { some: { status: "PUBLISHED" } } },
            { children: { some: { products: { some: { status: "PUBLISHED" } } } } },
          ],
        },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    for (const p of products) {
      entries.push({
        url: absoluteUrl(`/products/${p.slug}`),
        lastModified: p.updatedAt,
      });
    }
    for (const a of articles) {
      entries.push({
        url: absoluteUrl(`/guides/${a.slug}`),
        lastModified: a.updatedAt,
      });
    }
    for (const c of comparisons) {
      entries.push({
        url: absoluteUrl(`/compare/${c.slug}`),
        lastModified: c.updatedAt,
      });
    }
    for (const c of categories) {
      entries.push({
        url: absoluteUrl(`/c/${c.slug}`),
        lastModified: c.updatedAt,
      });
    }

    return entries;
  } catch {
    // Build must pass without DATABASE_URL — fall back to static routes only.
    return fallbackSitemap();
  }
}
