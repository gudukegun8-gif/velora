import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { cx } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ProductCard,
  cardProductSelect,
  toCardProduct,
} from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

/** Build the Prisma where clause from the filter params. */
function buildWhere(
  categoryIds: string[],
  sp: Record<string, string | string[] | undefined>
): Prisma.ProductWhereInput {
  const genderParam = param(sp.gender)?.toUpperCase();
  const gender =
    genderParam === "WOMEN" || genderParam === "MEN" || genderParam === "UNISEX"
      ? genderParam
      : undefined;
  const goal = param(sp.goal);
  const merchant = param(sp.merchant);
  const minPrice = Number(param(sp.minPrice));
  const maxPrice = Number(param(sp.maxPrice));
  const minRating = Number(param(sp.minRating));

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    categoryId: { in: categoryIds },
  };

  if (gender) {
    where.gender = gender;
  }

  const and: Prisma.ProductWhereInput[] = [];
  if (goal) {
    // Match any token (singular or plural) against the product's fitness goal.
    const tokens = goal
      .split("-")
      .filter(Boolean)
      .flatMap((t) => [t, t.endsWith("s") ? t.slice(0, -1) : `${t}s`]);
    and.push({
      OR: tokens.map((t) => ({ fitnessGoal: { contains: t, mode: "insensitive" } })),
    });
  }
  if (and.length > 0) {
    where.AND = and;
  }

  if (merchant) {
    where.merchant = { slug: merchant };
  }

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    where.price = {
      ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
      ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}),
    };
  }

  if (Number.isFinite(minRating) && minRating > 0) {
    where.rating = { gte: minRating };
  }

  return where;
}

