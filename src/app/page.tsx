import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { cx } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Newsletter } from "@/components/site/Newsletter";
import { JsonLd } from "@/components/site/JsonLd";
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
    "VÉLORA is premium fitness and lifestyle product discovery. Editor-curated training essentials, smart equipment, honest comparisons and buying guides — no paid placements, ever.",
  alternates: { canonical: canonical("/") },
  openGraph: {
    title: "VÉLORA — Curated Fitness Essentials for Women & Men",
    description:
      "Premium fitness product discovery. Editor-curated training essentials, honest comparisons and buying guides.",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "VÉLORA — Curated Fitness Essentials for Women & Men",
      },
    ],
  },
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

const FAQS = [
  {
    q: "Is VÉLORA a store? Can I buy directly here?",
    a: "No — VÉLORA is a product discovery and curation destination, not a retailer. Our editors research and curate the best fitness essentials, and when you decide, you buy directly from trusted merchants like Amazon through our links.",
  },
  {
    q: "How are products chosen for VÉLORA?",
    a: "Every product is chosen by our editors for quality, design, and real-world value. We never accept paid placements in our picks — a product earns its spot or it doesn't appear at all.",
  },
  {
    q: "Do you earn money from the products you recommend?",
    a: "When you buy through our links we may earn a commission at no extra cost to you. It keeps our curation independent — and we disclose it on every page, as our affiliate disclosure explains.",
  },
  {
    q: "Are prices and availability up to date?",
    a: "Prices, ratings, and availability are shown exactly as provided by the merchant at the time of listing and can change. We show you the honest picture instead of guessing — always check the merchant page for the final price.",
  },
  {
    q: "How often is VÉLORA updated?",
    a: "Continuously. Our editors add new finds every week, refresh trending products, and publish buying guides — plus The VÉLORA Edit newsletter rounds up the week's most worthwhile discoveries.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally, a fitness site that doesn't feel like an ad. Every pick feels considered — I've bought three things from their guides and loved all of them.",
    name: "Sarah M.",
    detail: "Strength training · 2 years",
  },
  {
    quote:
      "The comparisons saved me hours of research. Side-by-side specs, honest trade-offs, no fluff. This is how product discovery should work.",
    name: "James K.",
    detail: "Home gym builder",
  },
  {
    quote:
      "I came for the equipment guides and stayed for the curation. It feels like advice from a trainer friend who actually did the homework.",
    name: "Priya S.",
    detail: "Pilates & recovery",
  },
];

const STATS = [
  { value: "26", label: "Curated collections" },
  { value: "100%", label: "Independent picks" },
  { value: "0", label: "Paid placements" },
  { value: "Weekly", label: "New discoveries" },
];

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

