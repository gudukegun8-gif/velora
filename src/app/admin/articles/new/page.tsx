import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Article — VÉLORA Admin",
};

export default async function NewArticlePage() {
  await requireAdmin();

  const [authors, categories] = await Promise.all([
    db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader title="New Article" subtitle="Write an article, guide, review or trend piece." />
      <ArticleForm mode="create" authors={authors} categories={categories} />
    </div>
  );
}
