import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import {
  ProductCard,
  cardProductSelect,
  toCardProduct,
} from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | VÉLORA",
  description: "Search VÉLORA's curated fitness products, buying guides, and comparisons.",
  alternates: { canonical: canonical("/search") },
};

interface SearchPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}

/** Token-based goal matching (singular/plural tolerant). */
function goalClause(goal: string): Prisma.ProductWhereInput {
  const tokens = goal
    .split("-")
    .filter(Boolean)
    .flatMap((t) => [t, t.endsWith("s") ? t.slice(0, -1) : `${t}s`]);
  return {
    OR: tokens.map((t) => ({ fitnessGoal: { contains: t, mode: "insensitive" } })),
  };
}

const SORTS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function orderByFor(sort: string | undefined): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = param(searchParams.q);
  const categorySlug = param(searchParams.category);
  const genderParam = param(searchParams.gender)?.toUpperCase();
  const goal = param(searchParams.goal);
  const merchantSlug = param(searchParams.merchant);
  const sort = param(searchParams.sort) ?? "relevance";

  const [categories, merchants] = await Promise.all([
    db.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    db.merchant.findMany({
      orderBy: { priority: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  let products: ReturnType<typeof toCardProduct>[] = [];
  let articles: Array<{
    slug: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    type: string;
  }> = [];
  let searched = false;

  if (q || categorySlug || genderParam || goal || merchantSlug) {
    searched = true;
    const productWhere: Prisma.ProductWhereInput = { status: "PUBLISHED" };
    const and: Prisma.ProductWhereInput[] = [];

    if (q) {
      and.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (categorySlug) {
      const cat = await db.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true, children: { select: { id: true } } },
      });
      if (cat) {
        productWhere.categoryId = { in: [cat.id, ...cat.children.map((c) => c.id)] };
      }
    }
    if (genderParam === "WOMEN" || genderParam === "MEN" || genderParam === "UNISEX") {
      productWhere.gender = genderParam;
    }
    if (goal) and.push(goalClause(goal));
    if (merchantSlug) productWhere.merchant = { slug: merchantSlug };
    if (and.length > 0) productWhere.AND = and;

    const [productRows, articleRows] = await Promise.all([
      db.product.findMany({
        where: productWhere,
        orderBy: orderByFor(sort === "relevance" ? "newest" : sort),
        take: 48,
        select: cardProductSelect,
      }),
      q
        ? db.article.findMany({
            where: {
              status: "PUBLISHED",
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            },
            orderBy: { publishedAt: "desc" },
            take: 12,
            select: { slug: true, title: true, excerpt: true, featuredImage: true, type: true },
          })
        : Promise.resolve([]),
    ]);
    products = productRows.map(toCardProduct);
    articles = articleRows;
  }

  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
            Discovery
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            Search VÉLORA
          </h1>

          {/* Search form */}
          <form
            method="GET"
            action="/search"
            className="mt-8 rounded-2xl border border-sand bg-white/70 p-5 md:p-6"
            aria-label="Search products and guides"
            role="search"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="search-q" className="sr-only">
                Search query
              </label>
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="Try &quot;adjustable dumbbells&quot;, &quot;pilates reformer&quot;, &quot;massage gun&quot;…"
                className="w-full flex-1 rounded-full border border-sand bg-cream px-6 py-3.5 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-golddeep focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-ink px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-coal"
              >
                Search
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="s-category" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Category
                </label>
                <select
                  id="s-category"
                  name="category"
                  defaultValue={categorySlug ?? ""}
                  className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink focus:border-golddeep focus:outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="s-gender" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Gender
                </label>
                <select
                  id="s-gender"
                  name="gender"
                  defaultValue={param(searchParams.gender) ?? ""}
                  className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink focus:border-golddeep focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label htmlFor="s-goal" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Goal
                </label>
                <select
                  id="s-goal"
                  name="goal"
                  defaultValue={goal ?? ""}
                  className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink focus:border-golddeep focus:outline-none"
                >
                  <option value="">All goals</option>
                  <option value="pilates">Pilates</option>
                  <option value="strength">Strength</option>
                  <option value="home-workouts">Home Workout</option>
                  <option value="cardio">Cardio</option>
                  <option value="glute-training">Glute Training</option>
                  <option value="walking">Walking</option>
                  <option value="recovery">Recovery</option>
                </select>
              </div>
              <div>
                <label htmlFor="s-merchant" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Merchant
                </label>
                <select
                  id="s-merchant"
                  name="merchant"
                  defaultValue={merchantSlug ?? ""}
                  className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink focus:border-golddeep focus:outline-none"
                >
                  <option value="">All merchants</option>
                  {merchants.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="s-sort" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                  Sort by
                </label>
                <select
                  id="s-sort"
                  name="sort"
                  defaultValue={sort}
                  className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink focus:border-golddeep focus:outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>

          {/* Results */}
          <div className="mt-10">
            {!searched ? (
              <div className="rounded-2xl border border-sand bg-white/60 p-10 text-center">
                <p className="font-display text-2xl font-semibold text-ink">
                  What are you looking for?
                </p>
                <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-ink/65">
                  Search our curated collection of fitness essentials, equipment, and editorial
                  guides — or browse by goal, category, or merchant above.
                </p>
              </div>
            ) : products.length === 0 && articles.length === 0 ? (
              <EmptyState
                title="No results found"
                message={
                  q
                    ? `We couldn't find anything for "${q}". Try a different term, or browse the collections — new curated products are added regularly.`
                    : "No products match these filters. Try widening your search."
                }
                actionHref="/trending"
                actionLabel="Browse Trending"
              />
            ) : (
              <>
                {products.length > 0 && (
                  <section aria-labelledby="results-products" className="mb-14">
                    <h2 id="results-products" className="mb-6 font-display text-2xl font-semibold text-ink md:text-3xl">
                      Products {q && <span className="text-ink/50">for &ldquo;{q}&rdquo;</span>}
                      <span className="ml-3 align-middle font-sans text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                        {products.length} found
                      </span>
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </section>
                )}
                {articles.length > 0 && (
                  <section aria-labelledby="results-guides">
                    <h2 id="results-guides" className="mb-6 font-display text-2xl font-semibold text-ink md:text-3xl">
                      Guides & Articles
                      <span className="ml-3 align-middle font-sans text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                        {articles.length} found
                      </span>
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {articles.map((a) => (
                        <Link
                          key={a.slug}
                          href={`/guides/${a.slug}`}
                          className="group flex gap-4 rounded-2xl border border-sand bg-white/70 p-4 transition-shadow hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.3)]"
                        >
                          <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                            {a.featuredImage ? (
                              <Image
                                src={a.featuredImage}
                                alt=""
                                fill
                                sizes="96px"
                                loading="lazy"
                                className="object-cover"
                              />
                            ) : (
                              <span aria-hidden="true" className="flex h-full w-full items-center justify-center bg-ink font-display text-2xl text-gold">
                                V
                              </span>
                            )}
                          </span>
                          <span>
                            <Badge tone="outline">Guide</Badge>
                            <span className="mt-2 block font-display text-lg font-semibold leading-snug text-ink group-hover:text-golddeep">
                              {a.title}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
