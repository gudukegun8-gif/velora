"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify, cx } from "@/lib/utils";
import { Field, inputCls, btnPrimaryCls, btnGhostCls, btnDangerCls, Card } from "@/components/admin/ui";

export interface ProductFormInitial {
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  gender?: string | null;
  fitnessGoal?: string | null;
  productType?: string | null;
  price?: string | null;
  originalPrice?: string | null;
  currency?: string | null;
  rating?: string | null;
  reviewCount?: string | null;
  merchantId?: string | null;
  affiliateUrl?: string | null;
  originalUrl?: string | null;
  status: string;
  isFeatured: boolean;
  trendStatus: string;
  trendScore: string;
  dataSource: string;
  specifications?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  images: { url: string; alt?: string | null }[];
  attributes: { key: string; value: string }[];
  tags: string[];
}

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial?: ProductFormInitial;
  categories: { id: string; name: string }[];
  merchants: { id: string; name: string }[];
}

const STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED"];
const TREND_STATUSES = ["DISCOVERED", "IN_REVIEW", "APPROVED", "FEATURED", "PUBLISHED", "REJECTED", "ARCHIVED"];
const DATA_SOURCES = ["VERIFIED", "MERCHANT_SUPPLIED", "EDITORIAL", "AI_SUGGESTED", "UNAVAILABLE"];
const GENDERS = ["WOMEN", "MEN", "UNISEX"];

const emptyInitial: ProductFormInitial = {
  slug: "",
  title: "",
  status: "DRAFT",
  isFeatured: false,
  trendStatus: "DISCOVERED",
  trendScore: "0",
  dataSource: "UNAVAILABLE",
  currency: "USD",
  images: [],
  attributes: [],
  tags: [],
};

function toStr(v: string | null | undefined): string {
  return v ?? "";
}

