import type { Metadata } from "next";
import { canonical } from "@/lib/site";

/**
 * Metadata for /saved. The page itself is a client component backed by
 * localStorage, so robots directives live here — same pattern as /search:
 * noindex (personal utility page), follow (let crawlers keep discovering).
 */
export const metadata: Metadata = {
  title: "Saved Items",
  description:
    "Your saved VÉLORA products — stored privately in your browser, ready when you are.",
  alternates: { canonical: canonical("/saved") },
  robots: { index: false, follow: true },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
