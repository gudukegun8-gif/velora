import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | VÉLORA",
  description:
    "VÉLORA's affiliate disclosure: how we earn commissions through merchant links, and how that supports our independent curation.",
  alternates: { canonical: canonical("/affiliate-disclosure") },
};

export default function AffiliateDisclosurePage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            Transparency
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Affiliate Disclosure
          </h1>
          <p className="mt-4 font-sans text-sm text-cream/55">
            Last updated: October 2026
          </p>

          <div className="article-body mt-8">
            <p>
              <strong>
                VÉLORA participates in affiliate marketing programs. When you click a product
                link on our site and make a purchase, we may earn a commission from the
                merchant — at no additional cost to you.
              </strong>
            </p>
            <h2>What this means in practice</h2>
            <p>
              Many of the &ldquo;Check Price&rdquo; buttons and product links on VÉLORA are
              affiliate links. If you follow one and buy something from that merchant, the
              merchant pays us a percentage of the sale as a referral fee. The price you pay is
              exactly the same as if you had visited the merchant directly.
            </p>
            <h2>What this never means</h2>
            <ul>
              <li>
                <strong>No paid placements.</strong> Merchants cannot pay to be featured in our
                picks, trending lists, or guides. Editorial selection is independent of
                affiliate relationships.
              </li>
              <li>
                <strong>No ranking manipulation.</strong> Commission rates do not influence how
                products are ordered, scored, or recommended.
              </li>
              <li>
                <strong>No hidden relationships.</strong> Every outbound product link that can
                earn us a commission is marked as an affiliate link, and our product pages
                state clearly that you&apos;ll be leaving VÉLORA for the merchant.
              </li>
            </ul>
            <h2>Why we use affiliate links</h2>
            <p>
              Affiliate commissions are how VÉLORA stays free and independent. They fund our
              editors&apos; time, our curation, and our guides — without subscriptions,
              paywalls, or selling your data. If you&apos;d rather not use an affiliate link,
              you&apos;re welcome to search for the product directly with the merchant instead;
              we&apos;ll never know the difference.
            </p>
            <h2>Questions</h2>
            <p>
              If anything about our affiliate relationships is unclear, please{" "}
              <Link href="/contact">contact us</Link> — we&apos;d rather over-explain than leave
              you guessing. You can also read our <Link href="/editorial-policy">editorial policy</Link> for
              how we choose what to feature.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
