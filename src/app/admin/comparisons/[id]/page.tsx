import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ComparisonForm, { type ComparisonFormInitial } from "@/components/admin/ComparisonForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Comparison — VÉLORA Admin",
};

export default async function EditComparisonPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const comparison = await db.comparison.findUnique({ where: { id: params.id } });
  if (!comparison) {
    notFound();
  }

  const initial: ComparisonFormInitial = {
    slug: comparison.slug,
    title: comparison.title,
    description: comparison.description,
    productIds: comparison.productIds,
    status: comparison.status,
    seoTitle: comparison.seoTitle,
    seoDescription: comparison.seoDescription,
  };

  return (
    <div>
      <PageHeader title="Edit Comparison" subtitle={comparison.title} />
      <ComparisonForm mode="edit" comparisonId={comparison.id} initial={initial} />
    </div>
  );
}
