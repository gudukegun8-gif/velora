import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * GET /api/admin/clicks/export
 * Downloads all click events as CSV. No IP addresses are stored or exported.
 */
export async function GET() {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const clicks = await db.clickEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 10000,
    include: {
      product: { select: { title: true, slug: true } },
      merchant: { select: { name: true } },
    },
  });

  const header = ["date", "product", "product_slug", "merchant", "page", "referrer", "campaign", "user_agent"];
  const rows = clicks.map((c) =>
    [
      c.createdAt.toISOString(),
      c.product?.title ?? "",
      c.product?.slug ?? "",
      c.merchant?.name ?? "",
      c.page ?? "",
      c.referrer ?? "",
      c.campaign ?? "",
      c.userAgent ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.map(csvCell).join(","), ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="velora-clicks-${date}.csv"`,
    },
  });
}
