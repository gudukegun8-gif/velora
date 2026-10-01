import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Product — VÉLORA Admin",
};

export default async function NewProductPage() {
  await requireAdmin();

  const [categories, merchants] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.merchant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader title="New Product" subtitle="Add a product to the catalog." />
      <ProductForm mode="create" categories={categories} merchants={merchants} />
    </div>
  );
}
