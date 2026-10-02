import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";

const FALLBACK_DISCLOSURE =
  "VÉLORA may earn a commission when you buy through links on this page. This supports our independent curation at no extra cost to you.";

const SHOP_LINKS = [
  { label: "Women's Fitness", href: "/c/women" },
  { label: "Men's Training", href: "/c/men" },
  { label: "Trending", href: "/trending" },
  { label: "Saved", href: "/saved" },
];

const DISCOVER_LINKS = [
  { label: "Buying Guides", href: "/guides" },
  { label: "Comparisons", href: "/guides?type=COMPARISON" },
  { label: "Categories", href: "/#categories-heading" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Editorial Policy", href: "/editorial-policy" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
];

const SOCIAL_LINKS = [
  {
    label: "VÉLORA on Pinterest",
    href: "https://www.pinterest.com/velorafitness/",
    Icon: PinterestIcon,
  },
  {
    label: "VÉLORA on Instagram",
    href: "https://www.instagram.com/vfx_ladka8/",
    Icon: InstagramIcon,
  },
  {
    label: "VÉLORA on X",
    href: "https://x.com/thakursahb786",
    Icon: XIcon,
  },
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

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-5 font-sans text-xs font-medium uppercase tracking-[0.22em] text-gold">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="font-sans text-sm text-cream/70 transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Site footer on ink: brand wordmark, nav columns, social row, affiliate
 * disclosure snippet (from the affiliate_disclosure_short site setting with a
 * fallback), and the Amazon Associates attribution line.
 */
export async function Footer() {
  const disclosure = await getDisclosure();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cream/10 bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label="VÉLORA home"
              className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <Image
                src="/images/logo-v2.webp"
                alt="VÉLORA"
                width={128}
                height={128}
                className="h-16 w-16 object-contain"
              />
            </Link>
            <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-cream/65">
              Premium fitness and lifestyle product discovery — curated essentials,
              honest picks.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/75 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Shop" links={SHOP_LINKS} />
          <LinkColumn title="Discover" links={DISCOVER_LINKS} />
          <LinkColumn title="Company" links={COMPANY_LINKS} />
          <LinkColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8">
          <p className="mx-auto max-w-3xl text-center font-sans text-xs leading-relaxed text-cream/50">
            <span className="font-medium uppercase tracking-[0.18em] text-cream/60">
              Affiliate Disclosure —{" "}
            </span>
            {disclosure}{" "}
            <Link
              href="/affiliate-disclosure"
              className="underline underline-offset-2 hover:text-gold"
            >
              Read the full disclosure
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="font-sans text-xs text-cream/40">© {year} VÉLORA. All rights reserved.</p>
            <p className="font-sans text-xs text-cream/40">
              As an Amazon Associate and affiliate partner, we earn from qualifying purchases.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
