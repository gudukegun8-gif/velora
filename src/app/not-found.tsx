import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist — but the good stuff is one click away.",
};

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Women's Fitness", href: "/c/women" },
  { label: "Men's Fitness", href: "/c/men" },
  { label: "Trending", href: "/trending" },
  { label: "Guides", href: "/guides" },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-ink text-cream">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <p className="font-display text-8xl font-semibold text-gold md:text-9xl" aria-hidden="true">
            404
          </p>
          <p className="mt-4 text-[11px] font-sans font-semibold uppercase tracking-[0.32em] text-gold/80">
            Off the Beaten Path
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            This page didn&apos;t make the cut
          </h1>
          <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-cream/70 md:text-base">
            The page you&apos;re looking for has moved, or never existed. Let&apos;s get you
            back to the good stuff.
          </p>
          <nav aria-label="Not found" className="mt-10 flex flex-wrap justify-center gap-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-cream/25 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-gold hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
