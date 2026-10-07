import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { cx } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

// The hub stays noindex until it is actually populated: index,follow only
// when at least one PUBLISHED article exists, otherwise noindex,follow.
export async function generateMetadata(): Promise<Metadata> {
  const publishedCount = await db.article.count({
    where: { status: "PUBLISHED" },
  });
  const indexable = publishedCount > 0;
  return {
    title: "Fitness Buying Guides for Home Gyms",
    description:
      "Fitness buying guides: best dumbbells, kettlebells, yoga mats & resistance bands for women, plus honest comparisons. Curated picks, zero paid placements.",
    alternates: { canonical: canonical("/guides") },
    robots: { index: indexable, follow: true },
  };
}

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "BUYING_GUIDE", label: "Buying Guides" },
  { value: "REVIEW", label: "Reviews" },
  { value: "COMPARISON", label: "Comparisons" },
  { value: "ROUNDUP", label: "Roundups" },
  { value: "TREND", label: "Trends" },
  { value: "ARTICLE", label: "Articles" },
];

const TYPE_LABELS: Record<string, string> = {
  ARTICLE: "Article",
  BUYING_GUIDE: "Buying Guide",
  REVIEW: "Review",
  COMPARISON: "Comparison",
  ROUNDUP: "Roundup",
  TREND: "Trend",
};

/**
 * Curated guide order + editor-written hub descriptions (2–3 sentences each).
 * The hub renders published guides in this order; guides not yet published
 * (the four 2026 Q4 additions) appear automatically once they go live.
 */
const GUIDE_ORDER: Array<{ slug: string; description: string }> = [
  {
    slug: "best-dumbbells-for-women",
    description:
      "Dumbbells are the foundation of women's strength training — but the wrong pair gathers dust. We compare fixed vs adjustable dumbbells for women, covering which weights to start with, grip and coating differences, and space-saving picks for home gyms, with honest pros and cons for every recommendation.",
  },
  {
    slug: "best-adjustable-dumbbells-small-spaces",
    description:
      "One pair, five minutes of floor space. These are the best adjustable dumbbells for small spaces — compact, quick-change pairs that replace a whole rack, evaluated on footprint, adjustment speed, durability, and value for apartment home gyms.",
  },
  {
    slug: "are-adjustable-dumbbells-worth-it",
    description:
      "Adjustable dumbbells cost more up front — are they actually worth it? We run the cost math against fixed dumbbells, weigh the real pros and cons around space, durability, and convenience, and give an honest verdict for home gym owners.",
  },
  {
    slug: "best-kettlebells-for-women",
    description:
      "Kettlebells build full-body strength and cardio in one tool — but starting weight matters more than brand. Our guide to the best kettlebells for women beginners covers what weight to start with, which shapes and coatings are worth paying for, and beginner-friendly picks that grow with you.",
  },
  {
    slug: "best-resistance-bands-for-women",
    description:
      "Loop vs tube vs fabric: resistance bands aren't one-size-fits-all. We break down the best resistance bands for women for glutes, full-body strength, Pilates, and travel workouts, with honest notes on durability, resistance levels, and which type suits your routine.",
  },
  {
    slug: "resistance-bands-vs-dumbbells",
    description:
      "Bands or dumbbells — which deserves your money first? We compare resistance bands vs dumbbells head-to-head on muscle-building, versatility, cost, space, and joint-friendliness, then give a clear verdict for different goals, plus top picks for both sides.",
  },
  {
    slug: "best-yoga-mat-for-bad-knees",
    description:
      "Knees aching on your mat? The problem is often thickness, not technique. These are the best yoga mats for bad knees — thick, high-density, joint-friendly picks that cushion without wobbling — plus exactly what thickness to buy for your floor and practice.",
  },
  {
    slug: "best-home-gym-equipment-under-100",
    description:
      "You don't need a fortune to train at home. This guide rounds up the best home gym equipment under $100 — resistance bands, ab rollers, jump ropes and more — showing which budget picks actually hold up and which ones to skip.",
  },
  {
    slug: "quiet-home-gym-equipment-apartment",
    description:
      "Thin walls shouldn't kill your workouts. This roundup of quiet home gym equipment for apartments covers noise-free cardio, silent strength tools, and floor-friendly picks — so you can train hard without a single complaint from downstairs.",
  },
];

