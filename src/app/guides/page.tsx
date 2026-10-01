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

export const metadata: Metadata = {
  title: "Buying Guides & Fitness Editorial | VÉLORA",
  description:
    "VÉLORA buying guides, reviews, and comparisons — what to look for, what to skip, and which fitness products earn our recommendation.",
  alternates: { canonical: canonical("/guides") },
};

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
            Buying Guides & Editorial
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-cream/70 md:text-base">
            What to look for, what to skip, and which picks earn our recommendation — written by
            people who train, free of paid placements.
          </p>

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
            {articles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    slug={a.slug}
                    title={a.title}
                    excerpt={a.excerpt}
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
