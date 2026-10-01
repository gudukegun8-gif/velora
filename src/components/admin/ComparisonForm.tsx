"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { slugify, cx } from "@/lib/utils";
import { Field, inputCls, btnPrimaryCls, btnGhostCls, btnDangerCls, Card, Badge } from "@/components/admin/ui";

export interface ComparisonFormInitial {
  slug: string;
  title: string;
  description?: string | null;
  productIds: string[];
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

interface Props {
  mode: "create" | "edit";
  comparisonId?: string;
  initial?: ComparisonFormInitial;
}

interface ProductHit {
  id: string;
  title: string;
  slug: string;
}

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const emptyInitial: ComparisonFormInitial = {
  slug: "",
  title: "",
  productIds: [],
  status: "DRAFT",
};

function toStr(v: string | null | undefined): string {
  return v ?? "";
}

export default function ComparisonForm({ mode, comparisonId, initial }: Props) {
  const router = useRouter();
  const base = { ...emptyInitial, ...(initial ?? {}) };

  const [title, setTitle] = useState(base.title);
  const [slug, setSlug] = useState(base.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(toStr(base.description));
  const [productIds, setProductIds] = useState<string[]>(base.productIds);
  const [status, setStatus] = useState(base.status);
  const [seoTitle, setSeoTitle] = useState(toStr(base.seoTitle));
  const [seoDescription, setSeoDescription] = useState(toStr(base.seoDescription));

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductHit[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load currently-selected products for display
  useEffect(() => {
    if (productIds.length === 0) {
      setSelectedProducts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/products?ids=${productIds.join(",")}&limit=50`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.items)) {
          setSelectedProducts(
            data.items.map((p: ProductHit) => ({ id: p.id, title: p.title, slug: p.slug }))
          );
        }
      } catch {
        /* selection display is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function addProduct(p: ProductHit) {
    if (!productIds.includes(p.id)) {
      setProductIds([...productIds, p.id]);
      setSelectedProducts([...selectedProducts, p]);
    }
    setSearch("");
    setResults([]);
  }

  function removeProduct(id: string) {
    setProductIds(productIds.filter((x) => x !== id));
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = productIds.indexOf(id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= productIds.length) return;
    const ids = [...productIds];
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    setProductIds(ids);
    const ordered = ids
      .map((pid) => selectedProducts.find((p) => p.id === pid))
      .filter((p): p is ProductHit => Boolean(p));
    setSelectedProducts(ordered);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim() || null,
      productIds,
      status,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
    };

    try {
      const url =
        mode === "create" ? "/api/admin/comparisons" : `/api/admin/comparisons/${comparisonId}`;
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
      router.push("/admin/comparisons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  const orderedSelected = productIds
    .map((pid) => selectedProducts.find((p) => p.id === pid))
    .filter((p): p is ProductHit => Boolean(p));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Comparison</h2>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="SEO title">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} maxLength={200} />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} maxLength={5000} />
        </Field>
        <Field label="SEO description">
          <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className={inputCls} maxLength={500} />
        </Field>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Products</h2>
        <Field label="Search products" hint="Type at least 2 characters, then pick from the results.">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls}
              placeholder="Search by title or slug…"
              autoComplete="off"
            />
            {search.trim().length >= 2 ? (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-sand bg-white shadow-lg">
                {searching ? (
                  <p className="px-4 py-3 text-sm text-ink/50">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-ink/50">No matches</p>
                ) : (
                  results
                    .filter((r) => !productIds.includes(r.id))
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => addProduct(r)}
                        className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-stone-50"
                      >
                        <span className="font-medium">{r.title}</span>
                        <span className="ml-2 text-xs text-ink/50">{r.slug}</span>
                      </button>
                    ))
                )}
              </div>
            ) : null}
          </div>
        </Field>

        {orderedSelected.length === 0 ? (
          <p className="text-sm text-ink/50">No products selected yet.</p>
        ) : (
          <ul className="divide-y divide-sand rounded-md border border-sand">
            {orderedSelected.map((p, idx) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-golddeep">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-ink">{p.title}</span>
                  <span className="ml-2 text-xs text-ink/50">{p.slug}</span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(p.id, -1)}
                    disabled={idx === 0}
                    className={cx(btnGhostCls, "px-2 py-1 text-xs")}
                    aria-label={`Move ${p.title} up`}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(p.id, 1)}
                    disabled={idx === orderedSelected.length - 1}
                    className={cx(btnGhostCls, "px-2 py-1 text-xs")}
                    aria-label={`Move ${p.title} down`}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    className={cx(btnDangerCls, "px-2 py-1 text-xs")}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-ink/50">
          <Badge tone="neutral">{productIds.length} selected</Badge>
        </p>
      </Card>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimaryCls}>
          {saving ? "Saving…" : mode === "create" ? "Create Comparison" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/comparisons")} className={btnGhostCls}>
          Cancel
        </button>
      </div>
    </form>
  );
}
