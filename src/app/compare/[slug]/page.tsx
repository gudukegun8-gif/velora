import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd, comparisonJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ComparePageProps {
  params: { slug: string };
}

interface ComparedProduct {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  merchantName: string | null;
  imageUrl: string | null;
  attributes: Array<{ key: string; value: string }>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const comparison = await db.comparison.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, seoTitle: true, seoDescription: true, status: true },
  });
  if (!comparison || comparison.status !== "PUBLISHED") {
    return { title: "Comparison not found — VÉLORA" };
  }
  return {
    title: comparison.seoTitle || `${comparison.title} | VÉLORA`,
    description: comparison.seoDescription || comparison.description || undefined,
    alternates: { canonical: canonical(`/compare/${params.slug}`) },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const comparison = await db.comparison.findUnique({
    where: { slug: params.slug },
  });

  if (!comparison || comparison.status !== "PUBLISHED") {
    notFound();
  }

  const rows = await db.product.findMany({
    where: { id: { in: comparison.productIds }, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
      rating: true,
      reviewCount: true,
      merchant: { select: { name: true } },
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      attributes: { select: { key: true, value: true } },
    },
  });

  // Preserve the editor's ordering from productIds.
  const order = new Map(comparison.productIds.map((id, i) => [id, i]));
  const products: ComparedProduct[] = rows
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price !== null ? Number(p.price) : null,
      currency: p.currency ?? "USD",
      rating: p.rating,
      reviewCount: p.reviewCount,
      merchantName: p.merchant?.name ?? null,
      imageUrl: p.images[0]?.url ?? null,
      attributes: p.attributes,
    }));

  // Union of attribute keys across compared products (cap for readability).
  const attrKeys: string[] = [];
  const seen = new Set<string>();
  for (const p of products) {
    for (const a of p.attributes) {
      const lower = a.key.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        attrKeys.push(a.key);
      }
      if (attrKeys.length >= 8) break;
    }
    if (attrKeys.length >= 8) break;
  }

  const attrValue = (p: ComparedProduct, key: string): string => {
    const found = p.attributes.find((a) => a.key.toLowerCase() === key.toLowerCase());
    return found && found.value ? found.value : "—";
  };

  return (
    <>
      <Header />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Comparisons", path: "/guides?type=COMPARISON" },
          { name: comparison.title, path: `/compare/${comparison.slug}` },
        ])}
      />
      <JsonLd
        data={comparisonJsonLd({
          slug: comparison.slug,
          title: comparison.title,
          description: comparison.description,
          publishedAt: comparison.publishedAt,
          updatedAt: comparison.updatedAt,
        })}
      />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-ink/50">
              <li>
                <Link href="/" className="hover:text-golddeep">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                Comparison
              </li>
            </ol>
          </nav>

          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
            Side by Side
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {comparison.title}
          </h1>
          {comparison.description && (
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink/70">
              {comparison.description}
            </p>
          )}

          {products.length === 0 ? (
            <p className="mt-12 rounded-2xl border border-sand bg-white/60 p-10 text-center font-sans text-sm text-ink/60">
              The products in this comparison are no longer available. Browse our{" "}
              <Link href="/trending" className="font-semibold text-golddeep underline-offset-4 hover:underline">
                trending products
              </Link>{" "}
              instead.
            </p>
          ) : (
            <div className="mt-10 overflow-x-auto rounded-2xl border border-sand">
              <table className="w-full min-w-[720px] bg-white/70 font-sans text-sm">
                <thead>
                  <tr className="border-b border-sand">
                    <th scope="col" className="w-40 px-5 py-4 text-left align-bottom text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
                      <span className="sr-only">Feature</span>
                    </th>
                    {products.map((p) => (
                      <th key={p.id} scope="col" className="min-w-52 px-5 py-4 text-left align-top">
                        <Link href={`/products/${p.slug}`} className="group block">
                          <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
                                alt={p.title}
                                fill
                                sizes="240px"
                                loading="lazy"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal font-display text-4xl font-semibold text-gold"
                              >
                                {p.title.trim().charAt(0).toUpperCase() || "V"}
                              </span>
                            )}
                          </span>
                          <span className="mt-3 block font-display text-lg font-semibold leading-snug text-ink group-hover:text-golddeep">
                            {p.title}
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <Row label="Price">
                    {products.map((p) => (
                      <td key={p.id} className="px-5 py-4 align-top">
                        {p.price !== null ? (
                          <span className="text-base font-semibold text-ink">
                            {formatPrice(p.price, p.currency)}
                          </span>
                        ) : (
                          <span className="italic text-ink/50">—</span>
                        )}
                      </td>
                    ))}
                  </Row>
                  <Row label="Rating" striped>
                    {products.map((p) => (
                      <td key={p.id} className="px-5 py-4 align-top">
                        {p.rating !== null ? (
                          <span>
                            <span aria-hidden="true" className="text-golddeep">★</span>{" "}
                            {p.rating.toFixed(1)}
                            {p.reviewCount !== null && p.reviewCount > 0 && (
                              <span className="text-ink/50"> ({p.reviewCount.toLocaleString("en-US")})</span>
                            )}
                          </span>
                        ) : (
                          <span className="italic text-ink/50">—</span>
                        )}
                      </td>
                    ))}
                  </Row>
                  <Row label="Merchant">
                    {products.map((p) => (
                      <td key={p.id} className="px-5 py-4 align-top text-ink/75">
                        {p.merchantName ?? "—"}
                      </td>
                    ))}
                  </Row>
                  {attrKeys.map((key, i) => (
                    <Row key={key} label={key} striped={i % 2 === 0}>
                      {products.map((p) => (
                        <td key={p.id} className="px-5 py-4 align-top text-ink/75">
                          {attrValue(p, key)}
                        </td>
                      ))}
                    </Row>
                  ))}
                  <tr className="border-t border-sand">
                    <th scope="row" className="px-5 py-4 text-left align-top text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
                      <span className="sr-only">View</span>
                    </th>
                    {products.map((p) => (
                      <td key={p.id} className="px-5 py-4 align-top">
                        <Link
                          href={`/products/${p.slug}`}
                          className="inline-flex rounded-full border border-ink px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-golddeep hover:text-golddeep"
                        >
                          View Product
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <p className="mx-auto mt-10 max-w-2xl text-center font-sans text-xs leading-relaxed text-ink/50">
            VÉLORA is a product discovery publication — we don&apos;t sell these products. Prices and
            availability are set by the merchants and may change.{" "}
            <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-golddeep">
              Read our affiliate disclosure
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({
  label,
  striped,
  children,
}: {
  label: string;
  striped?: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr className={striped ? "bg-stone-50/70" : undefined}>
      <th
        scope="row"
        className="px-5 py-4 text-left align-top text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}
