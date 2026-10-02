"use client";

import { useState, type SyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SaveButton } from "@/components/site/SaveButton";
import { ProductModal, type ProductModalProduct } from "@/components/ui/ProductModal";
import { cx, formatPrice } from "@/lib/utils";
import type { CardProduct } from "@/lib/card-product";

interface ProductCardProps {
  product: CardProduct;
  className?: string;
}

/**
 * Product discovery card. VÉLORA is a discovery/curation layer — the card
 * never implies we sell the product; the CTA leads to the product detail
 * page, which links out to the merchant.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const href = `/products/${product.slug}`;
  const initial = product.title.trim().charAt(0).toUpperCase() || "V";

  const modalProduct: ProductModalProduct = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    currency: product.currency,
    merchantName: product.merchantName,
    rating: product.rating,
    reviewCount: product.reviewCount,
    imageUrl: product.imageUrl,
  };

  // Whole-card click opens the quick-view modal. Nested interactive elements
  // (View Product link, title link, SaveButton) stop propagation so they keep
  // their own behavior.
  const openModal = () => setModalOpen(true);
  const stop = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <article
      className={cx(
        "lift-on-hover group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl",
        "border border-cream/[0.08] bg-gradient-to-b from-coal via-coal to-[#0d0b08]",
        "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.5)]",
        "hover:border-gold/25 hover:shadow-[0_24px_60px_-20px_rgba(198,161,91,0.28),0_8px_24px_-8px_rgba(0,0,0,0.6)]",
        className
      )}
      onClick={openModal}
      onKeyDown={(e) => {
        // Ignore keys from nested interactive elements (links, SaveButton).
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal();
        }
      }}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`Quick view ${product.title}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              loading="lazy"
            />
            {/* Consistent brand grade on product imagery */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0b08]/25 via-transparent to-transparent" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal"
          >
            <span className="font-display text-6xl font-medium text-gold">{initial}</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {product.trending && <Badge tone="gold">Trending</Badge>}
          {product.isFeatured && <Badge tone="ink">Editor&apos;s Pick</Badge>}
        </div>
        <div className="absolute right-3 top-3 z-10" onClick={stop}>
          <SaveButton
            id={product.id}
            slug={product.slug}
            title={product.title}
            image={product.imageUrl ?? undefined}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.merchantName && (
          <p className="mb-1.5 text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-gold">
            {product.merchantName}
          </p>
        )}
        <h3 className="font-display text-lg font-medium leading-snug text-cream">
          <Link href={href} onClick={stop} className="transition-colors hover:text-gold">
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {product.price !== null ? (
              <p className="font-sans text-base font-medium text-cream">
                {formatPrice(product.price, product.currency)}
              </p>
            ) : (
              <p className="font-sans text-xs italic text-cream/50">Price at merchant</p>
            )}
            {product.rating !== null && (
              <p className="mt-1 font-sans text-xs text-cream/60">
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
          <Link
            href={href}
            onClick={stop}
            className="relative z-10 shrink-0 font-sans text-xs font-medium uppercase tracking-[0.14em] text-gold underline-offset-4 group-hover:underline"
          >
            View Product
          </Link>
        </div>
      </div>
      {modalOpen && <ProductModal product={modalProduct} onClose={() => setModalOpen(false)} />}
    </article>
  );
}
