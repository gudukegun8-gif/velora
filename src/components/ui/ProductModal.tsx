"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cx, formatPrice } from "@/lib/utils";

/**
 * Minimal product shape the modal needs. Deliberately excludes anything
 * affiliate-related — the modal never renders affiliate/Temu links.
 */
export interface ProductModalProduct {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  merchantName: string | null;
  rating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
}

interface ProductModalProps {
  /** The product to display. When null, the modal is unmounted. */
  product: ProductModalProduct | null;
  onClose: () => void;
}

/**
 * Pick the "practical use" lifestyle image by product-title keyword.
 * Falls back to the dumbbells image for everything else.
 */
export function usageImageFor(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("kettlebell")) return "/images/usage-kettlebell.webp";
  if (lower.includes("bench")) return "/images/usage-bench.webp";
  if (lower.includes("dumbbell")) return "/images/usage-dumbbells.webp";
  return "/images/usage-dumbbells.webp";
}

/**
 * Quick-view dialog. Opens from a product card; the only outbound link is
 * the site's own /products/<slug> detail page (which handles affiliate
 * outbound itself). No affiliate/Temu links live here.
 */
export function ProductModal({ product, onClose }: ProductModalProps) {
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closedRef = useRef(false);

  const close = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    setVisible(false);
    // Let the ~200ms exit transition play before unmounting.
    window.setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (!product) return;
    closedRef.current = false;
    // Trigger the enter transition on the next frame.
    const raf = window.requestAnimationFrame(() => setVisible(true));
    // Focus the close button for keyboard users.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 50);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    // Lock body scroll while open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, close]);

  if (!product) return null;

  const href = `/products/${product.slug}`;
  const initial = product.title.trim().charAt(0).toUpperCase() || "V";
  const usageImage = usageImageFor(product.title);

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 sm:p-6",
        visible ? "opacity-100" : "opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.title}`}
    >
      {/* Backdrop — clicking closes the modal. */}
      <button
        type="button"
        aria-label="Close quick view"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm"
      />

      {/* Panel — fade + slight scale transition (~200ms). */}
      <div
        className={cx(
          "relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl border border-cream/10 bg-coal shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] transition-all duration-200 md:grid-cols-2",
          visible ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 bg-ink/70 text-cream backdrop-blur transition-colors hover:border-gold hover:text-gold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Product image. */}
        <div className="relative min-h-[260px] overflow-hidden bg-ink md:min-h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover"
              priority
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full min-h-[260px] w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal"
            >
              <span className="font-display text-8xl font-medium text-gold">{initial}</span>
            </div>
          )}
        </div>

        {/* Details. */}
        <div className="flex flex-col p-6 sm:p-8">
          {product.merchantName && (
            <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
              {product.merchantName}
            </p>
          )}
          <h2 className="font-display text-2xl font-medium leading-snug text-cream sm:text-3xl">
            {product.title}
          </h2>

          <div className="mt-3 flex items-center gap-3">
            {product.price !== null ? (
              <p className="font-sans text-xl font-medium text-cream">
                {formatPrice(product.price, product.currency)}
              </p>
            ) : (
              <p className="font-sans text-sm italic text-cream/50">Price at merchant</p>
            )}
            {product.rating !== null && (
              <p className="font-sans text-sm text-cream/60">
                <span aria-hidden="true" className="text-gold">
                  ★
                </span>{" "}
                <span className="sr-only">Rated </span>
                {product.rating.toFixed(1)}
                {product.reviewCount !== null && product.reviewCount > 0 && (
                  <span className="text-cream/45"> ({product.reviewCount.toLocaleString("en-US")})</span>
                )}
              </p>
            )}
          </div>

          {/* Practical use. */}
          <div className="mt-6">
            <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-cream/50">
              Practical use
            </p>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-cream/10">
              <Image
                src={usageImage}
                alt={`${product.title} in use`}
                fill
                sizes="(max-width: 768px) 90vw, 40vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Link
              href={href}
              className="block w-full rounded-xl bg-gold px-6 py-4 text-center font-sans text-sm font-medium uppercase tracking-[0.18em] text-ink transition-all hover:bg-gold/90 hover:shadow-[0_12px_36px_-12px_rgba(198,161,91,0.6)]"
            >
              View Full Details
            </Link>
            <p className="mt-3 text-center font-sans text-xs text-cream/40">
              Full specs, pricing and merchant options on the product page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
