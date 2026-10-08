import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { canonical } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "About VÉLORA | Premium Fitness Discovery",
  description:
    "VÉLORA is a premium fitness and lifestyle product discovery publication — curated training essentials, honest editorial, and transparent affiliate relationships.",
  alternates: { canonical: canonical("/about") },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
            Our Story
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
            About VÉLORA
          </h1>

          <div className="article-body mt-8">
            <figure className="mb-10 overflow-hidden rounded-3xl ring-1 ring-cream/10">
              <Image
                src="/images/about-story.webp"
                alt="Women training together in a dark premium gym — the VÉLORA story"
                width={1200}
                height={675}
                sizes="(max-width: 768px) 100vw, 768px"
                className="aspect-[16/9] w-full object-cover"
              />
              <figcaption className="border-t border-cream/10 bg-coal px-6 py-4 font-sans text-xs uppercase tracking-[0.18em] text-cream/50">
                The VÉLORA story — real training, honest curation
              </figcaption>
            </figure>
            <p>
              VÉLORA began with a simple frustration: finding fitness products worth buying had
              become a chore. Endless listings, sponsored rankings disguised as reviews, and specs
              buried under marketing copy. We built the discovery experience we wanted for
              ourselves — a curated, editorial-first collection of training essentials, smart
              equipment, and lifestyle products that are genuinely worth your attention.
            </p>
            <h2>What we do</h2>
            <p>
              We discover, vet, and curate fitness and lifestyle products across training,
              equipment, recovery, and wellness. Our editors review what&apos;s gaining momentum,
              test what matters, and publish buying guides that tell you what to look for — and
              what to skip. Every product page shows prices, ratings, and specifications exactly
              as provided by the merchant. When information is missing, we say so rather than
              guessing.
            </p>
            <h2>Women-first, everyone welcome</h2>
            <p>
              VÉLORA is women-first by design: our curation starts with how women train, recover,
              and live. You&apos;ll find dedicated collections for women&apos;s fitness alongside
              serious coverage of men&apos;s training, unisex equipment, and recovery — because
              great gear doesn&apos;t care who you are, but great curation should.
            </p>
            <h2>How we make money</h2>
            <p>
              VÉLORA is free to use. When you buy through links on our site, we may earn a
              commission from the merchant at no extra cost to you. That&apos;s it — no paid
              placements in our picks, no sponsored rankings, no selling your data. Our{" "}
              <Link href="/affiliate-disclosure">affiliate disclosure</Link> and{" "}
              <Link href="/editorial-policy">editorial policy</Link> spell this out in full.
            </p>
            <h2>What we&apos;re not</h2>
            <p>
              We are not a store. We don&apos;t sell products, fulfill orders, or handle returns —
              every purchase happens directly with the merchant, under their terms. What we are
              is a trusted layer between you and an overwhelming marketplace: curators, editors,
              and fellow training obsessives.
            </p>
            <p>
              Questions, feedback, or a product you think deserves our attention?{" "}
              <Link href="/contact">We&apos;d love to hear from you</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
