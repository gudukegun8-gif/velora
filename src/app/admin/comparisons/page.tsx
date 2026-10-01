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
  inputCls,
  btnPrimaryCls,
  btnGhostCls,
  btnDangerCls,
} from "@/components/admin/ui";
import { articleStatusEnum } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comparisons — VÉLORA Admin",
};

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

async function deleteComparison(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.comparison.delete({ where: { id } });
  revalidatePath("/admin/comparisons");
}

export default async function AdminComparisonsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const q = param(searchParams, "q").trim();

  const where = q ? { title: { contains: q, mode: "insensitive" as const } } : {};
  const [comparisons] = await Promise.all([
    db.comparison.findMany({ where, orderBy: { updatedAt: "desc" } }),
  ]);

  // Resolve product titles for the listed comparisons
  const productIds = [...new Set(comparisons.flatMap((c) => c.productIds))];
  const products =
    productIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true },
        })
      : [];
  const titleById = new Map(products.map((p) => [p.id, p.title]));

  return (
    <div>
      <PageHeader
        title="Comparisons"
        subtitle={`${comparisons.length} comparison${comparisons.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/comparisons/new" className={btnPrimaryCls}>
            New Comparison
          </Link>
        }
      />

      <Card className="mb-6 p-4">
        <form method="GET" action="/admin/comparisons" className="flex gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title…"
            className={inputCls}
            aria-label="Search comparisons"
          />
          <button type="submit" className={btnPrimaryCls}>
            Search
          </button>
          {q ? (
            <Link href="/admin/comparisons" className={btnGhostCls}>
              Clear
            </Link>
          ) : null}
        </form>
      </Card>

      {comparisons.length === 0 ? (
        <EmptyState
          title="No comparisons found"
          hint="Build head-to-head product comparisons to help shoppers decide."
          action={
            <Link href="/admin/comparisons/new" className={btnPrimaryCls}>
              New Comparison
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
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {comparisons.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/comparisons/${c.id}`}
                        className="font-medium text-ink hover:text-golddeep"
                      >
                        {c.title}
                      </Link>
                      <p className="text-xs text-ink/50">{c.slug}</p>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-ink/70">
                      {c.productIds.length === 0
                        ? "—"
                        : c.productIds
                            .map((id) => titleById.get(id) ?? "Unknown product")
                            .join(" vs ")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/admin/comparisons/${c.id}`}
                        className={btnGhostCls + " mr-2 px-3 py-1.5"}
                      >
                        Edit
                      </Link>
                      <form action={deleteComparison} className="inline">
                        <input type="hidden" name="id" value={c.id} />
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
    </div>
  );
}
