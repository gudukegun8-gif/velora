import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "VÉLORA's terms of service: how you may use the site, and the limits of what we provide as a product discovery publication.",
  alternates: { canonical: canonical("/terms") },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            The Fine Print
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-4 font-sans text-sm text-cream/55">
            Last updated: October 23, 2026
          </p>

          <div className="article-body mt-8">
            <p>
              By accessing or using VÉLORA at https://velora-nu-peach.vercel.app (the
              &ldquo;Site&rdquo;), you agree to these Terms of Service. If you do not agree
              to them, please do not use the Site.
            </p>
            <h2>1. What VÉLORA is</h2>
            <p>
              VÉLORA is a product discovery publication. We curate and describe fitness and
              lifestyle products and link to third-party merchants where you can buy them. We
              are not a retailer: we don&apos;t sell products, process payments, ship orders,
              or handle returns.
            </p>
            <h2>2. Using the site</h2>
            <p>
              You may browse VÉLORA freely. You agree not to misuse the site — including
              scraping it aggressively, attempting to disrupt it, or misrepresenting its
              content as your own. Our name, logo, and editorial content are our property and
              may not be reproduced without permission.
            </p>
            <h2>3. Product information</h2>
            <p>
              We work hard to present accurate prices, specifications, and availability, but
              this information comes from merchants and can change without notice. The
              merchant&apos;s page is always the authoritative source: please verify price,
              availability, shipping, and return terms there before buying. We&apos;re not
              responsible for discrepancies between what we display and what the merchant
              charges.
            </p>
            <h2>4. Purchases happen with merchants</h2>
            <p>
              Every purchase you make after leaving VÉLORA is a transaction between you and
              the merchant, governed by that merchant&apos;s terms, privacy policy, and
              return policy. We have no involvement in — and no liability for — those
              transactions.
            </p>
            <h2>5. Affiliate relationships</h2>
            <p>
              Some links on VÉLORA are affiliate links, meaning we may earn a commission if
              you buy through them at no extra cost to you. See our{" "}
              <Link href="/affiliate-disclosure">affiliate disclosure</Link> for details.
            </p>
            <h2>6. Health and fitness disclaimer</h2>
            <p>
              All workout guides, exercise instructions, routines, and other fitness content
              on VÉLORA are provided for general information and education only. They are{" "}
              <strong>not medical advice</strong> and are not a substitute for the advice,
              diagnosis, or treatment of a qualified physician or other healthcare
              professional.
            </p>
            <p>
              Consult a qualified physician before starting any exercise program —
              particularly if you are pregnant or postpartum, recovering from an injury, or
              have any medical condition or health concern. Stop exercising and seek medical
              care if you feel pain, dizziness, shortness of breath, or any other warning
              sign. You take part in any exercise described on this Site entirely at your own
              risk, and VÉLORA is not responsible for any injury or health problem that may
              result.
            </p>
            <h2>7. Limitation of liability</h2>
            <p>
              VÉLORA is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law,
              we disclaim warranties of any kind and aren&apos;t liable for any damages
              arising from your use of the site or reliance on its content.
            </p>
            <h2>8. Changes</h2>
            <p>
              We may update these terms from time to time; continued use of the site after
              changes means you accept them.
            </p>
            <h2>9. Contact</h2>
            <p>
              Questions about these terms? Email us at gudukegun8@gmail.com or use our{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
