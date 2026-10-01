import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trackEventSchema } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

/**
 * POST /api/track
 * Body: { type, page?, productId?, articleId?, referrer? }
 * Public, cookieless analytics event. No PII is collected.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = trackEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Drop references to records that no longer exist (best-effort, no PII).
  let productId: string | undefined;
  let articleId: string | undefined;
  if (d.productId) {
    const p = await db.product.findUnique({ where: { id: d.productId }, select: { id: true } });
    if (p) productId = p.id;
  }
  if (d.articleId) {
    const a = await db.article.findUnique({ where: { id: d.articleId }, select: { id: true } });
    if (a) articleId = a.id;
  }

  await db.analyticsEvent.create({
    data: {
      type: d.type,
      page: d.page ?? undefined,
      productId,
      articleId,
      referrer: d.referrer ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
