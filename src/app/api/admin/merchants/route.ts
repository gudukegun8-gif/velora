import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { merchantSchema } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/merchants
 * Query: q, status, limit, page
 * Note: trackingConfig is never exposed through this API.
 */
export async function GET(req: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status") ?? "";
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(status ? { status } : {}),
  };

  const select = {
    id: true,
    slug: true,
    name: true,
    logo: true,
    website: true,
    affiliateNetwork: true,
    status: true,
    priority: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { products: true } },
  };

  const [total, items] = await Promise.all([
    db.merchant.count({ where }),
    db.merchant.findMany({
      where,
      orderBy: [{ priority: "desc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize: limit });
}

/**
 * POST /api/admin/merchants
 * Body: { slug, name, logo?, website, affiliateNetwork?, status?, priority? }
 * trackingConfig is configured via environment, not through this API.
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

  const parsed = merchantSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const d = parsed.data;
  try {
    const merchant = await db.merchant.create({
      data: {
        slug: d.slug,
        name: d.name,
        logo: d.logo ?? undefined,
        website: d.website,
        affiliateNetwork: d.affiliateNetwork ?? undefined,
        status: d.status ?? "ACTIVE",
        priority: d.priority,
      },
    });
    return NextResponse.json({ ok: true, merchant }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A merchant with this slug already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
