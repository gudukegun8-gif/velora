import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import ComparisonForm from "@/components/admin/ComparisonForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Comparison — VÉLORA Admin",
};

export default async function NewComparisonPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Comparison" subtitle="Compare products head-to-head." />
      <ComparisonForm mode="create" />
    </div>
  );
}
