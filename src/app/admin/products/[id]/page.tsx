import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ProductForm, { type ProductFormInitial } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Product — VÉLORA Admin",
};

function serializeSpec(spec: unknown): string {
  if (spec === null || spec === undefined) return "";
  if (typeof spec === "string") return spec;
  try {
    return JSON.stringify(spec, null, 2);
  } catch {
    return "";
  }
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const [product, categories, merchants] = await Promise.all([
    db.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        attributes: true,
        tags: true,
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.merchant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) {
    notFound();
  }

  const initial: ProductFormInitial = {
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    description: product.description,
    categoryId: product.categoryId,
    gender: product.gender,
    fitnessGoal: product.fitnessGoal,
    productType: product.productType,
    price: product.price != null ? String(product.price) : null,
    originalPrice: product.originalPrice != null ? String(product.originalPrice) : null,
    currency: product.currency,
    rating: product.rating != null ? String(product.rating) : null,
    reviewCount: product.reviewCount != null ? String(product.reviewCount) : null,
    merchantId: product.merchantId,
    affiliateUrl: product.affiliateUrl,
    originalUrl: product.originalUrl,
    status: product.status,
    isFeatured: product.isFeatured,
    trendStatus: product.trendStatus,
    trendScore: String(product.trendScore),
    dataSource: product.dataSource,
    specifications: serializeSpec(product.specifications),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
    attributes: product.attributes.map((a) => ({ key: a.key, value: a.value })),
    tags: product.tags.map((t) => t.tag),
  };

  return (
    <div>
      <PageHeader title="Edit Product" subtitle={product.title} />
      <ProductForm
        mode="edit"
        productId={product.id}
        initial={initial}
        categories={categories}
        merchants={merchants}
      />
    </div>
  );
}
