import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card, EmptyState, Pagination, btnGhostCls } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clicks — VÉLORA Admin",
};

const PAGE_SIZE = 25;

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default async function AdminClicksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const page = Math.max(1, parseInt(param(searchParams, "page") || "1", 10) || 1);

  const [total, clicks] = await Promise.all([
    db.clickEvent.count(),
    db.clickEvent.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        product: { select: { title: true } },
        merchant: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const makeHref = (p: number) => `/admin/clicks?page=${p}`;

  return (
    <div>
      <PageHeader
        title="Clicks"
        subtitle={`${total} affiliate click${total === 1 ? "" : "s"} tracked. No IP addresses are stored.`}
        actions={
          <a href="/api/admin/clicks/export" download className={btnGhostCls}>
            Export CSV
          </a>
        }
      />

      {clicks.length === 0 ? (
        <EmptyState
          title="No clicks yet"
          hint="Clicks are recorded when visitors follow affiliate links through /go/[id]."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-sand bg-stone-50 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Merchant</th>
                  <th className="px-4 py-3 font-semibold">Page</th>
                  <th className="px-4 py-3 font-semibold">Referrer</th>
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {clicks.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                      {c.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-ink">
                      {c.product?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{c.merchant?.name ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-ink/70">{c.page ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-ink/70">
                      {c.referrer ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{c.campaign ?? "—"}</td>
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
