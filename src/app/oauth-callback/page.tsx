import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// Pinterest OAuth redirect target. This page is intentionally static: it
// reads no query parameters and never displays any authorization code or
// token values. It only confirms to the account owner that the authorization
// round-trip has completed.
export const metadata: Metadata = {
  title: "Authorization Received",
  description:
    "VÉLORA has received your Pinterest authorization. You can close this window and return to the site.",
  robots: { index: false, follow: false },
};

export default function OAuthCallbackPage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            Pinterest Connection
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            Authorization received
          </h1>

          <div className="article-body mt-8">
            <p>
              Thank you — VÉLORA has received the Pinterest authorization for our own
              account. You can now close this window and return to the site.
            </p>
            <p>
              This page is the redirect destination for VÉLORA&apos;s Pinterest connection.
              It does not display, store, or share any authorization details. You can revoke
              VÉLORA&apos;s access at any time from your Pinterest account&apos;s app
              settings.
            </p>
            <p>
              <Link href="/">Return to the VÉLORA homepage</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
