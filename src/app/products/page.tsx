import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardProductSelect, toCardProduct } from "@/lib/card-product";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Products — Curated Fitness Essentials",
  description:
    "Browse the complete VÉLORA catalog: curated fitness, home gym, yoga and recovery essentials for women and men, each with a real photo and a verified store link.",
  alternates: { canonical: canonical("/products") },
};

const PAGE_SIZE = 48;

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

function orderBy(sort: SortValue): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

interface ProductsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sortRaw = param(searchParams.sort);
  const sort: SortValue = SORTS.some((s) => s.value === sortRaw)
    ? (sortRaw as SortValue)
    : "newest";
  const pageRaw = Number(param(searchParams.page));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    // Hide products without a verified image — broken cards kill premium perception
    images: { some: {} },
  };

  const [totalCount, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: orderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: cardProductSelect,
    }),
  ]);
  const products = rows.map(toCardProduct);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const pageHref = (p: number) =>
    sort === "newest" && p === 1
      ? "/products"
      : `/products?${new URLSearchParams({
          ...(sort !== "newest" ? { sort } : {}),
          ...(p > 1 ? { page: String(p) } : {}),
        }).toString()}`;

  // Compact page window: first, last, and neighbours of the current page
  const windowPages = Array.from(
    new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
  ).sort((a, b) => a - b);

  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
              <li>
                <Link href="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-cream">
                All Products
              </li>
            </ol>
          </nav>

          <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
            The Complete Catalog
          </p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-cream md:text-6xl">
            All Products
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-cream/70 md:text-base">
            Every curated fitness essential in one place — {totalCount} products for women and
            men, each with a real photo and a verified store link. Prefer a focused view? Browse
            by collection from the menu above.
          </p>

          {/* Sort chips */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
              Sort
            </span>
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={s.value === "newest" ? "/products" : `/products?sort=${s.value}`}
                className={
                  sort === s.value
                    ? "rounded-full bg-gold px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.12em] text-ink"
                    : "rounded-full border border-cream/20 px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-gold hover:text-gold"
                }
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="mt-10">
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No products to show yet"
                message="Our editors are curating new fitness finds. Check back soon — or start with the women's collection."
                actionHref="/c/women"
                actionLabel="Explore Women's Fitness"
              />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Product pages"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-full border border-cream/20 px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-gold hover:text-gold"
                >
                  Previous
                </Link>
              )}
              {windowPages.map((p, i) => (
                <span key={p} className="flex items-center gap-2">
                  {i > 0 && windowPages[i - 1] < p - 1 && (
                    <span className="text-cream/40">…</span>
                  )}
                  <Link
                    href={pageHref(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={
                      p === page
                        ? "rounded-full bg-gold px-4 py-1.5 font-sans text-xs font-medium text-ink"
                        : "rounded-full border border-cream/20 px-4 py-1.5 font-sans text-xs font-medium text-cream/80 transition-colors hover:border-gold hover:text-gold"
                    }
                  >
                    {p}
                  </Link>
                </span>
              ))}
              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-full border border-cream/20 px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-gold hover:text-gold"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