export default function ProductForm({ mode, productId, initial, categories, merchants }: Props) {
  const router = useRouter();
  const base = useMemo(() => ({ ...emptyInitial, ...(initial ?? {}) }), [initial]);

  const [title, setTitle] = useState(base.title);
  const [slug, setSlug] = useState(base.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [shortDescription, setShortDescription] = useState(toStr(base.shortDescription));
  const [description, setDescription] = useState(toStr(base.description));
  const [categoryId, setCategoryId] = useState(toStr(base.categoryId));
  const [gender, setGender] = useState(toStr(base.gender));
  const [fitnessGoal, setFitnessGoal] = useState(toStr(base.fitnessGoal));
  const [productType, setProductType] = useState(toStr(base.productType));
  const [price, setPrice] = useState(toStr(base.price));
  const [originalPrice, setOriginalPrice] = useState(toStr(base.originalPrice));
  const [currency, setCurrency] = useState(toStr(base.currency) || "USD");
  const [rating, setRating] = useState(toStr(base.rating));
  const [reviewCount, setReviewCount] = useState(toStr(base.reviewCount));
  const [merchantId, setMerchantId] = useState(toStr(base.merchantId));
  const [affiliateUrl, setAffiliateUrl] = useState(toStr(base.affiliateUrl));
  const [originalUrl, setOriginalUrl] = useState(toStr(base.originalUrl));
  const [status, setStatus] = useState(base.status);
  const [isFeatured, setIsFeatured] = useState(base.isFeatured);
  const [trendStatus, setTrendStatus] = useState(base.trendStatus);
  const [trendScore, setTrendScore] = useState(toStr(base.trendScore) || "0");
  const [dataSource, setDataSource] = useState(base.dataSource);
  const [specifications, setSpecifications] = useState(
    typeof base.specifications === "string" ? base.specifications : ""
  );
  const [seoTitle, setSeoTitle] = useState(toStr(base.seoTitle));
  const [seoDescription, setSeoDescription] = useState(toStr(base.seoDescription));
  const [seoKeywords, setSeoKeywords] = useState(toStr(base.seoKeywords));
  const [images, setImages] = useState<{ url: string; alt: string }[]>(
    base.images.map((i) => ({ url: i.url, alt: i.alt ?? "" }))
  );
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>(
    base.attributes.map((a) => ({ key: a.key, value: a.value }))
  );
  const [tagsText, setTagsText] = useState(base.tags.join(", "));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function numOrUndefined(v: string): number | undefined {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let specs: string | undefined = specifications.trim() || undefined;
    if (specs) {
      try {
        JSON.parse(specs);
      } catch {
        setError("Specifications must be valid JSON.");
        setSaving(false);
        return;
      }
    }

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      categoryId: categoryId || null,
      gender: gender || null,
      fitnessGoal: fitnessGoal.trim() || null,
      productType: productType.trim() || null,
      price: numOrUndefined(price) ?? null,
      originalPrice: numOrUndefined(originalPrice) ?? null,
      currency: currency.trim() || null,
      rating: numOrUndefined(rating) ?? null,
      reviewCount: numOrUndefined(reviewCount) ?? null,
      merchantId: merchantId || null,
      affiliateUrl: affiliateUrl.trim() || null,
      originalUrl: originalUrl.trim() || null,
      status,
      isFeatured,
      trendStatus,
      trendScore: numOrUndefined(trendScore) ?? 0,
      dataSource,
      specifications: specs ?? null,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      seoKeywords: seoKeywords.trim() || null,
      images: images
        .filter((i) => i.url.trim())
        .map((i, idx) => ({ url: i.url.trim(), alt: i.alt.trim() || undefined, sortOrder: idx })),
      attributes: attributes
        .filter((a) => a.key.trim() && a.value.trim())
        .map((a) => ({ key: a.key.trim(), value: a.value.trim() })),
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = Array.isArray(data.details)
          ? data.details.map((d: { path?: string[]; message?: string }) =>
              d.path?.length ? `${d.path.join(".")}: ${d.message}` : d.message
            ).join("; ")
          : null;
        throw new Error(details || data.error || "Save failed");
      }
      router.push("/admin/products");
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
        <h2 className="font-display text-xl font-semibold text-ink">Basics</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className={inputCls}
              placeholder="Product title"
            />
          </Field>
          <Field label="Slug" hint="Auto-generated from the title. Lowercase letters, numbers and dashes.">
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              required
              className={inputCls}
              placeholder="product-slug"
            />
          </Field>
        </div>
        <Field label="Short description">
          <input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className={inputCls}
            maxLength={600}
            placeholder="One-line summary"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className={inputCls}
            placeholder="Full editorial description (markdown supported on the site)"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Merchant">
            <select value={merchantId} onChange={(e) => setMerchantId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fitness goal" hint="e.g. running, strength, yoga">
            <input value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Product type" hint="e.g. leggings, sports bra">
            <input value={productType} onChange={(e) => setProductType(e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Pricing & Links</h2>
        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Price">
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={inputCls} placeholder="0.00" />
          </Field>
          <Field label="Original price">
            <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} inputMode="decimal" className={inputCls} placeholder="0.00" />
          </Field>
          <Field label="Currency">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls} maxLength={10} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating (0–5)">
              <input value={rating} onChange={(e) => setRating(e.target.value)} inputMode="decimal" className={inputCls} />
            </Field>
            <Field label="Reviews">
              <input value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} inputMode="numeric" className={inputCls} />
            </Field>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Affiliate URL" hint="http(s) only. Clicks redirect through /go/[id].">
            <input value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} className={inputCls} placeholder="https://…" />
          </Field>
          <Field label="Original URL">
            <input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} className={inputCls} placeholder="https://…" />
          </Field>
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Images</h2>
        {images.map((img, idx) => (
          <div key={idx} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={img.url}
              onChange={(e) => setImages(images.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
              className={inputCls}
              placeholder="https://… image URL"
              aria-label={`Image ${idx + 1} URL`}
            />
            <input
              value={img.alt}
              onChange={(e) => setImages(images.map((x, i) => (i === idx ? { ...x, alt: e.target.value } : x)))}
              className={inputCls}
              placeholder="Alt text"
              aria-label={`Image ${idx + 1} alt text`}
            />
            <button
              type="button"
              onClick={() => setImages(images.filter((_, i) => i !== idx))}
              className={cx(btnDangerCls, "px-3")}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setImages([...images, { url: "", alt: "" }])} className={btnGhostCls}>
          Add Image
        </button>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Attributes & Tags</h2>
        {attributes.map((attr, idx) => (
          <div key={idx} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={attr.key}
              onChange={(e) => setAttributes(attributes.map((x, i) => (i === idx ? { ...x, key: e.target.value } : x)))}
              className={inputCls}
              placeholder="Key (e.g. Fabric)"
              aria-label={`Attribute ${idx + 1} key`}
            />
            <input
              value={attr.value}
              onChange={(e) => setAttributes(attributes.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)))}
              className={inputCls}
              placeholder="Value"
              aria-label={`Attribute ${idx + 1} value`}
            />
            <button
              type="button"
              onClick={() => setAttributes(attributes.filter((_, i) => i !== idx))}
              className={cx(btnDangerCls, "px-3")}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setAttributes([...attributes, { key: "", value: "" }])} className={btnGhostCls}>
          Add Attribute
        </button>
        <Field label="Tags" hint="Comma-separated">
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputCls} placeholder="summer, bestseller, gym" />
        </Field>
        <Field label="Specifications" hint="Valid JSON object">
          <textarea
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            rows={4}
            className={cx(inputCls, "font-mono text-xs")}
            placeholder='{"material": "…"}'
            spellCheck={false}
          />
        </Field>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Publishing</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Trend status">
            <select value={trendStatus} onChange={(e) => setTrendStatus(e.target.value)} className={inputCls}>
              {TREND_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Data source">
            <select value={dataSource} onChange={(e) => setDataSource(e.target.value)} className={inputCls}>
              {DATA_SOURCES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Trend score (0–100)">
            <input value={trendScore} onChange={(e) => setTrendScore(e.target.value)} inputMode="decimal" className={inputCls} />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-[#9A7B3F]"
              />
              Featured product
            </label>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">SEO</h2>
        <Field label="SEO title">
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} maxLength={200} />
        </Field>
        <Field label="SEO description">
          <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} className={inputCls} maxLength={500} />
        </Field>
        <Field label="SEO keywords" hint="Comma-separated">
          <input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className={inputCls} maxLength={500} />
        </Field>
      </Card>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimaryCls}>
          {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className={btnGhostCls}>
          Cancel
        </button>
      </div>
    </form>
  );
}
