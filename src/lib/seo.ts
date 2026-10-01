import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * JSON-LD structured data helpers for VÉLORA.
 *
 * Every helper returns a plain object. Optional schema.org properties are
 * only included when the underlying data is present — values are never
 * fabricated.
 */

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo.png"),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={query}`,
      },
      "query-input": "required name=query",
    },
  };
}

export interface ProductJsonLdInput {
  slug: string;
  title: string;
  shortDescription?: string | null;
  images: { url: string; alt?: string | null }[];
  price?: number | string | null;
  originalPrice?: number | string | null;
  currency?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  merchantName?: string | null;
}

export function productJsonLd(p: ProductJsonLdInput): Record<string, unknown> {
  const hasOffers = p.price != null && !Number.isNaN(Number(p.price));
  const hasRating =
    p.rating != null &&
    !Number.isNaN(Number(p.rating)) &&
    p.reviewCount != null &&
    Number(p.reviewCount) > 0;

  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    url: absoluteUrl(`/products/${p.slug}`),
  };

  if (p.shortDescription) {
    result.description = p.shortDescription;
  }

  if (p.images.length > 0) {
    result.image = p.images.map((img) => img.url);
  }

  if (hasOffers) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      priceCurrency: p.currency || "USD",
      price: Number(p.price),
      availability: "https://schema.org/InStock",
    };
    if (p.originalPrice != null && Number(p.originalPrice) > Number(p.price)) {
      offer.priceSpecification = {
        "@type": "UnitPriceSpecification",
        price: Number(p.originalPrice),
      };
    }
    if (p.merchantName) {
      offer.seller = { "@type": "Organization", name: p.merchantName };
    }
    result.offers = offer;
  }

  if (hasRating) {
    result.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(p.rating),
      reviewCount: Number(p.reviewCount),
    };
  }

  return result;
}

export interface ArticleJsonLdInput {
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export function articleJsonLd(a: ArticleJsonLdInput): Record<string, unknown> {
  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    url: absoluteUrl(`/guides/${a.slug}`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
  };

  if (a.excerpt) {
    result.description = a.excerpt;
  }

  if (a.featuredImage) {
    result.image = [a.featuredImage];
  }

  if (a.publishedAt) {
    result.datePublished = new Date(a.publishedAt).toISOString();
  }

  if (a.updatedAt) {
    result.dateModified = new Date(a.updatedAt).toISOString();
  }

  return result;
}

export interface BreadcrumbJsonLdItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(
  items: BreadcrumbJsonLdItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ComparisonJsonLdInput {
  slug: string;
  title: string;
  description?: string | null;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

/**
 * Minimal structured data for a product comparison page.
 */
export function comparisonJsonLd(
  c: ComparisonJsonLdInput,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    url: absoluteUrl(`/compare/${c.slug}`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
  };

  if (c.description) {
    result.description = c.description;
  }

  if (c.publishedAt) {
    result.datePublished = new Date(c.publishedAt).toISOString();
  }

  if (c.updatedAt) {
    result.dateModified = new Date(c.updatedAt).toISOString();
  }

  return result;
}
