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
import { ProductCard } from "@/components/ui/ProductCard";
import { cardProductSelect, toCardProduct } from "@/lib/card-product";

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

  // Gender-aware accent palette: women's pages wear rose jewelry,
  // men's pages wear steel jewelry — same dark cinematic foundation.
  // Every string below is a complete literal class name so Tailwind
  // JIT can detect it.
  interface CategoryTone {
    h1: string;
    eyebrow: string;
    crumbHover: string;
    chipActive: string;
    chipHover: string;
    cta: string;
    apply: string;
    inputFocus: string;
    clear: string;
    guideTitle: string;
    guideLink: string;
    guideCard: string;
    cardWrap: string;
    glow: string;
    imgWrap: string;
    imgShade: string;
    band: string;
  }

  const slugLower = category.slug.toLowerCase();
  const nameLower = category.name.toLowerCase();
  const mentionsWomen = slugLower.includes("women") || nameLower.includes("women");
  const mentionsMen = slugLower.includes("men") || nameLower.includes("men");
  const isWomen = mentionsWomen;
  const isMen = !mentionsWomen && mentionsMen;

  const tone: CategoryTone = isWomen
    ? {
        h1: "text-gradient-rose",
        eyebrow: "text-rosegold",
        crumbHover: "hover:text-rosegold",
        chipActive: "border-rosegold bg-rosegold text-ink",
        chipHover: "hover:border-rosegold hover:text-rosegold",
        cta: "bg-rosegold text-ink hover:bg-blush hover:text-ink",
        apply:
          "border border-rosegold/50 text-rosegold hover:bg-rosegold hover:text-ink",
        inputFocus: "focus:border-rosegold",
        clear: "text-rosegold",
        guideTitle: "group-hover:text-rosegold",
        guideLink: "text-rosegold",
        guideCard:
          "hover:shadow-[0_18px_50px_-18px_rgba(226,165,140,0.35)]",
        cardWrap:
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(226,165,140,0.4)]",
        glow: "glow-rose",
        imgWrap: "ring-1 ring-rosegold/40",
        imgShade:
          "bg-gradient-to-t from-plum/40 via-transparent to-transparent",
        band: "border-t border-rosegold/25 bg-coal/60",
      }
    : isMen
      ? {
          h1: "text-gradient-steel",
          eyebrow: "text-steel",
          crumbHover: "hover:text-steel",
          chipActive: "border-steel bg-steel text-ink",
          chipHover: "hover:border-steel hover:text-steel",
          cta: "bg-steel text-ink hover:bg-ice hover:text-ink",
          apply:
            "border border-steel/50 text-steel hover:bg-steel hover:text-ink",
          inputFocus: "focus:border-steel",
          clear: "text-steel",
          guideTitle: "group-hover:text-steel",
          guideLink: "text-steel",
          guideCard:
            "hover:shadow-[0_18px_50px_-18px_rgba(169,190,205,0.35)]",
          cardWrap:
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(169,190,205,0.4)]",
          glow: "glow-steel",
          imgWrap: "ring-1 ring-steel/40",
          imgShade:
            "bg-gradient-to-t from-navy/50 via-transparent to-transparent",
          band: "border-t border-steel/25 bg-coal/60",
        }
      : {
          h1: "text-cream",
          eyebrow: "text-gold",
          crumbHover: "hover:text-gold",
          chipActive: "border-gold bg-gold text-ink",
          chipHover: "hover:border-gold hover:text-gold",
          cta: "bg-gold text-ink hover:bg-golddeep hover:text-cream",
          apply: "bg-ink text-cream hover:bg-coal",
          inputFocus: "focus:border-golddeep",
          clear: "text-gold",
          guideTitle: "group-hover:text-gold",
          guideLink: "text-gold",
          guideCard:
            "hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.3)]",
          cardWrap:
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(11,10,8,0.45)]",
          glow: "",
          imgWrap: "ring-1 ring-cream/10",
          imgShade:
            "bg-gradient-to-t from-ink/60 via-transparent to-transparent",
          band: "border-t border-cream/10 bg-coal/60",
        };

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
      <main className="bg-ink">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
            <li>
              <Link href="/" className={tone.crumbHover}>
                Home
              </Link>
            </li>
            {category.parent && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/c/${category.parent.slug}`} className={tone.crumbHover}>
                    {category.parent.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-cream">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className={cx("mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em]", tone.eyebrow)}>
                Collection
              </p>
              <h1 className={cx("font-display text-4xl font-semibold tracking-tight md:text-6xl", tone.h1)}>
                {category.name}
              </h1>
              {(category.description || category.tagline) && (
                <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-cream/70 md:text-base">
                  {category.description || category.tagline}
                </p>
              )}
              <p className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-cream/50">
                {totalCount} {totalCount === 1 ? "product" : "products"} curated
              </p>
            </div>
            {category.image && (
              <div className="relative">
                {tone.glow && (
                  <div
                    aria-hidden="true"
                    className={cx("absolute -inset-6 rounded-[2rem] blur-2xl", tone.glow)}
                  />
                )}
                <div className={cx("relative overflow-hidden rounded-3xl", tone.imgWrap)}>
                  <Image
                    src={category.image}
                    alt={`${category.name} collection`}
                    width={1000}
                    height={600}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="aspect-[16/9] w-full object-cover"
                    priority
                  />
                  <div
                    aria-hidden="true"
                    className={cx("pointer-events-none absolute inset-0", tone.imgShade)}
                  />
                </div>
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
                      ? tone.chipActive
                      : cx("border-cream/20 bg-coal text-cream", tone.chipHover)
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
                <p className={cx("mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em]", tone.eyebrow)}>
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
                  className={cx("mt-8 inline-flex items-center justify-center rounded-full px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] transition-colors", tone.cta)}
                >
                  {spotlight.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className={cx("border-t bg-coal/60", tone.band)}>
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Filters */}
            <form
              method="GET"
              action={`/c/${category.slug}`}
              className="mb-10 rounded-2xl border border-cream/10 bg-coal p-5 md:p-6"
              aria-label="Filter products"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <label htmlFor="f-gender" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60">
                    Gender
                  </label>
                  <select
                    id="f-gender"
                    name="gender"
                    defaultValue={param(searchParams.gender) ?? ""}
                    className={cx("w-full rounded-lg border border-cream/10 bg-ink px-3 py-2.5 font-sans text-sm text-cream focus:outline-none", tone.inputFocus)}
                  >
                    <option value="">All</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-goal" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60">
                    Goal
                  </label>
                  <select
                    id="f-goal"
                    name="goal"
                    defaultValue={param(searchParams.goal) ?? ""}
                    className={cx("w-full rounded-lg border border-cream/10 bg-ink px-3 py-2.5 font-sans text-sm text-cream focus:outline-none", tone.inputFocus)}
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
                  <label htmlFor="f-merchant" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60">
                    Merchant
                  </label>
                  <select
                    id="f-merchant"
                    name="merchant"
                    defaultValue={param(searchParams.merchant) ?? ""}
                    className={cx("w-full rounded-lg border border-cream/10 bg-ink px-3 py-2.5 font-sans text-sm text-cream focus:outline-none", tone.inputFocus)}
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
                  <label htmlFor="f-minPrice" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60">
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
                    className={cx("w-full rounded-lg border border-cream/10 bg-ink px-3 py-2.5 font-sans text-sm text-cream placeholder:text-cream/35 focus:outline-none", tone.inputFocus)}
                  />
                </div>
                <div>
                  <label htmlFor="f-maxPrice" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60">
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
                    className={cx("w-full rounded-lg border border-cream/10 bg-ink px-3 py-2.5 font-sans text-sm text-cream placeholder:text-cream/35 focus:outline-none", tone.inputFocus)}
                  />
                </div>
                <div>
                  <label htmlFor="f-sort" className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/60">
                    Sort by
                  </label>
                  <select
                    id="f-sort"
                    name="sort"
                    defaultValue={sort}
                    className={cx("w-full rounded-lg border border-cream/10 bg-ink px-3 py-2.5 font-sans text-sm text-cream focus:outline-none", tone.inputFocus)}
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
                  className={cx("rounded-full px-7 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] transition-colors", tone.apply)}
                >
                  Apply Filters
                </button>
                {activeFilters.length > 0 && (
                  <Link
                    href={`/c/${category.slug}`}
                    className={cx("font-sans text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline", tone.clear)}
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
                  <div key={p.id} className={cx("rounded-3xl", tone.cardWrap)}>
                    <ProductCard product={p} />
                  </div>
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
                <h2 className="mb-6 font-display text-2xl font-semibold text-cream md:text-3xl">
                  Guides for {category.name}
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className={cx("group rounded-2xl border border-cream/10 bg-coal p-6 transition-shadow", tone.guideCard)}
                    >
                      <h3 className={cx("font-display text-xl font-semibold text-cream", tone.guideTitle)}>
                        {g.title}
                      </h3>
                      {g.excerpt && (
                        <p className="mt-2 line-clamp-2 font-sans text-sm text-cream/65">{g.excerpt}</p>
                      )}
                      <span className={cx("mt-4 block font-sans text-xs font-semibold uppercase tracking-[0.16em]", tone.guideLink)}>
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
