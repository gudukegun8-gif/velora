import { z } from "zod";

/**
 * Shared zod schemas for admin forms + API routes.
 * Empty strings are normalized to null (explicitly cleared); a field that is
 * absent from the payload stays undefined (unchanged on PATCH).
 */

function opt<T extends z.ZodTypeAny>(schema: T) {
  // Empty strings normalize to null (explicitly cleared); absent stays undefined (unchanged).
  return z.preprocess((v) => (v === "" ? null : v), schema.nullish());
}

export const productStatusEnum = z.enum(["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED"]);
export const trendStatusEnum = z.enum([
  "DISCOVERED",
  "IN_REVIEW",
  "APPROVED",
  "FEATURED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
]);
export const dataSourceEnum = z.enum([
  "VERIFIED",
  "MERCHANT_SUPPLIED",
  "EDITORIAL",
  "AI_SUGGESTED",
  "UNAVAILABLE",
]);
export const genderEnum = z.enum(["WOMEN", "MEN", "UNISEX"]);
export const articleTypeEnum = z.enum([
  "ARTICLE",
  "BUYING_GUIDE",
  "REVIEW",
  "COMPARISON",
  "ROUNDUP",
  "TREND",
]);
export const articleStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(220)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

const httpUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid http(s) URL" }
  );

const jsonTextSchema = z
  .string()
  .trim()
  .max(30000)
  .refine(
    (v) => {
      try {
        JSON.parse(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be valid JSON" }
  );

const boolish = z.preprocess(
  (v) => v === true || v === "true" || v === "on" || v === "1" || v === 1,
  z.boolean()
);

// ─── Products ────────────────────────────────────────────────────────────

export const productImageSchema = z.object({
  url: httpUrlSchema,
  alt: opt(z.string().trim().max(300)),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const productAttributeSchema = z.object({
  key: z.string().trim().min(1, "Attribute key is required").max(120),
  value: z.string().trim().min(1, "Attribute value is required").max(2000),
});

export const productSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required").max(300),
  shortDescription: opt(z.string().trim().max(600)),
  description: opt(z.string().trim().max(30000)),
  categoryId: opt(z.string().trim().min(1).max(50)),
  gender: opt(genderEnum),
  fitnessGoal: opt(z.string().trim().max(120)),
  productType: opt(z.string().trim().max(120)),
  price: opt(z.coerce.number().min(0).max(99999999)),
  originalPrice: opt(z.coerce.number().min(0).max(99999999)),
  currency: opt(z.string().trim().max(10)),
  rating: opt(z.coerce.number().min(0).max(5)),
  reviewCount: opt(z.coerce.number().int().min(0)),
  merchantId: opt(z.string().trim().min(1).max(50)),
  affiliateUrl: opt(httpUrlSchema),
  originalUrl: opt(z.string().trim().max(2000)),
  status: productStatusEnum.default("DRAFT"),
  isFeatured: boolish.default(false),
  trendStatus: trendStatusEnum.default("DISCOVERED"),
  trendScore: z.coerce.number().min(0).max(100).default(0),
  dataSource: dataSourceEnum.default("UNAVAILABLE"),
  specifications: opt(jsonTextSchema),
  seoTitle: opt(z.string().trim().max(200)),
  seoDescription: opt(z.string().trim().max(500)),
  seoKeywords: opt(z.string().trim().max(500)),
  images: z.array(productImageSchema).max(20).default([]),
  attributes: z.array(productAttributeSchema).max(50).default([]),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

export const productPatchSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;

// ─── Articles ────────────────────────────────────────────────────────────

export const articleSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required").max(300),
  excerpt: opt(z.string().trim().max(600)),
  featuredImage: opt(z.string().trim().max(2000)),
  content: z.string().trim().min(1, "Content is required"),
  type: articleTypeEnum.default("ARTICLE"),
  status: articleStatusEnum.default("DRAFT"),
  authorId: opt(z.string().trim().min(1).max(50)),
  categoryId: opt(z.string().trim().min(1).max(50)),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  seoTitle: opt(z.string().trim().max(200)),
  seoDescription: opt(z.string().trim().max(500)),
  canonicalUrl: opt(z.string().trim().max(2000)),
});

export const articlePatchSchema = articleSchema.partial();

// ─── Comparisons ─────────────────────────────────────────────────────────

export const comparisonSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required").max(300),
  description: opt(z.string().trim().max(5000)),
  productIds: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  status: articleStatusEnum.default("DRAFT"),
  seoTitle: opt(z.string().trim().max(200)),
  seoDescription: opt(z.string().trim().max(500)),
});

export const comparisonPatchSchema = comparisonSchema.partial();

// ─── Merchants ───────────────────────────────────────────────────────────

export const merchantSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Name is required").max(200),
  logo: opt(z.string().trim().max(2000)),
  website: httpUrlSchema,
  affiliateNetwork: opt(z.string().trim().max(120)),
  status: opt(z.string().trim().max(40)),
  priority: z.coerce.number().int().min(0).max(100000).default(0),
});

export const merchantPatchSchema = merchantSchema.partial();

// ─── Misc ────────────────────────────────────────────────────────────────

export const trendingPatchSchema = z.object({
  trendStatus: trendStatusEnum,
  isFeatured: boolish.optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const trackEventSchema = z.object({
  type: z.string().trim().min(1).max(80),
  page: opt(z.string().trim().max(2000)),
  productId: opt(z.string().trim().max(50)),
  articleId: opt(z.string().trim().max(50)),
  referrer: opt(z.string().trim().max(2000)),
});

export const siteSettingSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Key is required")
    .max(120)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Use letters, numbers, dots, dashes or underscores"),
  value: z.string().max(10000),
});

export function parseJsonSpec(value: string | undefined): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(value);
}
