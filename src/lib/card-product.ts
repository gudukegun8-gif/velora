/**
 * Server-safe product-card data helpers.
 *
 * These are imported by server components (homepage, category, trending,
 * search, guides) to query Prisma and map rows to card props. They live
 * here — NOT in ProductCard.tsx — because ProductCard is a client component
 * ("use client") and client modules may not export non-component values
 * for server use.
 */

/** Structural shape accepted by the card mapper — covers Prisma Decimal
 * (via toString) as well as plain numbers. */
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

/** Select clause for product-card queries (merchant + first image). */
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
