import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
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
        url: "/images/hero.png",
        width: 1536,
        height: 1024,
        alt: "VÉLORA — Premium Fitness & Lifestyle Product Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-sans bg-cream text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
