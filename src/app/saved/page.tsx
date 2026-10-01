"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { readSaved, type SavedProduct } from "@/components/site/SaveButton";

/**
 * Saved items page. Reads the visitor's localStorage save list
 * (id/slug/title/image stored by SaveButton) — no API needed.
 */
export default function SavedPage() {
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readSaved());
    setLoaded(true);
  }, []);

  const remove = (id: string) => {
    const next = readSaved().filter((item) => item.id !== id);
    try {
      window.localStorage.setItem("velora_saved", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("velora:saved-changed"));
    } catch {
      // ignore
    }
    setItems(next);
  };

  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-golddeep">
            Your List
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            Saved Items
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-ink/70 md:text-base">
            Everything you&apos;ve bookmarked, kept privately in your browser. Nothing leaves your
            device.
          </p>

          <div className="mt-10">
            {!loaded ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-sand/60" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                title="Nothing saved yet"
                message="Tap the bookmark icon on any product to keep it here for later. Your list is stored only in this browser."
                actionHref="/trending"
                actionLabel="Discover Products"
              />
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/60"
                  >
                    <Link href={`/products/${item.slug}`} className="block">
                      <span className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 90vw, 25vw"
                            loading="lazy"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal font-display text-5xl font-semibold text-gold"
                          >
                            {item.title.trim().charAt(0).toUpperCase() || "V"}
                          </span>
                        )}
                      </span>
                      <span className="block p-5">
                        <span className="block font-display text-xl font-semibold leading-snug text-ink group-hover:text-golddeep">
                          {item.title}
                        </span>
                        <span className="mt-3 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-golddeep">
                          View Product &rarr;
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.title} from saved items`}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-cream/90 text-ink/70 backdrop-blur transition-colors hover:border-golddeep hover:text-golddeep"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
