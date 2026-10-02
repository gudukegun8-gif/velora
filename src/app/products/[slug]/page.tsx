import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { discountPercent, formatPrice, truncate } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TrackView } from "@/components/site/TrackView";
import { Badge } from "@/components/ui/Badge";
import { SaveButton } from "@/components/site/SaveButton";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardProductSelect, toCardProduct } from "@/lib/card-product";
import { JsonLd } from "@/components/site/JsonLd";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { slug: string };
}

function genderLabel(g: string | null | undefined): string | null {
  if (g === "WOMEN") return "Women";
  if (g === "MEN") return "Men";
  if (g === "UNISEX") return "Unisex";
  return null;
}

/** Normalize the specifications JSON into key/value rows. Never invents values. */
function specRows(
  specifications: unknown,
  attributes: Array<{ key: string; value: string }>
): Array<{ key: string; value: string }> {
  const rows: Array<{ key: string; value: string }> = attributes.map((a) => ({
    key: a.key,
    value: a.value,
  }));
  const seen = new Set(rows.map((r) => r.key.toLowerCase()));

  const push = (key: string, value: unknown) => {
    if (!key || value === null || value === undefined || value === "") return;
    const k = String(key);
    if (seen.has(k.toLowerCase())) return;
    seen.add(k.toLowerCase());
    rows.push({
      key: k,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
    });
  };

  if (specifications && typeof specifications === "object") {
    if (Array.isArray(specifications)) {
      for (const item of specifications) {
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const key = rec.key ?? rec.name ?? rec.label ?? rec.attribute;
          const value = rec.value ?? rec.val;
          if (typeof key === "string") push(key, value);
        }
      }
    } else {
      for (const [key, value] of Object.entries(specifications as Record<string, unknown>)) {
        push(key, value);
      }
    }
  }

  return rows;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      shortDescription: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
    },
  });
  if (!product || product.status !== "PUBLISHED") {
    return { title: "Product not found — VÉLORA" };
  }
  const description =
    product.seoDescription ||
    product.shortDescription ||
    (product.description ? truncate(product.description, 160) : undefined);
  return {
    title: product.seoTitle || `${product.title} | VÉLORA`,
    description,
    alternates: { canonical: canonical(`/products/${params.slug}`) },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      description: true,
      gender: true,
      fitnessGoal: true,
      productType: true,
      price: true,
      originalPrice: true,
      currency: true,
      rating: true,
      reviewCount: true,
      affiliateUrl: true,
      isFeatured: true,
      trendStatus: true,
      status: true,
      specifications: true,
      categoryId: true,
      category: {
        select: {
          slug: true,
          name: true,
          parent: { select: { slug: true, name: true } },
        },
      },
      merchant: { select: { name: true, website: true } },
      images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" } },
      attributes: { select: { key: true, value: true } },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  const price = product.price !== null ? Number(product.price) : null;
  const originalPrice = product.originalPrice !== null ? Number(product.originalPrice) : null;
  const currency = product.currency ?? "USD";
  const discount = price !== null && originalPrice !== null ? discountPercent(price, originalPrice) : 0;
  const merchantName = product.merchant?.name ?? null;
  const specs = specRows(product.specifications, product.attributes);
  const initial = product.title.trim().charAt(0).toUpperCase() || "V";

  const [relatedRaw, relatedGuides] = await Promise.all([
    product.categoryId
      ? db.product.findMany({
          where: {
            status: "PUBLISHED",
            categoryId: product.categoryId,
            id: { not: product.id },
          },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          take: 4,
          select: cardProductSelect,
        })
      : Promise.resolve([]),
    product.categoryId
      ? db.article.findMany({
          where: { status: "PUBLISHED", categoryId: product.categoryId },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: { slug: true, title: true, excerpt: true },
        })
      : Promise.resolve([]),
  ]);
  const related = relatedRaw.map(toCardProduct);

  const whoFor = [
    genderLabel(product.gender),
    product.fitnessGoal,
    product.productType,
  ].filter((v): v is string => Boolean(v));

  return (
    <>
      <Header />
      <TrackView type="product_view" productId={product.id} page={`/products/${product.slug}`} />
      <JsonLd
        data={productJsonLd({
          slug: product.slug,
          title: product.title,
          shortDescription: product.shortDescription ?? product.description ?? null,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
          price,
          originalPrice,
          currency,
          rating: product.rating,
          reviewCount: product.reviewCount,
          merchantName,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          ...(product.category?.parent
            ? [
                {
                  name: product.category.parent.name,
                  path: `/c/${product.category.parent.slug}`,
                },
              ]
            : []),
          ...(product.category
            ? [{ name: product.category.name, path: `/c/${product.category.slug}` }]
            : []),
          { name: product.title, path: `/products/${product.slug}` },
        ])}
      />

      <main className="bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
              <li>
                <Link href="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              {product.category?.parent && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/c/${product.category.parent.slug}`} className="hover:text-gold">
                      {product.category.parent.name}
                    </Link>
                  </li>
                </>
              )}
              {product.category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/c/${product.category.slug}`} className="hover:text-gold">
                      {product.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-[40ch] truncate text-cream">
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-coal">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal"
                  >
                    <span className="font-display text-8xl font-semibold text-gold">{initial}</span>
                  </div>
                )}
                <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                  {product.trendStatus === "PUBLISHED" && <Badge tone="gold">Trending</Badge>}
                  {product.isFeatured && <Badge tone="ink">Editor&apos;s Pick</Badge>}
                </div>
              </div>
              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1" role="list" aria-label="Product images">
                  {product.images.map((img, i) => (
                    <div
                      key={img.url}
                      role="listitem"
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-coal"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || `${product.title} — image ${i + 1}`}
                        fill
                        sizes="80px"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {merchantName && (
                <p className="mb-2 text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-gold">
                  {merchantName}
                </p>
              )}
              <h1 className="font-display text-3xl font-semibold tracking-tight text-cream md:text-5xl">
                {product.title}
              </h1>

              {product.rating !== null && (
                <p className="mt-4 font-sans text-sm text-cream/70" aria-label={`Rated ${product.rating} out of 5`}>
                  <span aria-hidden="true" className="text-lg text-gold">
                    {"★".repeat(Math.max(0, Math.min(5, Math.round(product.rating))))}
                    <span className="text-cream/20">
                      {"★".repeat(5 - Math.max(0, Math.min(5, Math.round(product.rating))))}
                    </span>
                  </span>{" "}
                  <span className="font-semibold text-cream">{product.rating.toFixed(1)}</span>
                  {product.reviewCount !== null && product.reviewCount > 0 && (
                    <span className="text-cream/55">
                      {" "}
                      · {product.reviewCount.toLocaleString("en-US")} reviews
                    </span>
                  )}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                {price !== null ? (
                  <>
                    <p className="font-sans text-3xl font-semibold text-cream">
                      {formatPrice(price, currency)}
                    </p>
                    {originalPrice !== null && originalPrice > price && (
                      <p className="font-sans text-lg text-cream/45 line-through">
                        {formatPrice(originalPrice, currency)}
                      </p>
                    )}
                    {discount > 0 && <Badge tone="gold">Save {discount}%</Badge>}
                  </>
                ) : (
                  <p className="font-sans text-base italic text-cream/60">
                    Price unavailable — check merchant
                  </p>
                )}
              </div>

              {product.shortDescription && (
                <p className="mt-6 font-sans text-base leading-relaxed text-cream/75">
                  {product.shortDescription}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {product.affiliateUrl ? (
                  <Link
                    href={`/go/${product.id}`}
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-golddeep hover:text-cream"
                  >
                    Check Price at {merchantName ?? "Merchant"}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-cream/10 px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream/50"
                  >
                    Not available
                  </button>
                )}
                <SaveButton id={product.id} slug={product.slug} title={product.title} image={product.images[0]?.url} />
              </div>
              {product.affiliateUrl ? (
                <p className="mt-4 max-w-md font-sans text-xs leading-relaxed text-cream/55">
                  You&apos;ll leave VÉLORA for {merchantName ?? "the merchant"} — we may earn a
                  commission.{" "}
                  <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-gold">
                    Learn more
                  </Link>
                </p>
              ) : (
                <p className="mt-4 max-w-md font-sans text-xs leading-relaxed text-cream/55">
                  This product isn&apos;t currently available through our partners.
                </p>
              )}

              {whoFor.length > 0 && (
                <div className="mt-8 border-t border-cream/10 pt-6">
                  <h2 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/60">
                    Who it&apos;s for
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {whoFor.map((v) => (
                      <span
                        key={v}
                        className="rounded-full bg-coal px-4 py-2 font-sans text-xs font-medium text-cream/75"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <section className="mt-14 md:mt-20" aria-labelledby="specs-heading">
            <h2 id="specs-heading" className="mb-6 font-display text-2xl font-semibold text-cream md:text-3xl">
              Specifications
            </h2>
            {specs.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-cream/10">
                <table className="w-full bg-coal font-sans text-sm">
                  <tbody>
                    {specs.map((row, i) => (
                      <tr key={`${row.key}-${i}`} className={i % 2 === 1 ? "bg-coal/70" : undefined}>
                        <th
                          scope="row"
                          className="w-1/3 px-5 py-3.5 text-left align-top text-xs font-semibold uppercase tracking-[0.12em] text-cream/55"
                        >
                          {row.key}
                        </th>
                        <td className="px-5 py-3.5 text-cream/85">{row.value || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="font-sans text-sm italic text-cream/55">
                Detailed specifications haven&apos;t been provided for this product yet — check the
                merchant page for the latest details.
              </p>
            )}
          </section>

          {/* Editorial notes */}
          {product.description && (
            <section className="mt-14 md:mt-20" aria-labelledby="notes-heading">
              <h2 id="notes-heading" className="mb-6 font-display text-2xl font-semibold text-cream md:text-3xl">
                Editorial Notes
              </h2>
              <div className="max-w-3xl space-y-4">
                {product.description.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className="whitespace-pre-line font-sans text-base leading-relaxed text-cream/80">
                    {para.trim()}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <section className="mt-14 md:mt-20" aria-labelledby="related-heading">
              <h2 id="related-heading" className="mb-6 font-display text-2xl font-semibold text-cream md:text-3xl">
                You May Also Like
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <section className="mt-14 md:mt-20" aria-labelledby="related-guides-heading">
              <h2 id="related-guides-heading" className="mb-6 font-display text-2xl font-semibold text-cream md:text-3xl">
                Related Guides
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group rounded-2xl border border-cream/10 bg-coal p-6 transition-shadow hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.3)]"
                  >
                    <h3 className="font-display text-xl font-semibold text-cream group-hover:text-gold">
                      {g.title}
                    </h3>
                    {g.excerpt && (
                      <p className="mt-2 line-clamp-2 font-sans text-sm text-cream/65">{g.excerpt}</p>
                    )}
                    <span className="mt-4 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                      Read guide &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