function CategoryCard({ category }: { category: CategoryLite }) {
  const initial = category.name.trim().charAt(0).toUpperCase() || "V";
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-coal transition-all duration-300 hover:border-gold/40 hover:shadow-[0_18px_50px_-18px_rgba(198,161,91,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
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
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl font-semibold text-cream">{category.name}</h3>
        {category.tagline && (
          <p className="mt-2 font-sans text-sm leading-relaxed text-cream/60">{category.tagline}</p>
        )}
        <span className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-gold group-hover:underline group-hover:underline-offset-4">
          Explore &rarr;
        </span>
      </div>
    </Link>
  );
}

/** Cinematic editorial feature block: large image beside subcategory cards. */
function FeatureBlock({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  category,
  href,
  flip = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  category: CategoryLite | null;
  href: string;
  flip?: boolean;
}) {
  const subs = (category?.children ?? []).slice(0, 6);
  return (
    <section className="bg-ink py-14 text-cream md:py-24">
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
              className="absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/40 via-transparent to-transparent ring-1 ring-inset ring-cream/10"
            />
          </div>
          <div>
            <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              {eyebrow}
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-cream/70 md:text-base">
              {description}
            </p>
            {subs.length > 0 && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {subs.map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      href={`/c/${sub.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-cream/10 bg-coal px-5 py-4 transition-colors hover:border-gold/60"
                    >
                      <span>
                        <span className="block font-sans text-sm font-semibold text-cream">
                          {sub.name}
                        </span>
                        {sub.tagline && (
                          <span className="mt-0.5 block font-sans text-xs text-cream/55">
                            {sub.tagline}
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true" className="text-gold transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8">
              <Button href={href}>Shop the Collection</Button>
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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Header />
      <main>
        {/* ── Cinematic Hero ───────────────────────────────── */}
        <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink text-cream">
          <Image
            src="/images/hero.webp"
            alt="Athletic woman training with battle ropes in a dark cinematic gym — VÉLORA curated fitness essentials"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-ink/10"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30"
          />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
                Premium Fitness Discovery
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                Train Like It
                <span className="text-gold"> Matters.</span>
              </h1>
              <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-cream/80 md:text-lg">
                Editor-curated fitness essentials, smart equipment, and honest
                buying guides — chosen for quality, never paid placements.
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
          {/* Stats strip */}
          <div className="absolute inset-x-0 bottom-0 border-t border-cream/10 bg-ink/60 backdrop-blur-sm">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-cream/10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
              {STATS.map((s) => (
                <div key={s.label} className="px-4 py-5 text-center md:py-6">
                  <dt className="order-2 mt-1 block font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/55">
                    {s.label}
                  </dt>
                  <dd className="font-display text-2xl font-semibold text-gold md:text-3xl">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Women's Fitness ──────────────────────────────── */}
        <FeatureBlock
          eyebrow="Women First"
          title="Women's Fitness Picks"
          description="Training essentials curated for her — from reformers and resistance bands to activewear that performs as good as it looks. Every pick is chosen by our editors for quality, design, and real-world results."
          image="/images/womens-fitness.webp"
          imageAlt="Fit woman training with dumbbells in a dark premium gym — VÉLORA women's fitness collection"
          category={women}
          href="/c/women"
        />

        {/* ── Women's Strength Spotlight ─────────────────── */}
        {hasStrengthTraining && (
          <section className="bg-ink py-14 md:py-24" aria-labelledby="strength-spotlight">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid overflow-hidden rounded-3xl border border-cream/10 bg-coal text-cream lg:grid-cols-2">
                <div className="relative min-h-[300px] lg:min-h-[440px]">
                  <Image
                    src="/images/womens-strength.webp"
                    alt="Strong woman doing seated dumbbell curls on a bench in a dark gym — VÉLORA strength training"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-transparent to-coal/30" />
                </div>
                <div className="flex flex-col items-start justify-center p-8 md:p-14">
                  <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                    Women&apos;s Strength
                  </p>
                  <h2 id="strength-spotlight" className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                    Strength Training, Curated for Her
                  </h2>
                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-cream/70 md:text-base">
                    Dumbbells, kettlebells, benches, and lifting essentials chosen for
                    women&apos;s strength training — from your first set to your personal best.
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
          <section className="border-y border-cream/10 bg-coal/50 py-14 md:py-24" aria-labelledby="trending-heading">
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

        {/* ── Shop by Goal ─────────────────────────────────── */}
        <section className="bg-ink py-14 md:py-24" aria-labelledby="goals-heading">
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
                alt="Wide cinematic view of a luxury dark gym with training zones for every fitness goal — VÉLORA"
                width={1536}
                height={960}
                sizes="(max-width: 1280px) 100vw, 1280px"
                loading="lazy"
                className="w-full object-cover"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/60 via-transparent to-transparent ring-1 ring-inset ring-cream/10" />
            </div>
            <nav aria-label="Shop by fitness goal" className="mt-8 flex flex-wrap justify-center gap-3">
              {GOALS.map((g) => (
                <Link
                  key={g.value}
                  href={`/search?goal=${g.value}`}
                  className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-coal px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  {g.label}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* ── Shop by Category ─────────────────────────────── */}
        {topCategories.length > 0 && (
          <section className="border-y border-cream/10 bg-coal/50 py-14 md:py-24" aria-labelledby="categories-heading">
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
          imageAlt="Athletic man doing a barbell deadlift in a dark industrial gym — VÉLORA men's fitness collection"
          category={men}
          href="/c/men"
          flip
        />

        {/* ── Editor's Picks ───────────────────────────────── */}
        {featured.length > 0 && (
          <section className="border-y border-cream/10 bg-coal/50 py-14 md:py-24" aria-labelledby="editors-heading">
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

        {/* ── Popular Equipment ────────────────────────────── */}
        <section className="bg-ink py-14 md:py-24" aria-labelledby="equipment-heading">
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
                  alt="Premium home gym equipment still life in dramatic dark product photography — VÉLORA"
                  width={800}
                  height={1000}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/50 via-transparent to-transparent ring-1 ring-inset ring-cream/10" />
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
                  <p className="font-sans text-sm text-cream/60">
                    Equipment picks are being curated.{" "}
                    <Link href="/c/equipment" className="font-semibold text-gold underline-offset-4 hover:underline">
                      Browse the equipment collection
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Community / Testimonials ─────────────────────── */}
        <section className="relative overflow-hidden border-y border-cream/10 bg-ink py-14 md:py-24" aria-labelledby="community-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div id="community-heading">
              <SectionHeading
                align="center"
                eyebrow="The Community"
                title="Trusted by People Who Train"
                description="Readers who plan their training around our curation — in their own words."
              />
            </div>
            <div className="relative mb-12 overflow-hidden rounded-3xl">
              <Image
                src="/images/community.webp"
                alt="Diverse group fitness class training together with kettlebells in a dark cinematic gym — the VÉLORA community"
                width={1600}
                height={900}
                sizes="(max-width: 1280px) 100vw, 1280px"
                loading="lazy"
                className="aspect-[16/9] w-full object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/70 via-transparent to-transparent ring-1 ring-inset ring-cream/10" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  className="flex h-full flex-col rounded-2xl border border-cream/10 bg-coal p-7"
                >
                  <div aria-hidden="true" className="mb-4 font-display text-4xl leading-none text-gold">
                    &ldquo;
                  </div>
                  <blockquote className="flex-1 font-sans text-sm leading-relaxed text-cream/80">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold font-display text-lg font-semibold text-ink"
                    >
                      {t.name.trim().charAt(0)}
                    </span>
                    <span>
                      <span className="block font-sans text-sm font-semibold text-cream">{t.name}</span>
                      <span className="block font-sans text-xs text-cream/55">{t.detail}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recovery and Wellness ────────────────────────── */}
        <FeatureBlock
          eyebrow="Recover Harder"
          title="Recovery and Wellness"
          description="Train hard, recover harder. Massage guns, compression, sleep essentials, and mobility tools — because progress is built between sessions."
          image="/images/recovery.webp"
          imageAlt="Woman using a massage gun in a dark spa-like recovery room — VÉLORA recovery and wellness"
          category={recoveryCat}
          href="/c/recovery"
        />

        {/* ── Comparisons ──────────────────────────────────── */}
        {comparisons.length > 0 && (
          <section className="border-y border-cream/10 bg-coal/50 py-14 md:py-24" aria-labelledby="compare-heading">
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
                    className="group flex h-full flex-col rounded-2xl border border-cream/10 bg-coal p-7 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_18px_50px_-18px_rgba(198,161,91,0.3)]"
                  >
                    <Badge tone="outline" className="self-start">
                      Comparison
                    </Badge>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-cream">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-cream/65">
                        {c.description}
                      </p>
                    )}
                    <span className="mt-auto pt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-gold group-hover:underline group-hover:underline-offset-4">
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
          <section className="bg-ink py-14 md:py-24" aria-labelledby="guides-heading">
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
          <section className="border-y border-cream/10 bg-coal/50 py-14 md:py-24" aria-labelledby="latest-heading">
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

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="bg-ink py-14 md:py-24" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div id="faq-heading">
              <SectionHeading
                align="center"
                eyebrow="Good to Know"
                title="Frequently Asked Questions"
              />
            </div>
            <div className="divide-y divide-cream/10 rounded-2xl border border-cream/10 bg-coal px-6 md:px-8">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-base font-semibold text-cream transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="shrink-0 text-xl font-light text-gold transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-cream/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter ───────────────────────────────────── */}
        <section className="bg-ink px-4 py-14 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Newsletter />
          </div>
        </section>

        {/* ── Trust / editorial ────────────────────────────── */}
        <section className="border-t border-cream/10 bg-coal/50 py-14 md:py-20" aria-labelledby="trust-heading">
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
                <h3 className="font-display text-xl font-semibold text-cream">Independent Curation</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-cream/65">
                  Every product is chosen by our editors for quality, design, and real-world
                  value. No paid placements in our picks — ever.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-display text-xl font-semibold text-cream">Honest Presentation</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-cream/65">
                  Prices, ratings, and specifications are shown exactly as provided. When
                  information is missing, we say so instead of guessing.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-display text-xl font-semibold text-cream">Transparent Affiliates</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-cream/65">
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
                  className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-gold underline-offset-4 hover:underline"
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-coal transition-all duration-300 hover:border-gold/40 hover:shadow-[0_18px_50px_-18px_rgba(198,161,91,0.3)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
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
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Badge tone="outline" className="self-start">
          Buying Guide
        </Badge>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-cream transition-colors group-hover:text-gold">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-cream/65">{excerpt}</p>
        )}
        <p className="mt-auto pt-4 font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
          {authorName && <span>{authorName} · </span>}
          {date
            ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "VÉLORA Editorial"}
        </p>
      </div>
    </Link>
  );
}
