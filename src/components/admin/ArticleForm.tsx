"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/utils";
import { Field, inputCls, btnPrimaryCls, btnGhostCls, Card } from "@/components/admin/ui";

export interface ArticleFormInitial {
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  content: string;
  type: string;
  status: string;
  authorId?: string | null;
  categoryId?: string | null;
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}

interface Props {
  mode: "create" | "edit";
  articleId?: string;
  initial?: ArticleFormInitial;
  authors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

const TYPES = ["ARTICLE", "BUYING_GUIDE", "REVIEW", "COMPARISON", "ROUNDUP", "TREND"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const emptyInitial: ArticleFormInitial = {
  slug: "",
  title: "",
  content: "",
  type: "ARTICLE",
  status: "DRAFT",
  tags: [],
};

function toStr(v: string | null | undefined): string {
  return v ?? "";
}

export default function ArticleForm({ mode, articleId, initial, authors, categories }: Props) {
  const router = useRouter();
  const base = { ...emptyInitial, ...(initial ?? {}) };

  const [title, setTitle] = useState(base.title);
  const [slug, setSlug] = useState(base.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(toStr(base.excerpt));
  const [featuredImage, setFeaturedImage] = useState(toStr(base.featuredImage));
  const [content, setContent] = useState(base.content);
  const [type, setType] = useState(base.type);
  const [status, setStatus] = useState(base.status);
  const [authorId, setAuthorId] = useState(toStr(base.authorId));
  const [categoryId, setCategoryId] = useState(toStr(base.categoryId));
  const [tagsText, setTagsText] = useState(base.tags.join(", "));
  const [seoTitle, setSeoTitle] = useState(toStr(base.seoTitle));
  const [seoDescription, setSeoDescription] = useState(toStr(base.seoDescription));
  const [canonicalUrl, setCanonicalUrl] = useState(toStr(base.canonicalUrl));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      featuredImage: featuredImage.trim() || null,
      content,
      type,
      status,
      authorId: authorId || null,
      categoryId: categoryId || null,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
    };

    try {
      const url = mode === "create" ? "/api/admin/articles" : `/api/admin/articles/${articleId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = Array.isArray(data.details)
          ? data.details
              .map((d: { path?: string[]; message?: string }) =>
                d.path?.length ? `${d.path.join(".")}: ${d.message}` : d.message
              )
              .join("; ")
          : null;
        throw new Error(details || data.error || "Save failed");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Article</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title">
            <input value={title} onChange={(e) => handleTitleChange(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Slug" hint="Auto-generated from the title.">
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              required
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Author">
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Excerpt">
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputCls} maxLength={600} />
        </Field>
        <Field label="Featured image URL">
          <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className={inputCls} placeholder="https://…" />
        </Field>
        <Field label="Content" hint="Markdown supported">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            required
            className={inputCls + " font-mono text-sm leading-relaxed"}
            spellCheck={false}
          />
        </Field>
        <Field label="Tags" hint="Comma-separated">
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputCls} />
        </Field>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">SEO</h2>
        <Field label="SEO title">
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} maxLength={200} />
        </Field>
        <Field label="SEO description">
          <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} className={inputCls} maxLength={500} />
        </Field>
        <Field label="Canonical URL">
          <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className={inputCls} placeholder="https://…" />
        </Field>
      </Card>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimaryCls}>
          {saving ? "Saving…" : mode === "create" ? "Create Article" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/articles")} className={btnGhostCls}>
          Cancel
        </button>
      </div>
    </form>
  );
}
