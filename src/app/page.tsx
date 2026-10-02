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
import "./hero.css";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  cardProductSelect,
  toCardProduct,
  type CardProduct,
} from "@/lib/card-product";

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
    title: "Editor-curated, always",
    text: "Every product is chosen by our editors for quality, design, and real-world value. Research first, recommendations second.",
  },
  {
    title: "Zero paid placements",
    text: "Brands cannot buy a spot in our picks. A product earns its place through merit — or it doesn't appear at all.",
  },
  {
    title: "Honest by design",
    text: "Prices and availability are shown exactly as listed by the merchant. We disclose our affiliate relationships on every page.",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Discover",
    text: "Browse curated fitness essentials across categories — every product selected by our editors for real-world value.",
  },
  {
    n: "02",
    title: "Explore",
    text: "Read honest product details, key features, and merchant pricing. No fake reviews, no invented ratings.",
  },
  {
    n: "03",
    title: "Compare",
    text: "Weigh your options with side-by-side comparisons and buying guides written for real training goals.",
  },
  {
    n: "04",
    title: "Shop with the retailer",
    text: "When you're ready, continue to the retailer's site to purchase. We may earn a commission — at no extra cost to you.",
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
  accent = "gold",
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  category: CategoryLite | null;
  href: string;
  flip?: boolean;
  accent?: "gold" | "rose" | "steel";
}) {
  const subs = (category?.children ?? []).slice(0, 6);
  const accents = {
    gold: {
      eyebrow: "text-gold",
      arrow: "text-gold",
      hoverBorder: "hover:border-gold/60",
      glow: "bg-[radial-gradient(60%_50%_at_50%_40%,rgba(201,162,39,0.14),transparent_70%)]",
    },
    rose: {
      eyebrow: "text-[#E2A58C]",
      arrow: "text-[#E2A58C]",
      hoverBorder: "hover:border-[#E2A58C]/60",
      glow: "bg-[radial-gradient(60%_50%_at_50%_40%,rgba(124,63,83,0.35),transparent_70%)]",
    },
    steel: {
      eyebrow: "text-[#A9BECD]",
      arrow: "text-[#A9BECD]",
      hoverBorder: "hover:border-[#A9BECD]/60",
      glow: "bg-[radial-gradient(60%_50%_at_50%_40%,rgba(34,54,78,0.55),transparent_70%)]",
    },
  }[accent];
  return (
    <section className="relative bg-ink py-14 text-cream md:py-24">
      <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0", accents.glow)} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <p className={cx("mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.28em]", accents.eyebrow)}>
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
                      className={cx(
                        "group flex items-center justify-between gap-3 rounded-xl border border-cream/10 bg-coal px-5 py-4 transition-colors",
                        accents.hoverBorder
                      )}
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
                      <span aria-hidden="true" className={cx(accents.arrow, "transition-transform group-hover:translate-x-1")}>
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
  const [women, men, equipmentCat, recoveryCat, topCategories, trendingRaw, featuredRaw, latestRaw, comparisons, guides, smart25Raw, smart50Raw, premiumRaw] =
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
      db.product.findMany({
        where: { status: "PUBLISHED", price: { lt: 25 } },
        orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: cardProductSelect,
      }),
      db.product.findMany({
        where: { status: "PUBLISHED", price: { gte: 25, lt: 50 } },
        orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: cardProductSelect,
      }),
      db.product.findMany({
        where: { status: "PUBLISHED", price: { gte: 100 } },
        orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: cardProductSelect,
      }),
    ]);

  const trending = trendingRaw.map(toCardProduct);
  const featured = featuredRaw.map(toCardProduct);
  const latest = latestRaw.map(toCardProduct);
  const smart25 = smart25Raw.map(toCardProduct);
  const smart50 = smart50Raw.map(toCardProduct);
  const premium = premiumRaw.map(toCardProduct);
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
        {/* ── Cinematic Hero v3: full-bleed image, blurred text panel ── */}
        <section className="relative overflow-hidden bg-ink text-cream">
          {/* Full-bleed background image — fully clear and sharp */}
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src="/images/hero-v2.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-kenburns object-cover object-center"
            />
          </div>
          {/* Readability: gentle darken across, plus a soft blur panel behind the text */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/5 via-ink/45 to-ink/80" />
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[48%] bg-ink/20 backdrop-blur-[3px] md:block" />

          {/* Text — right side, fully readable */}
          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="w-full md:ml-auto md:max-w-xl">
              <p className="hero-reveal hero-reveal-1 mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-gold">
                Curated for Women &amp; Men
              </p>
              <h1 className="hero-reveal hero-reveal-2 font-display text-5xl font-medium leading-[1.08] md:text-6xl">
                Discover Fitness
                <span className="italic text-gold"> You&rsquo;ll Love.</span>
              </h1>
              <p className="hero-reveal hero-reveal-3 mt-6 max-w-lg font-sans text-base leading-relaxed text-cream/85 md:text-lg">
                Handpicked fitness essentials — beautiful gear, honest reviews,
                made for your goals. Never paid placements.
              </p>
              <div className="hero-reveal hero-reveal-4 mt-10 flex flex-wrap gap-4">
                <Button href="/c/women" size="lg">
                  Explore Fitness
                </Button>
                <Button href="/trending" variant="secondary" size="lg">
                  Trending Now
                </Button>
              </div>
              <p className="hero-reveal hero-reveal-5 mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs text-cream/60">
                <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="text-gold">✓</span> 100% independent curation</span>
                <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="text-gold">✓</span> Zero paid placements</span>
                <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="text-gold">✓</span> Updated weekly</span>
              </p>
            </div>
          </div>
{/* Stats strip */}
          <div className="border-t border-cream/10 bg-ink/60 backdrop-blur-sm">
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

        {/* ── How VÉLORA Works ───────────────────────────── */}
        <section className="bg-ink py-14 md:py-24" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div id="how-heading">
              <SectionHeading
                align="center"
                eyebrow="How It Works"
                title="How VÉLORA Works"
                description="VÉLORA is a product discovery destination, not a store. Here's how a visit turns into the right purchase — on the retailer's site."
              />
            </div>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_STEPS.map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-cream/10 bg-coal/60 p-6 transition-colors hover:border-gold/40"
                >
                  <p className="font-display text-3xl font-semibold text-gold/80">{s.n}</p>
                  <h3 className="mt-3 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-cream">
                    {s.title}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-cream/65">{s.text}</p>
                </li>
              ))}
            </ol>
            <p className="mx-auto mt-8 max-w-2xl text-center font-sans text-xs leading-relaxed text-cream/50">
              VÉLORA may earn a commission when you purchase through qualifying links. This does not
              affect the price you pay.{" "}
              <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-gold">
                Read our affiliate disclosure
              </Link>
            </p>
          </div>
        </section>

        {/* ── Women's Fitness ──────────────────────────────── */}
        <FeatureBlock
          accent="rose"
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
                  <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E2A58C]">
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
          accent="steel"
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

        {/* ── Smart Buys ───────────────────────────────────── */}
        {(smart25.length > 0 || smart50.length > 0) && (
          <section className="border-y border-cream/10 bg-coal/50 py-14 md:py-24" aria-labelledby="smart-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div id="smart-heading">
                <SectionHeading
                  eyebrow="Every Budget"
                  title="Smart Buys"
                  description="Great fitness finds don't have to cost a fortune. Editor-curated picks organized by price — no bargain-bin energy, just honest value."
                />
              </div>
              {smart25.length > 0 && (
                <div className="mt-10">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Under $25
                    </h3>
                    <Link
                      href="/search?maxPrice=25"
                      className="font-sans text-xs font-medium text-cream/60 underline-offset-4 hover:text-gold hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <ProductRail products={smart25} />
                </div>
              )}
              {smart50.length > 0 && (
                <div className="mt-10">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Under $50
                    </h3>
                    <Link
                      href="/search?maxPrice=50"
                      className="font-sans text-xs font-medium text-cream/60 underline-offset-4 hover:text-gold hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <ProductRail products={smart50} />
                </div>
              )}
              {premium.length > 0 && (
                <div className="mt-10">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Premium Picks
                    </h3>
                    <Link
                      href="/search?minPrice=100"
                      className="font-sans text-xs font-medium text-cream/60 underline-offset-4 hover:text-gold hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <ProductRail products={premium} />
                </div>
              )}
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

        {/* ── The VÉLORA Standard ──────────────────────────── */}
        <section className="relative overflow-hidden border-y border-cream/10 bg-ink py-14 md:py-24" aria-labelledby="standard-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div id="standard-heading">
              <SectionHeading
                align="center"
                eyebrow="Why Trust Us"
                title="The VÉLORA Standard"
                description="Three commitments behind everything we publish — no exceptions."
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
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.title}
                  className="flex h-full flex-col rounded-2xl border border-cream/10 bg-coal p-7"
                >
                  <div aria-hidden="true" className="mb-4 font-display text-sm font-semibold tracking-[0.3em] text-gold">
                    0{i + 1}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-cream">
                    {t.title}
                  </h3>
                  <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-cream/70">
                    {t.text}
                  </p>
                </div>
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
