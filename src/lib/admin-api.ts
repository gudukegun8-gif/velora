import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getSession, type AdminSession } from "./auth";
import { parseJsonSpec, type ProductInput } from "./admin-schemas";

/**
 * Shared helpers for /api/admin/* route handlers.
 */

export async function requireApiAdmin(): Promise<AdminSession | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function validationError(error: z.ZodError): NextResponse {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.issues.map((i) => ({
        path: i.path,
        message: i.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Keep only the fields that were actually present in the raw request body.
 * Prevents zod defaults from leaking into PATCH updates and lets clients
 * distinguish "not sent" (absent) from "clear this field" (null).
 */
export function pickPresent<T extends Record<string, unknown>>(
  raw: unknown,
  parsed: T
): Partial<T> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Partial<T> = {};
  for (const key of Object.keys(raw)) {
    if (key in parsed) {
      (out as Record<string, unknown>)[key] = parsed[key];
    }
  }
  return out;
}

type ProductScalarInput = Omit<ProductInput, "images" | "attributes" | "tags" | "specifications"> & {
  specifications?: string | null;
};

function productScalars(input: Partial<ProductScalarInput>): Prisma.ProductUncheckedUpdateInput {
  const data: Prisma.ProductUncheckedUpdateInput = {};
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.title !== undefined) data.title = input.title;
  if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription;
  if (input.description !== undefined) data.description = input.description;
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.fitnessGoal !== undefined) data.fitnessGoal = input.fitnessGoal;
  if (input.productType !== undefined) data.productType = input.productType;
  if (input.price !== undefined)
    data.price = input.price === null ? null : new Prisma.Decimal(input.price);
  if (input.originalPrice !== undefined)
    data.originalPrice = input.originalPrice === null ? null : new Prisma.Decimal(input.originalPrice);
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.rating !== undefined) data.rating = input.rating;
  if (input.reviewCount !== undefined) data.reviewCount = input.reviewCount;
  if (input.merchantId !== undefined) data.merchantId = input.merchantId;
  if (input.affiliateUrl !== undefined) data.affiliateUrl = input.affiliateUrl;
  if (input.originalUrl !== undefined) data.originalUrl = input.originalUrl;
  if (input.status !== undefined) data.status = input.status;
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
  if (input.trendStatus !== undefined) data.trendStatus = input.trendStatus;
  if (input.trendScore !== undefined) data.trendScore = input.trendScore;
  if (input.dataSource !== undefined) data.dataSource = input.dataSource;
  if (input.specifications !== undefined)
    data.specifications =
      input.specifications == null
        ? Prisma.DbNull
        : (parseJsonSpec(input.specifications) as Prisma.InputJsonValue);
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription;
  if (input.seoKeywords !== undefined) data.seoKeywords = input.seoKeywords;
  return data;
}

/**
 * Prisma create payload for a product (nested relations included).
 * Built explicitly (not from productScalars) because create inputs reject
 * the field-update-operation types that update inputs allow.
 */
export function productCreateData(input: ProductInput): Prisma.ProductUncheckedCreateInput {
  return {
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    description: input.description,
    categoryId: input.categoryId,
    gender: input.gender,
    fitnessGoal: input.fitnessGoal,
    productType: input.productType,
    price: input.price == null ? input.price : new Prisma.Decimal(input.price),
    originalPrice:
      input.originalPrice == null ? input.originalPrice : new Prisma.Decimal(input.originalPrice),
    currency: input.currency,
    rating: input.rating,
    reviewCount: input.reviewCount,
    merchantId: input.merchantId,
    affiliateUrl: input.affiliateUrl,
    originalUrl: input.originalUrl,
    status: input.status,
    isFeatured: input.isFeatured,
    trendStatus: input.trendStatus,
    trendScore: input.trendScore,
    dataSource: input.dataSource,
    specifications:
      input.specifications === undefined
        ? undefined
        : input.specifications === null
          ? Prisma.DbNull
          : (parseJsonSpec(input.specifications) as Prisma.InputJsonValue),
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoKeywords: input.seoKeywords,
    images: {
      create: input.images.map((img, idx) => ({
        url: img.url,
        alt: img.alt ?? null,
        sortOrder: img.sortOrder ?? idx,
      })),
    },
    attributes: {
      create: input.attributes.map((a) => ({ key: a.key, value: a.value })),
    },
    tags: {
      create: input.tags.map((t) => ({ tag: t })),
    },
  };
}

/**
 * Prisma update payload for a product.
 * Nested relations (images/attributes/tags) are replaced wholesale when present.
 */
export function productUpdateData(
  input: Partial<ProductInput>
): Prisma.ProductUncheckedUpdateInput {
  const data: Prisma.ProductUncheckedUpdateInput = productScalars(input);
  if (input.images !== undefined) {
    data.images = {
      deleteMany: {},
      create: input.images.map((img, idx) => ({
        url: img.url,
        alt: img.alt ?? null,
        sortOrder: img.sortOrder ?? idx,
      })),
    };
  }
  if (input.attributes !== undefined) {
    data.attributes = {
      deleteMany: {},
      create: input.attributes.map((a) => ({ key: a.key, value: a.value })),
    };
  }
  if (input.tags !== undefined) {
    data.tags = {
      deleteMany: {},
      create: input.tags.map((t) => ({ tag: t })),
    };
  }
  return data;
}