interface GuidesPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const rawType = searchParams.type;
  const type = (Array.isArray(rawType) ? rawType[0] : rawType)?.toUpperCase() ?? "";
  const validType = TYPE_FILTERS.some((f) => f.value === type) && type !== "" ? type : undefined;

  const articles = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(validType ? { type: validType as "BUYING_GUIDE" } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      type: true,
      publishedAt: true,
      category: { select: { slug: true, name: true } },
      author: { select: { name: true } },
    },
  });

  // Curated display order: published guides are shown in GUIDE_ORDER
  // (each with its editor-written hub description); unpublished guides
  // are skipped so the hub never links to a 404.
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const orderedGuides = GUIDE_ORDER.flatMap(({ slug, description }) => {
    const a = bySlug.get(slug);
    return a ? [{ ...a, hubDescription: description }] : [];
  });
  // Any published article not in the curated list (future guides) is
  // appended after, using its own excerpt.
  for (const a of articles) {
    if (!GUIDE_ORDER.some((g) => g.slug === a.slug)) {
      orderedGuides.push({ ...a, hubDescription: a.excerpt ?? a.title });
    }
  }

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
                Guides
              </li>
            </ol>
          </nav>

          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            Expert Advice
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Fitness Buying Guides
          </h1>
          <div className="mt-4 max-w-3xl space-y-4 font-sans text-sm leading-relaxed text-cream/70 md:text-base">
            <p>
              Choosing fitness equipment shouldn't feel like guesswork — yet walk into the
              dumbbell aisle (or scroll through it online) and you're hit with a wall of
              options, conflicting specs, and sponsored "best" lists that all point at
              whoever paid the most. The VÉLORA fitness buying guides exist to cut through
              exactly that: editor-researched, hands-on-informed recommendations for the
              home gym essentials women and men actually buy, written by people who train.
            </p>
            <p>
              Every guide below answers one real buying question — which dumbbells for
              women, whether adjustable dumbbells are worth it, how to train quietly in an
              apartment, which yoga mat won't wreck your knees — with clear "best for"
              picks, honest pros and cons, and live links to check current prices. No paid
              placements, no invented test scores: a product earns its spot here or it
              doesn't appear at all. Start with your question, compare our picks against
              the curated collections they link to, and buy with confidence from the
              retailer when you're ready.
            </p>
          </div>

          <nav aria-label="Filter by article type" className="mt-8 flex flex-wrap gap-3">
            {TYPE_FILTERS.map((f) => {
              const active = (f.value === "" && !validType) || f.value === validType;
              return (
                <Link
                  key={f.value || "all"}
                  href={f.value ? `/guides?type=${f.value}` : "/guides"}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "rounded-full border px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "border-gold bg-gold text-ink"
                      : "border-cream/20 bg-coal text-cream hover:border-gold hover:text-gold"
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10">
            {orderedGuides.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orderedGuides.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    slug={a.slug}
                    title={a.title}
                    excerpt={a.hubDescription ?? a.excerpt}
                    image={a.featuredImage}
                    typeLabel={TYPE_LABELS[a.type] ?? "Article"}
                    date={a.publishedAt}
                    authorName={a.author?.name ?? null}
                    categoryName={a.category?.name ?? null}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No guides here yet"
                message="Our editors are writing the next round of guides. Explore curated products while you wait."
                actionHref="/trending"
                actionLabel="See Trending Products"
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ArticleCard({
  slug,
  title,
  excerpt,
  image,
  typeLabel,
  date,
  authorName,
  categoryName,
}: {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  typeLabel: string;
  date: Date | null;
  authorName: string | null;
  categoryName: string | null;
}) {
  const initial = title.trim().charAt(0).toUpperCase() || "V";
  return (
    <Link
      href={`/guides/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-coal transition-shadow duration-300 hover:shadow-[0_18px_50px_-18px_rgba(11,10,8,0.35)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-coal">
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="outline">{typeLabel}</Badge>
          {categoryName && (
            <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-cream/50">
              {categoryName}
            </span>
          )}
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-cream transition-colors group-hover:text-gold">
          {title}
        </h2>
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
