import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Editorial Policy | VÉLORA",
  description:
    "How VÉLORA chooses products, writes guides, and keeps affiliate relationships from influencing editorial decisions.",
  alternates: { canonical: canonical("/editorial-policy") },
};

export default function EditorialPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
            How We Work
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            Editorial Policy
          </h1>
          <p className="mt-4 font-sans text-sm text-ink/55">
            Last updated: October 2026
          </p>

          <div className="article-body mt-8">
            <h2>1. Independence first</h2>
            <p>
              VÉLORA&apos;s editors choose every featured product independently. No merchant,
              brand, or affiliate partner can pay for placement in our picks, trending lists,
              comparisons, or guides — and commission rates never influence rankings or
              recommendations. If a product earns a commission and a competitor doesn&apos;t,
              the better product still wins.
            </p>
            <h2>2. How products are selected</h2>
            <p>
              We surface products through a mix of trend signals, merchant catalogs, and
              editorial research, then apply human judgment: build quality, design, value for
              money, and real-world suitability for the training goal at hand. Products that
              don&apos;t meet our bar don&apos;t get published, no matter how popular they are.
            </p>
            <h2>3. Honest presentation</h2>
            <p>
              Prices, ratings, review counts, and specifications are displayed exactly as
              provided by the merchant or our data sources. We never invent specifications,
              fabricate review scores, or Photoshop results. When data is missing or
              unavailable, we say so plainly instead of guessing — you&apos;ll see
              &ldquo;price unavailable&rdquo; or &ldquo;—&rdquo; rather than a made-up number.
            </p>
            <h2>4. Reviews and ratings shown on VÉLORA</h2>
            <p>
              Where we display ratings or review counts, they reflect aggregated merchant data
              or clearly attributed editorial assessment — not invented testimonials. We do not
              publish fake reviews.
            </p>
            <h2>5. Corrections</h2>
            <p>
              We correct errors promptly and transparently. If you spot inaccurate product
              information on VÉLORA, <Link href="/contact">tell us</Link> and we&apos;ll
              investigate and fix it.
            </p>
            <h2>6. Affiliate transparency</h2>
            <p>
              Our affiliate relationships are disclosed on every product page, in our footer,
              and in full on our <Link href="/affiliate-disclosure">affiliate disclosure</Link> page.
              Outbound purchase links are marked so you always know when you&apos;re leaving
              VÉLORA for a merchant.
            </p>
            <h2>7. We don&apos;t sell products</h2>
            <p>
              VÉLORA is a discovery publication, not a retailer. Purchases, shipping, returns,
              and warranties are handled entirely by the merchant under their terms. Our role
              is curation and honest editorial — nothing more, nothing less.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
