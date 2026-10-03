import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VÉLORA — Premium Fitness & Lifestyle Product Discovery",
    template: "%s | VÉLORA",
  },
  description:
    "VÉLORA is a women-first fitness and lifestyle product discovery destination — thoughtfully curated picks, expert comparisons, and buying guides to help you train and live well.",
  openGraph: {
    type: "website",
    siteName: "VÉLORA",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "VÉLORA — Curated Fitness Essentials for Women & Men",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VÉLORA — Curated Fitness Essentials for Women & Men",
    description:
      "Premium fitness product discovery. Editor-curated training essentials, honest comparisons and buying guides.",
    images: ["/images/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VÉLORA",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.webp`,
    description:
      "VÉLORA is a premium fitness and lifestyle product discovery destination — editor-curated training essentials, honest comparisons, and buying guides.",
    sameAs: [
      "https://www.pinterest.com/velorafitness/",
      "https://www.instagram.com/vfx_ladka8/",
      "https://x.com/thakursahb786",
      "https://www.threads.com/@vfx_ladka8",
      "https://velorafitness.tumblr.com/",
      "https://velorafitness.bsky.social/",
      "https://velorafitness.substack.com/",
      "https://t.me/velorafitness",
      process.env.NEXT_PUBLIC_Pinterest_URL || process.env.NEXT_PUBLIC_PINTEREST_URL,
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    ].filter(Boolean),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VÉLORA",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-sans bg-ink text-cream antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.body.classList.add('js');var io;function reveal(el){el.classList.add('reveal-visible');if(io)io.unobserve(el)}try{io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)reveal(e.target)})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});var watch=function(){document.querySelectorAll('.reveal:not(.reveal-visible)').forEach(function(el){io.observe(el)})};watch();new MutationObserver(watch).observe(document.body,{childList:true,subtree:true})}catch(e){document.querySelectorAll('.reveal').forEach(reveal)}})();`,
          }}
        />
        <JsonLd data={[orgJsonLd, websiteJsonLd]} />
        {children}
      </body>
    </html>
  );
}
