import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card, StatCard, EmptyState, Pagination, Badge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Subscribers — VÉLORA Admin",
};

const PAGE_SIZE = 25;

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const page = Math.max(1, parseInt(param(searchParams, "page") || "1", 10) || 1);

  const [total, confirmed, subscribers] = await Promise.all([
    db.newsletterSubscriber.count(),
    db.newsletterSubscriber.count({ where: { confirmedAt: { not: null } } }),
    db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const makeHref = (p: number) => `/admin/subscribers?page=${p}`;

  return (
    <div>
      <PageHeader title="Subscribers" subtitle="Newsletter audience collected via the site signup form." />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Subscribers" value={total} />
        <StatCard label="Confirmed" value={confirmed} />
        <StatCard label="Unconfirmed" value={total - confirmed} />
      </div>

      {subscribers.length === 0 ? (
        <EmptyState
          title="No subscribers yet"
          hint="New signups from the newsletter form will appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-sand bg-stone-50 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-ink">{s.email}</td>
                    <td className="px-4 py-3">
                      {s.confirmedAt ? (
                        <Badge tone="green">Confirmed</Badge>
                      ) : (
                        <Badge tone="neutral">Unconfirmed</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                      {s.createdAt.toLocaleDateString("en-US", {
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
      )}

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
