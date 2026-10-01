import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articlePatchSchema } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError, pickPresent } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const include = {
  author: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
};

/**
 * GET /api/admin/articles/[id]
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const article = await db.article.findUnique({ where: { id: params.id }, include });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json({ article });
}

/**
 * PATCH /api/admin/articles/[id]
 * Body: partial article payload; only present keys are updated, null clears.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = articlePatchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const present = pickPresent(body, parsed.data);
  if (Object.keys(present).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(present)) {
    // null clears an optional field; values pass straight through to Prisma
    data[key] = value;
  }
  // Keep publishedAt in sync when status flips
  if (present.status === "PUBLISHED") data.publishedAt = new Date();
  if (present.status === "DRAFT") data.publishedAt = null;

  try {
    const article = await db.article.update({ where: { id: params.id }, data, include });
    return NextResponse.json({ ok: true, article });
  } catch (err) {
    if (err instanceof Error && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2025") {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      if (code === "P2002") {
        return NextResponse.json(
          { error: "An article with this slug already exists" },
          { status: 409 }
        );
      }
    }
    throw err;
  }
}

/**
 * DELETE /api/admin/articles/[id]
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    await db.analyticsEvent.updateMany({
      where: { articleId: params.id },
      data: { articleId: null },
    });
    await db.article.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    throw err;
  }
}
