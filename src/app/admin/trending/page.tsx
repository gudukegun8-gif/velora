import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  PageHeader,
  Badge,
  statusTone,
  EmptyState,
  btnGhostCls,
  btnPrimaryCls,
} from "@/components/admin/ui";
import type { TrendStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trending Review — VÉLORA Admin",
};

async function setTrend(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const trendStatus = String(formData.get("trendStatus") ?? "") as TrendStatus;
  const feature = formData.get("feature") === "1";

  const valid: TrendStatus[] = [
    "DISCOVERED",
    "IN_REVIEW",
    "APPROVED",
    "FEATURED",
    "PUBLISHED",
    "REJECTED",
    "ARCHIVED",
  ];
  if (!id || !valid.includes(trendStatus)) return;

  await db.product.update({
    where: { id },
    data: {
      trendStatus,
      ...(feature ? { isFeatured: true, trendStatus: "APPROVED" as TrendStatus } : {}),
    },
  });

  revalidatePath("/admin/trending");
}

function ActionButton({
  id,
  trendStatus,
  feature,
  label,
  primary,
}: {
  id: string;
  trendStatus: TrendStatus;
  feature?: boolean;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setTrend} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="trendStatus" value={trendStatus} />
      {feature ? <input type="hidden" name="feature" value="1" /> : null}
      <button
        type="submit"
        className={
          (primary ? btnPrimaryCls : btnGhostCls) + " px-2.5 py-1 text-xs"
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function TrendingReviewPage() {
  await requireAdmin();

  const queue = await db.product.findMany({
    where: { trendStatus: { in: ["DISCOVERED", "IN_REVIEW", "APPROVED"] } },
    orderBy: [{ trendScore: "desc" }, { updatedAt: "desc" }],
    include: {
      merchant: { select: { name: true } },
      category: { select: { name: true } },
      trendSignals: { orderBy: { recordedAt: "desc" }, take: 5 },
      _count: { select: { images: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Trending Review"
        subtitle={`${queue.length} product${queue.length === 1 ? "" : "s"} awaiting review, sorted by trend score.`}
      />

      {queue.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          hint="No products are currently in DISCOVERED, IN_REVIEW or APPROVED trend states."
        />
      ) : (
        <div className="space-y-4">
          {queue.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-display text-xl font-semibold text-ink hover:text-golddeep"
                    >
                      {p.title}
                    </Link>
                    <Badge tone={statusTone(p.trendStatus)}>
                      {p.trendStatus.replace(/_/g, " ")}
                    </Badge>
                    {p.isFeatured ? <Badge tone="gold">Featured</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-ink/60">
                    {p.merchant?.name ?? "No merchant"}
                    {p.category ? ` · ${p.category.name}` : ""}
                    {p.price != null ? ` · ${formatPrice(Number(p.price), p.currency ?? "USD")}` : ""}
                    {p._count.images === 0 ? " · No images" : ""}
                  </p>
                  {p.shortDescription ? (
                    <p className="mt-2 max-w-3xl text-sm text-ink/70">{p.shortDescription}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold uppercase tracking-wide text-ink/50">
                      Trend score: {p.trendScore}
                    </span>
                    {p.trendSignals.length > 0 ? (
                      <span className="text-ink/60">
                        Signals:{" "}
                        {p.trendSignals
                          .map((s) => `${s.signal} (${s.value})`)
                          .join(" · ")}
                      </span>
                    ) : (
                      <span className="text-ink/40">No signals recorded</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-sand pt-4">
                {p.trendStatus === "DISCOVERED" ? (
                  <ActionButton id={p.id} trendStatus="IN_REVIEW" label="Start Review" primary />
                ) : null}
                {p.trendStatus !== "APPROVED" ? (
                  <ActionButton id={p.id} trendStatus="APPROVED" label="Approve" />
                ) : null}
                <ActionButton id={p.id} trendStatus="APPROVED" feature label="Feature" />
                <ActionButton id={p.id} trendStatus="PUBLISHED" label="Publish Trend" primary />
                <ActionButton id={p.id} trendStatus="REJECTED" label="Reject" />
                <ActionButton id={p.id} trendStatus="ARCHIVED" label="Archive" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
