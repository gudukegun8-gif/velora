import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparisonSchema, articleStatusEnum } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/comparisons
 * Query: q, status, limit, page
 */
export async function GET(req: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status") ?? "";
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const statusParsed = status ? articleStatusEnum.safeParse(status) : null;
  if (status && !statusParsed?.success) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(statusParsed?.success ? { status: statusParsed.data } : {}),
  };

  const [total, items] = await Promise.all([
    db.comparison.count({ where }),
    db.comparison.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize: limit });
}

/**
 * POST /api/admin/comparisons
 * Body: { slug, title, description?, productIds?, status?, seoTitle?, seoDescription? }
 */
export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = comparisonSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const d = parsed.data;
  try {
    const comparison = await db.comparison.create({
      data: {
        slug: d.slug,
        title: d.title,
        description: d.description ?? undefined,
        productIds: d.productIds,
        status: d.status,
        seoTitle: d.seoTitle ?? undefined,
        seoDescription: d.seoDescription ?? undefined,
        publishedAt: d.status === "PUBLISHED" ? new Date() : undefined,
      },
    });
    return NextResponse.json({ ok: true, comparison }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A comparison with this slug already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
