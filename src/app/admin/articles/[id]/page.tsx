import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ArticleForm, { type ArticleFormInitial } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Article — VÉLORA Admin",
};

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const [article, authors, categories] = await Promise.all([
    db.article.findUnique({ where: { id: params.id } }),
    db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!article) {
    notFound();
  }

  const initial: ArticleFormInitial = {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    featuredImage: article.featuredImage,
    content: article.content,
    type: article.type,
    status: article.status,
    authorId: article.authorId,
    categoryId: article.categoryId,
    tags: article.tags,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    canonicalUrl: article.canonicalUrl,
  };

  return (
    <div>
      <PageHeader title="Edit Article" subtitle={article.title} />
      <ArticleForm
        mode="edit"
        articleId={article.id}
        initial={initial}
        authors={authors}
        categories={categories}
      />
    </div>
  );
}
