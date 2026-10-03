import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardProductSelect, toCardProduct } from "@/lib/card-product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending Fitness Products",
  description:
    "The fitness products gaining momentum right now — surfaced by real interest and reviewed by VÉLORA editors before they earn a spot.",
  alternates: { canonical: canonical("/trending") },
};

export default async function TrendingPage() {
  const rows = await db.product.findMany({
    where: { status: "PUBLISHED", trendStatus: "PUBLISHED", images: { some: {} } },
    orderBy: [{ trendScore: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: cardProductSelect,
  });
  const products = rows.map(toCardProduct);

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
                Trending
              </li>
            </ol>
          </nav>

          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            What Everyone&apos;s Watching
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Trending Fitness Products
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-cream/70 md:text-base">
            The finds gaining momentum right now — surfaced by real interest, reviewed by our
            editors before they earn a spot. Nothing here is paid placement.
          </p>

          <div className="mt-10">
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing trending yet"
                message="Our editors are reviewing the latest fitness finds. Check back soon — or explore the collections below."
                actionHref="/c/women"
                actionLabel="Explore Women's Fitness"
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
