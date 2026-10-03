import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { markdownToHtml } from "@/lib/markdown";
import { truncate } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TrackView } from "@/components/site/TrackView";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/site/JsonLd";
import { articleJsonLd } from "@/lib/seo";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardProductSelect, toCardProduct } from "@/lib/card-product";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: { slug: string };
}

const TYPE_LABELS: Record<string, string> = {
  ARTICLE: "Article",
  BUYING_GUIDE: "Buying Guide",
  REVIEW: "Review",
  COMPARISON: "Comparison",
  ROUNDUP: "Roundup",
  TREND: "Trend",
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      excerpt: true,
      content: true,
      seoTitle: true,
      seoDescription: true,
      canonicalUrl: true,
      status: true,
    },
  });
  if (!article || article.status !== "PUBLISHED") {
    return { title: "Guide not found — VÉLORA" };
  }
  const description =
    article.seoDescription || article.excerpt || truncate(article.content, 160);
  const meta: Metadata = {
    title: article.seoTitle || article.title,
    description,
    alternates: { canonical: article.canonicalUrl || canonical(`/guides/${params.slug}`) },
  };
  return meta;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      content: true,
      type: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
      categoryId: true,
      category: { select: { slug: true, name: true } },
      author: { select: { name: true, bio: true } },
      status: true,
    },
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const html = markdownToHtml(article.content);
  const publishedAt = article.publishedAt ?? article.updatedAt;
  const typeLabel = TYPE_LABELS[article.type] ?? "Article";

  const relatedProducts = article.categoryId
    ? (
        await db.product.findMany({
          where: { status: "PUBLISHED", categoryId: article.categoryId },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          take: 4,
          select: cardProductSelect,
        })
      ).map(toCardProduct)
    : [];

  const articleJsonLdData = articleJsonLd({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    featuredImage: article.featuredImage,
    publishedAt,
    updatedAt: article.updatedAt,
  });

  return (
    <>
      <Header />
      <TrackView type="guide_view" articleId={article.id} page={`/guides/${article.slug}`} />
      <JsonLd data={articleJsonLdData} />
      <main className="bg-ink">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-cream/50">
              <li>
                <Link href="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/guides" className="hover:text-gold">
                  Guides
                </Link>
              </li>
              {article.category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/c/${article.category.slug}`} className="hover:text-gold">
                      {article.category.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="gold">{typeLabel}</Badge>
            {article.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-coal px-3 py-1 font-sans text-[11px] uppercase tracking-[0.12em] text-cream/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-cream md:text-5xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 font-sans text-lg leading-relaxed text-cream/70">{article.excerpt}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-cream/10 py-4 font-sans text-xs uppercase tracking-[0.14em] text-cream/55">
            <span className="font-semibold text-cream/75">{article.author?.name ?? "VÉLORA Editorial"}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={publishedAt.toISOString()}>
              {publishedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            {article.author?.bio && <span className="w-full normal-case tracking-normal text-cream/55">{article.author.bio}</span>}
          </div>

          {article.featuredImage && (
            <figure className="mt-8 overflow-hidden rounded-3xl">
              <Image
                src={article.featuredImage}
                alt={article.title}
                width={1200}
                height={700}
                sizes="(max-width: 768px) 100vw, 768px"
                className="aspect-[16/9] w-full object-cover"
                priority
              />
            </figure>
          )}

          <div
            className="article-body mt-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <footer className="mt-12 rounded-2xl border border-cream/10 bg-coal p-6">
            <p className="font-sans text-xs leading-relaxed text-cream/60">
              <span className="font-semibold uppercase tracking-[0.16em] text-cream/75">
                Our editorial promise —{" "}
              </span>
              VÉLORA&apos;s guides are written independently. Product links may earn us a
              commission at no extra cost to you, which keeps our curation free and unbiased.{" "}
              <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-gold">
                Read the full affiliate disclosure
              </Link>
              .
            </p>
          </footer>
        </article>

        {relatedProducts.length > 0 && (
          <section className="border-t border-cream/10 bg-coal/60" aria-labelledby="related-products">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
              <h2 id="related-products" className="mb-8 font-display text-2xl font-semibold text-cream md:text-3xl">
                Featured in This Guide
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
