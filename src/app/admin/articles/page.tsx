import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
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
  btnDangerCls,
} from "@/components/admin/ui";
import { articleStatusEnum } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles — VÉLORA Admin",
};

const PAGE_SIZE = 20;

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

async function deleteArticle(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.analyticsEvent.updateMany({ where: { articleId: id }, data: { articleId: null } });
  await db.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const q = param(searchParams, "q").trim();
  const status = param(searchParams, "status");
  const page = Math.max(1, parseInt(param(searchParams, "page") || "1", 10) || 1);

  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(status ? { status: status as (typeof articleStatusEnum.options)[number] } : {}),
  };

  const [total, articles] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);
  const makeHref = (p: number) => {
    const next = new URLSearchParams(qs);
    next.set("page", String(p));
    return `/admin/articles?${next.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Articles"
        subtitle={`${total} article${total === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/articles/new" className={btnPrimaryCls}>
            New Article
          </Link>
        }
      />

      <Card className="mb-6 p-4">
        <form method="GET" action="/admin/articles" className="grid gap-3 sm:grid-cols-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title…"
            className={inputCls}
            aria-label="Search articles"
          />
          <select name="status" defaultValue={status} className={inputCls} aria-label="Status filter">
            <option value="">All statuses</option>
            {articleStatusEnum.options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimaryCls + " flex-1"}>
              Filter
            </button>
            <Link href="/admin/articles" className={btnGhostCls}>
              Clear
            </Link>
          </div>
        </form>
      </Card>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          hint="Publish buying guides, reviews and trend pieces to grow organic traffic."
          action={
            <Link href="/admin/articles/new" className={btnPrimaryCls}>
              New Article
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-sand bg-stone-50 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/articles/${a.id}`}
                        className="font-medium text-ink hover:text-golddeep"
                      >
                        {a.title}
                      </Link>
                      <p className="text-xs text-ink/50">{a.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{a.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{a.author?.name ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                      {a.updatedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/admin/articles/${a.id}`} className={btnGhostCls + " mr-2 px-3 py-1.5"}>
                        Edit
                      </Link>
                      <form action={deleteArticle} className="inline">
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className={btnDangerCls + " px-3 py-1.5"}>
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
