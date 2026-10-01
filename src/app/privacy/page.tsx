import type { Metadata } from "next";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | VÉLORA",
  description:
    "VÉLORA's privacy policy: what data we collect, how we use it, and the choices you have.",
  alternates: { canonical: canonical("/privacy") },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
            Your Data
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-4 font-sans text-sm text-ink/55">
            Last updated: October 2026
          </p>

          <div className="article-body mt-8">
            <p>
              VÉLORA is a product discovery publication. We collect as little personal data as
              possible, we never sell it, and this policy explains what we do collect and why.
            </p>
            <h2>1. Information you give us</h2>
            <ul>
              <li>
                <strong>Newsletter signup:</strong> if you subscribe to The VÉLORA Edit, we
                store your email address to send you the newsletter. You can unsubscribe at
                any time via the link in every email.
              </li>
              <li>
                <strong>Contact messages:</strong> if you email us, we receive whatever you
                include in your message so we can respond.
              </li>
            </ul>
            <h2>2. Information stored on your device</h2>
            <p>
              Your saved-products list is stored in your own browser&apos;s local storage. It
              never leaves your device and we can&apos;t see it. Clearing your browser data
              removes it permanently.
            </p>
            <h2>3. Information collected automatically</h2>
            <p>
              We record anonymous, aggregate analytics — such as which pages are viewed and
              which outbound links are clicked — to understand what our readers find useful.
              These events are not tied to your identity, and we don&apos;t use third-party
              advertising trackers or cross-site profiling.
            </p>
            <h2>4. Affiliate links</h2>
            <p>
              When you click through to a merchant via an affiliate link, that merchant&apos;s
              own privacy policy applies from the moment you leave VÉLORA. We encourage you to
              review it; see our <Link href="/affiliate-disclosure">affiliate disclosure</Link> for
              how these links work.
            </p>
            <h2>5. Data sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for
              their marketing. We share data only as required to operate the site (for
              example, with our hosting and email providers) or as required by law.
            </p>
            <h2>6. Your choices</h2>
            <ul>
              <li>Unsubscribe from the newsletter at any time via any email we send.</li>
              <li>Ask us to delete your newsletter subscription by <Link href="/contact">contacting us</Link>.</li>
              <li>Use your browser settings to block cookies or clear local storage.</li>
            </ul>
            <h2>7. Children</h2>
            <p>
              VÉLORA is intended for adults. We do not knowingly collect information from
              children under 13.
            </p>
            <h2>8. Changes to this policy</h2>
            <p>
              If we change this policy, we&apos;ll update the date above. Material changes
              will be noted here for at least 30 days.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
