import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { cx } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Newsletter } from "@/components/site/Newsletter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ProductCard,
  cardProductSelect,
  toCardProduct,
  type CardProduct,
} from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VÉLORA — Curated Fitness Essentials for Women & Men",
  description:
    "VÉLORA is premium fitness and lifestyle product discovery. Curated training essentials, smart equipment, and products worth discovering — chosen by editors, never paid placements.",
  alternates: { canonical: canonical("/") },
};

interface CategoryLite {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  image: string | null;
  children?: CategoryLite[];
}

const childOrder = { sortOrder: "asc" as const };

/** Horizontal snap rail on mobile, grid on desktop. */
function ProductRail({ products }: { products: CardProduct[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-4">
      {products.map((p) => (
        <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

function CategoryCard({ category, dark = false }: { category: CategoryLite; dark?: boolean }) {
  const initial = category.name.trim().charAt(0).toUpperCase() || "V";
  return (
    <Link
      href={`/c/${category.slug}`}
      className={cx(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.4)]",
        dark ? "border-cream/15 bg-coal" : "border-sand bg-white/60"
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        {category.image ? (
          <Image
            src={category.image}
            alt={`${category.name} — curated fitness collection`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal"
          >
            <span className="font-display text-5xl font-semibold text-gold">{initial}</span>
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cx(
            "font-display text-2xl font-semibold",
            dark ? "text-cream" : "text-ink"
          )}
        >
          {category.name}
        </h3>
        {category.tagline && (
          <p className={cx("mt-2 font-sans text-sm leading-relaxed", dark ? "text-cream/65" : "text-ink/65")}>
            {category.tagline}
          </p>
        )}
        <span className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-golddeep group-hover:underline group-hover:underline-offset-4">
          Explore &rarr;
        </span>
      </div>
    </Link>
  );
}

/** Editorial feature block: large image beside subcategory cards. */
function FeatureBlock({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  category,
  href,
  dark = false,
  flip = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  category: CategoryLite | null;
  href: string;
  dark?: boolean;
  flip?: boolean;
}) {
  const subs = (category?.children ?? []).slice(0, 6);
  return (
    <section className={cx("py-14 md:py-24", dark ? "bg-ink text-cream" : "bg-cream text-ink")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cx(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
            flip && "lg:[&>*:first-child]:order-2"
          )}
        >
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src={image}
              alt={imageAlt}
              width={900}
              height={1100}
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-ink/10"
            />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
              {eyebrow}
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {title}
            </h2>
            <p
              className={cx(
                "mt-4 max-w-lg font-sans text-sm leading-relaxed md:text-base",
                dark ? "text-cream/70" : "text-ink/70"
              )}
            >
              {description}
            </p>
            {subs.length > 0 && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {subs.map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      href={`/c/${sub.slug}`}
                      className={cx(
                        "group flex items-center justify-between gap-3 rounded-xl border px-5 py-4 transition-colors",
                        dark
                          ? "border-cream/15 bg-coal hover:border-gold/60"
                          : "border-sand bg-white/70 hover:border-golddeep/50"
                      )}
                    >
                      <span>
                        <span
                          className={cx(
                            "block font-sans text-sm font-semibold",
                            dark ? "text-cream" : "text-ink"
                          )}
                        >
                          {sub.name}
                        </span>
                        {sub.tagline && (
                          <span
                            className={cx(
                              "mt-0.5 block font-sans text-xs",
                              dark ? "text-cream/55" : "text-ink/55"
                            )}
                          >
                            {sub.tagline}
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true" className="text-golddeep transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8">
              <Button href={href} variant={dark ? "primary" : "ink"}>
                Shop the Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const GOALS = [
  { label: "Pilates", value: "pilates" },
  { label: "Strength", value: "strength" },
  { label: "Home Workout", value: "home-workouts" },
  { label: "Cardio", value: "cardio" },
  { label: "Glute Training", value: "glute-training" },
  { label: "Walking", value: "walking" },
  { label: "Recovery", value: "recovery" },
];

function GoalChip({ label, value }: { label: string; value: string }) {
  return (
    <Link
      href={`/search?goal=${value}`}
      className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/70 px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-golddeep hover:text-golddeep"
    >
      {label}
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

export default async function HomePage() {
  const [women, men, equipmentCat, recoveryCat, topCategories, trendingRaw, featuredRaw, latestRaw, comparisons, guides] =
    await Promise.all([
      db.category.findUnique({
        where: { slug: "women" },
        select: {
          id: true, slug: true, name: true, tagline: true, image: true,
          children: { select: { id: true, slug: true, name: true, tagline: true, image: true }, orderBy: childOrder },
        },
      }),
      db.category.findUnique({
        where: { slug: "men" },
        select: {
          id: true, slug: true, name: true, tagline: true, image: true,
          children: { select: { id: true, slug: true, name: true, tagline: true, image: true }, orderBy: childOrder },
        },
      }),
      db.category.findUnique({
        where: { slug: "equipment" },
        select: {
          id: true, slug: true, name: true, tagline: true, image: true,
          children: { select: { id: true, slug: true, name: true, tagline: true, image: true }, orderBy: childOrder },
        },
      }),
      db.category.findUnique({
        where: { slug: "recovery" },
        select: {
          id: true, slug: true, name: true, tagline: true, image: true,
          children: { select: { id: true, slug: true, name: true, tagline: true, image: true }, orderBy: childOrder },
        },
      }),
      db.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, tagline: true, image: true },
      }),
      db.product.findMany({
        where: { status: "PUBLISHED", trendStatus: "PUBLISHED" },
        orderBy: [{ trendScore: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: cardProductSelect,
      }),
      db.product.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: cardProductSelect,
      }),
      db.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: cardProductSelect,
      }),
      db.comparison.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: { slug: true, title: true, description: true, productIds: true },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED", type: "BUYING_GUIDE" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: {
          slug: true, title: true, excerpt: true, featuredImage: true, type: true,
          publishedAt: true, author: { select: { name: true } },
        },
      }),
    ]);

  const trending = trendingRaw.map(toCardProduct);
  const featured = featuredRaw.map(toCardProduct);
  const latest = latestRaw.map(toCardProduct);
  const hasStrengthTraining = (women?.children ?? []).some((c) => c.slug === "strength-training");

  // Popular equipment: subcategories if they exist, otherwise top equipment products.
  let equipmentProducts: CardProduct[] = [];
  if ((equipmentCat?.children?.length ?? 0) === 0 && equipmentCat) {
    const rows = await db.product.findMany({
      where: { status: "PUBLISHED", categoryId: equipmentCat.id },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: cardProductSelect,
    });
    equipmentProducts = rows.map(toCardProduct);
  }

  return (
    <>
      <Header />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-ink text-cream">
          <Image
            src="/images/hero.webp"
            alt="Woman in black activewear resting on a gym floor beside dumbbells and a foam roller, with VÉLORA branding on the wall"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent"
          />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-5 text-[11px] font-sans font-semibold uppercase tracking-[0.32em] text-gold">
                Premium Fitness Discovery
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                Elevate Your Everyday Training
              </h1>
              <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-cream/80 md:text-lg">
                Curated fitness essentials, smart equipment, and products worth discovering.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/c/women" size="lg">
                  Explore Fitness
                </Button>
                <Button href="/trending" variant="secondary" size="lg">
                  Trending Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Women's Fitness Picks ────────────────────────── */}
        <FeatureBlock
          eyebrow="Women First"
          title="Women's Fitness Picks"
          description="Training essentials curated for her — from reformers and resistance bands to activewear that performs as good as it looks. Every pick is chosen by our editors for quality, design, and real-world results."
          image="/images/womens-fitness.webp"
          imageAlt="Curated women's fitness collection — premium training essentials"
          category={women}
          href="/c/women"
        />

        {/* ── Women's Strength Spotlight ─────────────────── */}
        {hasStrengthTraining && (
          <section className="bg-cream py-14 md:py-24" aria-labelledby="strength-spotlight">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid overflow-hidden rounded-3xl bg-ink text-cream lg:grid-cols-2">
                <div className="relative min-h-[300px] lg:min-h-[440px]">
                  <Image
                    src="/images/womens-strength.webp"
                    alt="Woman doing seated dumbbell curls on a workout bench in a premium gym, surrounded by kettlebells, a squat rack, treadmill, foam roller, and yoga mat"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col items-start justify-center p-8 md:p-14">
                  <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
                    Women&apos;s Strength
                  </p>
                  <h2
                    id="strength-spotlight"
                    className="font-display text-3xl font-semibold tracking-tight md:text-4xl"
                  >
                    Strength Training, Curated for Her
                  </h2>
                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-cream/70 md:text-base">
                    Dumbbells, kettlebells, benches, and lifting essentials chosen for
                    women&apos;s strength training — from your first set to your personal
                    best.
                  </p>
                  <div className="mt-8">
                    <Button href="/c/strength-training">Shop Strength Training</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Trending ─────────────────────────────────────── */}
        {trending.length > 0 && (
          <section className="bg-cream py-14 md:py-24" aria-labelledby="trending-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="trending-heading">
                <SectionHeading
                  eyebrow="What Everyone's Watching"
                  title="Trending Fitness Products"
                  description="The finds gaining momentum right now — surfaced by real interest, reviewed by our editors before they earn a spot."
                  href="/trending"
                  linkLabel="All trending"
                />
              </div>
              <ProductRail products={trending} />
            </div>
          </section>
        )}

        {/* ── Editor's Picks ───────────────────────────────── */}
        {featured.length > 0 && (
          <section className="bg-stone-50 py-14 md:py-24" aria-labelledby="editors-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="editors-heading">
                <SectionHeading
                  eyebrow="Hand-Selected"
                  title="Editor's Picks"
                  description="The products our editors would buy themselves — standout design, honest quality, and lasting value."
                />
              </div>
              <ProductRail products={featured} />
            </div>
          </section>
        )}

        {/* ── Shop by Goal ─────────────────────────────────── */}
        <section className="bg-cream py-14 md:py-24" aria-labelledby="goals-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div id="goals-heading">
              <SectionHeading
                align="center"
                eyebrow="Shop by Goal"
                title="Train the Way You Move"
                description="Seven ways to train — one curated destination. Choose your goal and discover the essentials built for it."
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src="/images/shop-by-goal.webp"
                alt="VÉLORA gym collage showing training scenes for Pilates, Strength, Home Workout, Cardio, Glute Training, Walking, and Recovery"
                width={1536}
                height={1024}
                sizes="(max-width: 1280px) 100vw, 1280px"
                loading="lazy"
                className="w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-ink/10"
              />
            </div>
            <nav aria-label="Shop by fitness goal" className="mt-8 flex flex-wrap justify-center gap-3">
              {GOALS.map((g) => (
                <GoalChip key={g.value} label={g.label} value={g.value} />
              ))}
            </nav>
          </div>
        </section>

        {/* ── Shop by Category ─────────────────────────────── */}
        {topCategories.length > 0 && (
          <section className="bg-stone-50 py-14 md:py-24" aria-labelledby="categories-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="categories-heading">
                <SectionHeading
                  eyebrow="Collections"
                  title="Shop by Category"
                  description="Browse the full VÉLORA taxonomy — every collection curated around how you actually train and recover."
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topCategories.map((c) => (
                  <CategoryCard key={c.slug} category={c} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Men's Fitness ────────────────────────────────── */}
        <FeatureBlock
          eyebrow="For Him"
          title="Men's Fitness"
          description="Serious training gear for him — racks, weights, conditioning tools, and activewear built for the grind. Curated with the same editorial rigor as everything we feature."
          image="/images/mens-fitness.webp"
          imageAlt="Curated men's fitness collection — strength and conditioning essentials"
          category={men}
          href="/c/men"
          dark
          flip
        />

        {/* ── Popular Equipment ────────────────────────────── */}
        <section className="bg-cream py-14 md:py-24" aria-labelledby="equipment-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div id="equipment-heading">
              <SectionHeading
                eyebrow="The Gear Behind the Results"
                title="Popular Equipment"
                description="Smart, space-conscious, and built to last — the equipment our editors rate highest."
                href="/c/equipment"
                linkLabel="All equipment"
              />
            </div>
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
              <div className="relative overflow-hidden rounded-3xl">
                <Image
                  src="/images/equipment.webp"
                  alt="Premium home gym equipment collection"
                  width={800}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-ink/10"
                />
              </div>
              <div>
                {(equipmentCat?.children?.length ?? 0) > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {(equipmentCat?.children ?? []).slice(0, 4).map((c) => (
                      <CategoryCard key={c.slug} category={c} />
                    ))}
                  </div>
                ) : equipmentProducts.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {equipmentProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="font-sans text-sm text-ink/60">
                    Equipment picks are being curated.{" "}
                    <Link href="/c/equipment" className="font-semibold text-golddeep underline-offset-4 hover:underline">
                      Browse the equipment collection
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Recovery and Wellness ────────────────────────── */}
        <FeatureBlock
          eyebrow="Recover Harder"
          title="Recovery and Wellness"
          description="Train hard, recover harder. Massage guns, compression, sleep essentials, and mobility tools — because progress is built between sessions."
          image="/images/recovery.webp"
          imageAlt="Recovery and wellness collection — massage, sleep, and mobility essentials"
          category={recoveryCat}
          href="/c/recovery"
        />

        {/* ── Comparisons ──────────────────────────────────── */}
        {comparisons.length > 0 && (
          <section className="bg-stone-50 py-14 md:py-24" aria-labelledby="compare-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="compare-heading">
                <SectionHeading
                  eyebrow="Side by Side"
                  title="Product Comparisons"
                  description="Head-to-head breakdowns of the products you're deciding between — specs, prices, and honest trade-offs."
                />
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {comparisons.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/compare/${c.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-sand bg-white/70 p-7 transition-shadow duration-300 hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.35)]"
                  >
                    <Badge tone="outline" className="self-start">
                      Comparison
                    </Badge>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-ink/65">
                        {c.description}
                      </p>
                    )}
                    <span className="mt-auto pt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-golddeep group-hover:underline group-hover:underline-offset-4">
                      Compare {c.productIds.length} products &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Buying Guides ────────────────────────────────── */}
        {guides.length > 0 && (
          <section className="bg-cream py-14 md:py-24" aria-labelledby="guides-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="guides-heading">
                <SectionHeading
                  eyebrow="Expert Advice"
                  title="Buying Guides"
                  description="What to look for, what to skip, and which picks earn our recommendation — written by people who train."
                  href="/guides"
                  linkLabel="All guides"
                />
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {guides.map((g) => (
                  <GuideCard
                    key={g.slug}
                    slug={g.slug}
                    title={g.title}
                    excerpt={g.excerpt}
                    image={g.featuredImage}
                    date={g.publishedAt}
                    authorName={g.author?.name ?? null}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Latest Discoveries ───────────────────────────── */}
        {latest.length > 0 && (
          <section className="bg-stone-50 py-14 md:py-24" aria-labelledby="latest-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="latest-heading">
                <SectionHeading
                  eyebrow="Fresh Finds"
                  title="Latest Fitness Discoveries"
                  description="The newest additions to the VÉLORA collection — vetted, curated, and ready to explore."
                />
              </div>
              <ProductRail products={latest} />
            </div>
          </section>
        )}

        {/* ── Newsletter ───────────────────────────────────── */}
        <section className="bg-cream px-4 py-14 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Newsletter />
          </div>
        </section>

        {/* ── Trust / editorial ────────────────────────────── */}
        <section className="border-t border-sand bg-cream py-14 md:py-20" aria-labelledby="trust-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div id="trust-heading">
              <SectionHeading
                align="center"
                eyebrow="Our Promise"
                title="Curated Like It Matters"
              />
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="text-center">
                <h3 className="font-display text-xl font-semibold text-ink">Independent Curation</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/65">
                  Every product is chosen by our editors for quality, design, and real-world
                  value. No paid placements in our picks — ever.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-display text-xl font-semibold text-ink">Honest Presentation</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/65">
                  Prices, ratings, and specifications are shown exactly as provided. When
                  information is missing, we say so instead of guessing.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-display text-xl font-semibold text-ink">Transparent Affiliates</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/65">
                  When you buy through our links, we may earn a commission at no extra cost to
                  you. It keeps our curation independent.
                </p>
              </div>
            </div>
            <nav aria-label="Editorial and trust" className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {[
                { label: "About VÉLORA", href: "/about" },
                { label: "Editorial Policy", href: "/editorial-policy" },
                { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-golddeep underline-offset-4 hover:underline"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function GuideCard({
  slug,
  title,
  excerpt,
  image,
  date,
  authorName,
}: {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  date: Date | null;
  authorName: string | null;
}) {
  const initial = title.trim().charAt(0).toUpperCase() || "V";
  return (
    <Link
      href={`/guides/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand bg-white/70 transition-shadow duration-300 hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.35)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal"
          >
            <span className="font-display text-5xl font-semibold text-gold">{initial}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Badge tone="outline" className="self-start">
          Buying Guide
        </Badge>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-golddeep">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-ink/65">{excerpt}</p>
        )}
        <p className="mt-auto pt-4 font-sans text-xs uppercase tracking-[0.14em] text-ink/50">
          {authorName && <span>{authorName} · </span>}
          {date
            ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "VÉLORA Editorial"}
        </p>
      </div>
    </Link>
  );
}