function buildOrderBy(sort: string | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }];
    case "trending":
      return [{ trendScore: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

interface CategorySpotlight {
  /** Slug of the category this spotlight appears on. */
  onSlug: string;
  /** Slug of the linked subcategory — the spotlight only renders if it exists. */
  targetSlug: string;
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
}

/** Supporting editorial imagery for key category pages. */
const CATEGORY_SPOTLIGHTS: CategorySpotlight[] = [
  {
    onSlug: "women",
    targetSlug: "strength-training",
    image: "/images/womens-strength.webp",
    imageAlt:
      "Woman doing seated dumbbell curls on a workout bench in a premium gym, surrounded by kettlebells, a squat rack, treadmill, foam roller, and yoga mat",
    eyebrow: "Women's Strength",
    title: "Strength Training",
    description:
      "Dumbbells, kettlebells, benches, and lifting essentials chosen for women's strength training — from your first set to your personal best.",
    ctaLabel: "Shop Strength Training",
  },
];

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, tagline: true, description: true, seoTitle: true, seoDescription: true },
  });
  if (!category) return { title: "Collection not found — VÉLORA" };
  return {
    title: category.seoTitle || `${category.name} — Curated Fitness Essentials | VÉLORA`,
    description:
      category.seoDescription || category.description || category.tagline || undefined,
    alternates: { canonical: canonical(`/c/${params.slug}`) },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      description: true,
      image: true,
      parent: { select: { slug: true, name: true } },
      children: {
        select: { id: true, slug: true, name: true, tagline: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];
  const where = buildWhere(categoryIds, searchParams);
  const sort = param(searchParams.sort) ?? "newest";

  const [productsRaw, merchants, guides, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: buildOrderBy(sort),
      take: 60,
      select: cardProductSelect,
    }),
    db.merchant.findMany({
      where: { products: { some: { status: "PUBLISHED", categoryId: { in: categoryIds } } } },
      orderBy: { priority: "asc" },
      select: { slug: true, name: true },
    }),
    db.article.findMany({
      where: { status: "PUBLISHED", categoryId: { in: categoryIds } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: { slug: true, title: true, excerpt: true },
    }),
    db.product.count({ where }),
  ]);

  const products = productsRaw.map(toCardProduct);
  const activeFilters = ["gender", "goal", "merchant", "minPrice", "maxPrice", "minRating"].filter(
    (k) => param(searchParams[k])
  );

  // Supporting spotlight imagery (e.g. strength training on /c/women) —
  // only rendered when the linked subcategory actually exists.
  const spotlightConfig = CATEGORY_SPOTLIGHTS.find((s) => s.onSlug === category.slug);
  const spotlightTarget = spotlightConfig
    ? await db.category.findUnique({
        where: { slug: spotlightConfig.targetSlug },
        select: { slug: true },
      })
    : null;
  const spotlight = spotlightConfig && spotlightTarget ? spotlightConfig : null;

  return (
    <>
      <Header />
      <main className="bg-cream">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-ink/50">
            <li>
              <Link href="/" className="hover:text-golddeep">
                Home
              </Link>
            </li>
            {category.parent && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/c/${category.parent.slug}`} className="hover:text-golddeep">
                    {category.parent.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
                Collection
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
                {category.name}
              </h1>
              {(category.description || category.tagline) && (
                <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ink/70 md:text-base">
                  {category.description || category.tagline}
                </p>
              )}
              <p className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-ink/50">
                {totalCount} {totalCount === 1 ? "product" : "products"} curated
              </p>
            </div>
            {category.image && (
              <div className="relative overflow-hidden rounded-3xl">
                <Image
                  src={category.image}
                  alt={`${category.name} collection`}
                  width={1000}
                  height={600}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="aspect-[16/9] w-full object-cover"
                  priority
                />
              </div>
            )}
          </div>

          {/* Subcategory chips */}
          {category.children.length > 0 && (
            <nav aria-label="Subcategories" className="mt-8 flex flex-wrap gap-3">
              {category.children.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/c/${sub.slug}`}
                  className={cx(
                    "rounded-full border px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                    sub.slug === category.slug
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/20 bg-white/60 text-ink hover:border-golddeep hover:text-golddeep"
                  )}
                  aria-current={sub.slug === category.slug ? "page" : undefined}
                >
                  {sub.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Supporting spotlight imagery (e.g. strength training on /c/women) */}
        {spotlight && (
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-3xl bg-ink text-cream lg:grid-cols-2">
              <div className="relative min-h-[280px] lg:min-h-[380px]">
                <Image
                  src={spotlight.image}
                  alt={spotlight.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start justify-center p-8 md:p-12">
                <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
                  {spotlight.eyebrow}
                </p>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  {spotlight.title}
                </h2>
                <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-cream/70 md:text-base">
                  {spotlight.description}
                </p>
                <Link
                  href={`/c/${spotlight.targetSlug}`}
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-golddeep hover:text-cream"
                >
                  {spotlight.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-sand bg-stone-50/60">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Filters */}
            <form
              method="GET"
              action={`/c/${category.slug}`}
              className="mb-10 rounded-2xl border border-sand bg-white/70 p-5 md:p-6"
              aria-label="Filter products"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <label htmlFor="f-gender" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Gender
                  </label>
                  <select
                    id="f-gender"
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
                  <label htmlFor="f-goal" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Goal
                  </label>
                  <select
                    id="f-goal"
                    name="goal"
                    defaultValue={param(searchParams.goal) ?? ""}
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
                  <label htmlFor="f-merchant" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Merchant
                  </label>
                  <select
                    id="f-merchant"
                    name="merchant"
                    defaultValue={param(searchParams.merchant) ?? ""}
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
                  <label htmlFor="f-minPrice" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Min price
                  </label>
                  <input
                    id="f-minPrice"
                    name="minPrice"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="$0"
                    defaultValue={param(searchParams.minPrice) ?? ""}
                    className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink/35 focus:border-golddeep focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-maxPrice" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Max price
                  </label>
                  <input
                    id="f-maxPrice"
                    name="maxPrice"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="No max"
                    defaultValue={param(searchParams.maxPrice) ?? ""}
                    className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink/35 focus:border-golddeep focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="f-sort" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Sort by
                  </label>
                  <select
                    id="f-sort"
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
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-ink px-7 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-coal"
                >
                  Apply Filters
                </button>
                {activeFilters.length > 0 && (
                  <Link
                    href={`/c/${category.slug}`}
                    className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-golddeep underline-offset-4 hover:underline"
                  >
                    Clear all
                  </Link>
                )}
              </div>
            </form>

            {/* Products */}
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No products match these filters"
                message="Try widening your price range or clearing a filter — new curated products are added regularly."
                actionHref={`/c/${category.slug}`}
                actionLabel="Clear filters"
              />
            )}

            {/* Related guides */}
            {guides.length > 0 && (
              <div className="mt-16">
                <h2 className="mb-6 font-display text-2xl font-semibold text-ink md:text-3xl">
                  Guides for {category.name}
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="group rounded-2xl border border-sand bg-white/70 p-6 transition-shadow hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.3)]"
                    >
                      <h3 className="font-display text-xl font-semibold text-ink group-hover:text-golddeep">
                        {g.title}
                      </h3>
                      {g.excerpt && (
                        <p className="mt-2 line-clamp-2 font-sans text-sm text-ink/65">{g.excerpt}</p>
                      )}
                      <span className="mt-4 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-golddeep">
                        Read guide &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
