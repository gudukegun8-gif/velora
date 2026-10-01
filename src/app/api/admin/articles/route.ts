import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articleSchema, articleStatusEnum, articleTypeEnum } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const include = {
  author: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
};

/**
 * GET /api/admin/articles
 * Query: q, status, type, limit, page
 */
export async function GET(req: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

  const statusParsed = status ? articleStatusEnum.safeParse(status) : null;
  const typeParsed = type ? articleTypeEnum.safeParse(type) : null;
  if ((status && !statusParsed?.success) || (type && !typeParsed?.success)) {
    return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
  }

  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(statusParsed?.success ? { status: statusParsed.data } : {}),
    ...(typeParsed?.success ? { type: typeParsed.data } : {}),
  };

  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize: limit });
}

/**
 * POST /api/admin/articles
 * Body: full article payload (see articleSchema)
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

  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const d = parsed.data;
  try {
    const article = await db.article.create({
      data: {
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt ?? undefined,
        featuredImage: d.featuredImage ?? undefined,
        content: d.content,
        type: d.type,
        status: d.status,
        authorId: d.authorId ?? undefined,
        categoryId: d.categoryId ?? undefined,
        tags: d.tags,
        seoTitle: d.seoTitle ?? undefined,
        seoDescription: d.seoDescription ?? undefined,
        canonicalUrl: d.canonicalUrl ?? undefined,
        publishedAt: d.status === "PUBLISHED" ? new Date() : undefined,
      },
      include,
    });
    return NextResponse.json({ ok: true, article }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "An article with this slug already exists" }, { status: 409 });
    }
    throw err;
  }
}
