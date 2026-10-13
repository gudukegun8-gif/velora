import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { formatPrice, truncate } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardProductSelect, toCardProduct } from "@/lib/card-product";
import { JsonLd } from "@/components/site/JsonLd";
import { comparisonJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ComparePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const comparison = await db.comparison.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
      productIds: true,
    },
  });
  if (!comparison || comparison.status !== "PUBLISHED") {
    return { title: "Comparison not found — VÉLORA" };
  }
  const rawTitle = comparison.seoTitle || comparison.title;
  const title = rawTitle.replace(/\s*[|–—-]\s*VÉLORA\s*$/i, "").trim() || rawTitle;
  const description =
    comparison.seoDescription ||
    comparison.description ||
    `${truncate(comparison.title, 120)} — side-by-side comparison of editor-curated fitness picks on VÉLORA.`;
  const firstProduct =
    comparison.productIds.length > 0
      ? await db.product.findUnique({
          where: { id: comparison.productIds[0] },
          select: { images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 } },
        })
      : null;
  const ogImage = firstProduct?.images[0]?.url || "/images/og-image.webp";
  return {
    title,
    description,
    alternates: { canonical: canonical(`/compare/${params.slug}`) },
    openGraph: {
      title,
      description,
      url: canonical(`/compare/${params.slug}`),
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const comparison = await db.comparison.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      title: true,
      description: true,
      productIds: true,
      status: true,
      updatedAt: true,
    },
  });

  if (!comparison || comparison.status !== "PUBLISHED") {
    notFound();
  }

  const productsRaw =
    comparison.productIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: comparison.productIds }, status: "PUBLISHED" },
          select: {
            ...cardProductSelect,
            originalPrice: true,
            shortDescription: true,
            gender: true,
          },
        })
      : [];
  // Preserve the editor's ordering from productIds.
  const order = new Map(comparison.productIds.map((id, i) => [id, i]));
  const products = productsRaw
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map(toCardProduct);
  const productsFull = new Map(productsRaw.map((p) => [p.id, p]));

  const rows: Array<{ label: string; render: (id: string) => React.ReactNode }> = [
    {
      label: "Price",
      render: (id) => {
        const p = productsFull.get(id);
        if (!p || p.price === null || p.price === undefined)
          return <span className="text-cream/55">Check merchant</span>;
        return (
          <span className="font-medium text-cream">
            {formatPrice(Number(p.price), p.currency ?? "USD")}
          </span>
        );
      },
    },
    {
      label: "Rating",
      render: (id) => {
        const p = productsFull.get(id);
        if (typeof p?.rating !== "number")
          return <span className="text-cream/55">Not rated</span>;
        return (
          <span className="text-cream">
            <span aria-hidden="true" className="text-gold">★</span>{" "}
            {p.rating.toFixed(1)}
            {typeof p.reviewCount === "number" && p.reviewCount > 0 && (
              <span className="text-cream/55"> · {p.reviewCount.toLocaleString("en-US")}</span>
            )}
          </span>
        );
      },
    },
    {
      label: "Merchant",
      render: (id) => {
        const p = productsFull.get(id);
        return <span className="text-cream/80">{p?.merchant?.name ?? "—"}</span>;
      },
    },
    {
      label: "Availability",
      render: () => (
        <span className="text-cream/55">Check the merchant page for live stock</span>
      ),
    },
  ];

  return (
    <>
      <Header />
      <JsonLd
        data={comparisonJsonLd({
          slug: comparison.slug,
          title: comparison.title,
          description: comparison.description,
          updatedAt: comparison.updatedAt,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Comparisons", path: "/guides?type=COMPARISON" },
          { name: comparison.title, path: `/compare/${comparison.slug}` },
        ])}
      />

      <main className="bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
              <li>
                <Link href="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/guides?type=COMPARISON" className="hover:text-gold">
                  Comparisons
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-[40ch] truncate text-cream">
                {comparison.title}
              </li>
            </ol>
          </nav>

          <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
            Side by Side
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-medium tracking-tight text-cream md:text-5xl">
            {comparison.title}
          </h1>
          {comparison.description && (
            <p className="mt-4 max-w-3xl font-sans text-base leading-relaxed text-cream/75">
              {comparison.description}
            </p>
          )}
          <p className="mt-3 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50">
            By{" "}
            <Link
              href="/about"
              className="text-cream/75 underline-offset-4 hover:text-gold hover:underline"
            >
              VÉLORA Editors
            </Link>
            <span aria-hidden="true" className="mx-2 text-cream/30">
              ·
            </span>
            Last updated{" "}
            <time dateTime={comparison.updatedAt.toISOString()}>
              {comparison.updatedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </p>

          {products.length > 0 ? (
            <>
              {/* Product cards */}
              <div
                className={`mt-10 grid gap-6 ${
                  products.length >= 3
                    ? "sm:grid-cols-3"
                    : products.length === 2
                      ? "sm:grid-cols-2"
                      : "sm:max-w-md"
                }`}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Spec table */}
              <section className="mt-12" aria-label="Comparison details">
                <h2 className="mb-6 font-display text-2xl font-medium text-cream md:text-3xl">
                  At a Glance
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-cream/10">
                  <table className="w-full min-w-[560px] bg-coal font-sans text-sm">
                    <thead>
                      <tr className="border-b border-cream/10">
                        <th scope="col" className="w-32 px-5 py-4 text-left">
                          <span className="sr-only">Detail</span>
                        </th>
                        {products.map((p) => (
                          <th
                            key={p.id}
                            scope="col"
                            className="px-5 py-4 text-left align-top"
                          >
                            <Link
                              href={`/products/${p.slug}`}
                              className="font-display text-base font-medium text-cream transition-colors hover:text-gold"
                            >
                              {truncate(p.title, 60)}
                            </Link>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr
                          key={row.label}
                          className={i % 2 === 1 ? "bg-coal/70" : undefined}
                        >
                          <th
                            scope="row"
                            className="px-5 py-3.5 text-left align-top text-xs font-medium uppercase tracking-[0.12em] text-cream/55"
                          >
                            {row.label}
                          </th>
                          {products.map((p) => (
                            <td key={p.id} className="px-5 py-3.5 align-top">
                              {row.render(p.id)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className={rows.length % 2 === 1 ? "bg-coal/70" : undefined}>
                        <th
                          scope="row"
                          className="px-5 py-4 text-left align-top text-xs font-medium uppercase tracking-[0.12em] text-cream/55"
                        >
                          Shop
                        </th>
                        {products.map((p) => (
                          <td key={p.id} className="px-5 py-4 align-top">
                            <Link
                              href={`/go/${p.id}`}
                              rel="nofollow sponsored noopener"
                              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-golddeep hover:text-cream"
                            >
                              Check Price
                              {p.merchantName ? ` at ${p.merchantName}` : ""}
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <p className="mx-auto mt-10 max-w-2xl text-center font-sans text-xs leading-relaxed text-cream/50">
                Prices, ratings, and availability are shown as listed by the merchant and can
                change — always check the merchant page for the final details. VÉLORA may earn
                a commission when you purchase through qualifying links.{" "}
                <Link
                  href="/affiliate-disclosure"
                  className="underline underline-offset-2 hover:text-gold"
                >
                  Read our affiliate disclosure
                </Link>
              </p>
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-cream/10 bg-coal p-10 text-center">
              <p className="font-sans text-sm text-cream/65">
                The products in this comparison are being curated.{" "}
                <Link href="/trending" className="font-medium text-gold underline-offset-4 hover:underline">
                  Browse trending products
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
