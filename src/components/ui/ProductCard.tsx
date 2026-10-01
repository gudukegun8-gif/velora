import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SaveButton } from "@/components/site/SaveButton";
import { cx, formatPrice } from "@/lib/utils";

/**
 * Structural shape accepted by the card mapper — covers Prisma Decimal
 * (via toString) as well as plain numbers.
 */
export interface CardProductInput {
  id: string;
  slug: string;
  title: string;
  price: { toString(): string } | number | string | null;
  currency?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  merchant?: { name: string } | null;
  images?: Array<{ url: string }>;
  isFeatured?: boolean;
  trendStatus?: string;
}

export interface CardProduct {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  merchantName: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  trending: boolean;
}

export function toCardProduct(p: CardProductInput): CardProduct {
  const price =
    p.price === null || p.price === undefined
      ? null
      : Number(typeof p.price === "object" ? p.price.toString() : p.price);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: price !== null && Number.isFinite(price) ? price : null,
    currency: p.currency ?? "USD",
    rating: typeof p.rating === "number" ? p.rating : null,
    reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : null,
    merchantName: p.merchant?.name ?? null,
    imageUrl: p.images?.[0]?.url ?? null,
    isFeatured: p.isFeatured ?? false,
    trending: p.trendStatus === "PUBLISHED",
  };
}

/**
 * Select clause for product-card queries (merchant + first image).
 */
export const cardProductSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  currency: true,
  rating: true,
  reviewCount: true,
  isFeatured: true,
  trendStatus: true,
  merchant: { select: { name: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
} as const;

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
  const href = `/products/${product.slug}`;
  const initial = product.title.trim().charAt(0).toUpperCase() || "V";

  return (
    <article
      className={cx(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-coal transition-all duration-300 hover:border-gold/30 hover:shadow-[0_18px_50px_-18px_rgba(198,161,91,0.35)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coal via-ink to-coal"
          >
            <span className="font-display text-6xl font-semibold text-gold">{initial}</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {product.trending && <Badge tone="gold">Trending</Badge>}
          {product.isFeatured && <Badge tone="ink">Editor&apos;s Pick</Badge>}
        </div>
        <div className="absolute right-3 top-3 z-10">
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
          <p className="mb-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold">
            {product.merchantName}
          </p>
        )}
        <h3 className="font-display text-xl font-semibold leading-snug text-cream">
          <Link href={href} className="transition-colors hover:text-gold">
            <span className="absolute inset-0" aria-hidden="true" />
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {product.price !== null ? (
              <p className="font-sans text-base font-semibold text-cream">
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
          <span className="relative z-10 shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-gold underline-offset-4 group-hover:underline">
            View Product
          </span>
        </div>
      </div>
    </article>
  );
}
