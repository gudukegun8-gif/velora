import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  PageHeader,
  Badge,
  statusTone,
  EmptyState,
  Pagination,
  inputCls,
  btnPrimaryCls,
  btnGhostCls,
} from "@/components/admin/ui";
import { productStatusEnum, trendStatusEnum } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products — VÉLORA Admin",
};

const PAGE_SIZE = 20;

const STATUSES = productStatusEnum.options;
const TREND_STATUSES = trendStatusEnum.options;

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

async function bulkAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const ids = formData
    .getAll("ids")
    .map((v) => String(v))
    .filter(Boolean);
  if (ids.length === 0) return;

  const action = String(formData.get("bulkAction") ?? "");
  const value = String(formData.get("bulkValue") ?? "");

  switch (action) {
    case "set-status": {
      const parsed = productStatusEnum.safeParse(value);
      if (!parsed.success) return;
      await db.product.updateMany({ where: { id: { in: ids } }, data: { status: parsed.data } });
      break;
    }
    case "set-trend": {
      const parsed = trendStatusEnum.safeParse(value);
      if (!parsed.success) return;
      await db.product.updateMany({
        where: { id: { in: ids } },
        data: { trendStatus: parsed.data },
      });
      break;
    }
    case "feature":
      await db.product.updateMany({ where: { id: { in: ids } }, data: { isFeatured: true } });
      break;
    case "unfeature":
      await db.product.updateMany({ where: { id: { in: ids } }, data: { isFeatured: false } });
      break;
    case "delete":
      await db.clickEvent.updateMany({
        where: { productId: { in: ids } },
        data: { productId: null },
      });
      await db.analyticsEvent.updateMany({
        where: { productId: { in: ids } },
        data: { productId: null },
      });
      await db.product.deleteMany({ where: { id: { in: ids } } });
      break;
    default:
      return;
  }

  revalidatePath("/admin/products");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const q = param(searchParams, "q").trim();
  const status = param(searchParams, "status");
  const trendStatus = param(searchParams, "trendStatus");
  const categoryId = param(searchParams, "category");
  const page = Math.max(1, parseInt(param(searchParams, "page") || "1", 10) || 1);

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status: status as (typeof STATUSES)[number] } : {}),
    ...(trendStatus ? { trendStatus: trendStatus as (typeof TREND_STATUSES)[number] } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [total, products, categories] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        merchant: { select: { name: true } },
        _count: { select: { images: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);
  if (trendStatus) qs.set("trendStatus", trendStatus);
  if (categoryId) qs.set("category", categoryId);
  const makeHref = (p: number) => {
    const next = new URLSearchParams(qs);
    next.set("page", String(p));
    return `/admin/products?${next.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${total} product${total === 1 ? "" : "s"} in the catalog`}
        actions={
          <Link href="/admin/products/new" className={btnPrimaryCls}>
            Add Product
          </Link>
        }
      />

      <Card className="mb-6 p-4">
        <form method="GET" action="/admin/products" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title or slug…"
            className={inputCls}
            aria-label="Search products"
          />
          <select name="status" defaultValue={status} className={inputCls} aria-label="Status filter">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="trendStatus"
            defaultValue={trendStatus}
            className={inputCls}
            aria-label="Trend status filter"
          >
            <option value="">All trend states</option>
            {TREND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <select
            name="category"
            defaultValue={categoryId}
            className={inputCls}
            aria-label="Category filter"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimaryCls + " flex-1"}>
              Filter
            </button>
            <Link href="/admin/products" className={btnGhostCls}>
              Clear
            </Link>
          </div>
        </form>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          hint="Try adjusting your filters, or add your first product to the catalog."
          action={
            <Link href="/admin/products/new" className={btnPrimaryCls}>
              Add Product
            </Link>
          }
        />
      ) : (
        <form action={bulkAction}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-sand bg-stone-50 text-left text-xs uppercase tracking-wide text-ink/50">
                    <th className="w-10 px-4 py-3">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Trend</th>
                    <th className="px-4 py-3 font-semibold">Merchant</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          name="ids"
                          value={p.id}
                          aria-label={`Select ${p.title}`}
                          className="h-4 w-4 accent-[#9A7B3F]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium text-ink hover:text-golddeep"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-ink/50">
                          {p.category?.name ?? "No category"}
                          {p._count.images > 0 ? ` · ${p._count.images} images` : " · No images"}
                          {p.isFeatured ? " · Featured" : ""}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink/80">
                        {p.price != null ? formatPrice(Number(p.price), p.currency ?? "USD") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(p.trendStatus)}>
                          {p.trendStatus.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{p.merchant?.name ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                        {p.updatedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-sand bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-ink/70">With selected:</span>
            <select name="bulkAction" className={inputCls + " w-auto"} defaultValue="set-status" aria-label="Bulk action">
              <option value="set-status">Set status</option>
              <option value="set-trend">Set trend status</option>
              <option value="feature">Mark as featured</option>
              <option value="unfeature">Remove featured</option>
              <option value="delete">Delete</option>
            </select>
            <select name="bulkValue" className={inputCls + " w-auto"} aria-label="Bulk action value">
              <optgroup label="Status">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Trend status">
                {TREND_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </optgroup>
            </select>
            <button type="submit" className={btnGhostCls}>
              Apply
            </button>
          </div>
        </form>
      )}

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
