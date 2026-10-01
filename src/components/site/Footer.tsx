import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Newsletter } from "@/components/site/Newsletter";

const FALLBACK_DISCLOSURE =
  "VÉLORA may earn a commission when you buy through links on this page. This supports our independent curation at no extra cost to you.";

const SHOP_LINKS = [
  { label: "Women's Fitness", href: "/c/women" },
  { label: "Men's Fitness", href: "/c/men" },
  { label: "Equipment", href: "/c/equipment" },
  { label: "Workouts", href: "/c/workouts" },
  { label: "Recovery", href: "/c/recovery" },
];

const DISCOVER_LINKS = [
  { label: "Trending Now", href: "/trending" },
  { label: "Buying Guides", href: "/guides" },
  { label: "Product Comparisons", href: "/guides?type=COMPARISON" },
  { label: "Saved Items", href: "/saved" },
  { label: "Search", href: "/search" },
];

const TRUST_LINKS = [
  { label: "About VÉLORA", href: "/about" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

async function getDisclosure(): Promise<string> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "affiliate_disclosure_short" },
      select: { value: true },
    });
    return setting?.value?.trim() || FALLBACK_DISCLOSURE;
  } catch {
    return FALLBACK_DISCLOSURE;
  }
}

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.45 7.58 5.96 9.13-.08-.78-.16-1.98.03-2.83.17-.72 1.1-4.63 1.1-4.63s-.28-.56-.28-1.39c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.31 0 .8-.51 2-.77 3.11-.22.93.46 1.68 1.38 1.68 1.65 0 2.92-1.74 2.92-4.25 0-2.22-1.6-3.78-3.88-3.78-2.65 0-4.2 1.99-4.2 4.04 0 .8.31 1.66.69 2.13.08.09.09.17.07.26-.07.31-.24.98-.27 1.11-.04.18-.14.22-.33.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.46 0 6.16 2.47 6.16 5.77 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.96-.53-2.29-1.15l-.62 2.37c-.23.87-.84 1.96-1.25 2.62.94.29 1.94.45 2.97.45 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/**
 * Site footer on ink: brand, nav columns, trust links, affiliate disclosure
 * snippet (from the affiliate_disclosure_short site setting with a fallback),
 * newsletter mini-form, and social icons only when the env URLs are set.
 */
export async function Footer() {
  const disclosure = await getDisclosure();
  const pinterestUrl =
    process.env.NEXT_PUBLIC_Pinterest_URL || process.env.NEXT_PUBLIC_PINTEREST_URL;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <footer className="border-t border-cream/10 bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
          <div>
            <Link href="/" aria-label="VÉLORA home" className="inline-flex">
              <Image
                src="/images/logo.webp"
                alt="VÉLORA"
                width={150}
                height={38}
                loading="lazy"
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-cream/65">
              Premium fitness and lifestyle product discovery — curated essentials,
              honest editorial, and the gear actually worth your attention.
            </p>
            {(pinterestUrl || instagramUrl) && (
              <div className="mt-6 flex gap-3">
                {pinterestUrl && (
                  <a
                    href={pinterestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="VÉLORA on Pinterest"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/75 transition-colors hover:border-gold hover:text-gold"
                  >
                    <PinterestIcon />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="VÉLORA on Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/75 transition-colors hover:border-gold hover:text-gold"
                  >
                    <InstagramIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          <nav aria-label="Shop">
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-cream/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Discover">
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Discover
            </h3>
            <ul className="space-y-3">
              {DISCOVER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-cream/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Trust">
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Trust
            </h3>
            <ul className="space-y-3">
              {TRUST_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-cream/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              The VÉLORA Edit
            </h3>
            <p className="mb-4 font-sans text-sm leading-relaxed text-cream/65">
              One considered briefing a week. No noise, unsubscribe anytime.
            </p>
            <Newsletter variant="mini" />
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8">
          <p className="mx-auto max-w-3xl text-center font-sans text-xs leading-relaxed text-cream/50">
            <span className="font-semibold uppercase tracking-[0.18em] text-cream/60">
              Affiliate Disclosure —{" "}
            </span>
            {disclosure}{" "}
            <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-gold">
              Read the full disclosure
            </Link>
            .
          </p>
          <p className="mt-6 text-center font-sans text-xs text-cream/40">
            © {new Date().getFullYear()} VÉLORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
