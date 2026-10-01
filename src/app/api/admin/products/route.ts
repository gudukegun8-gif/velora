import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema, productStatusEnum, trendStatusEnum } from "@/lib/admin-schemas";
import {
  requireApiAdmin,
  validationError,
  productCreateData,
} from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/products
 * Query: q, status, trendStatus, categoryId, ids (comma-separated), limit, page
 */
export async function GET(req: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status") ?? "";
  const trendStatus = url.searchParams.get("trendStatus") ?? "";
  const categoryId = url.searchParams.get("categoryId") ?? "";
  const idsParam = url.searchParams.get("ids") ?? "";
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const statusParsed = status ? productStatusEnum.safeParse(status) : null;
  const trendParsed = trendStatus ? trendStatusEnum.safeParse(trendStatus) : null;
  if ((status && !statusParsed?.success) || (trendStatus && !trendParsed?.success)) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);

  const where = {
    ...(ids.length > 0 ? { id: { in: ids } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(statusParsed?.success ? { status: statusParsed.data } : {}),
    ...(trendParsed?.success ? { trendStatus: trendParsed.data } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        merchant: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        attributes: true,
        tags: true,
      },
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize: limit });
}

/**
 * POST /api/admin/products
 * Body: full product payload (see productSchema)
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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const product = await db.product.create({
      data: productCreateData(parsed.data),
      include: { images: true, attributes: true, tags: true },
    });
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    throw err;
  }
}
