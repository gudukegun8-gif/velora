import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productPatchSchema } from "@/lib/admin-schemas";
import {
  requireApiAdmin,
  validationError,
  pickPresent,
  productUpdateData,
} from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const include = {
  category: { select: { id: true, name: true } },
  merchant: { select: { id: true, name: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  attributes: true,
  tags: true,
};

/**
 * GET /api/admin/products/[id]
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const product = await db.product.findUnique({ where: { id: params.id }, include });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

/**
 * PATCH /api/admin/products/[id]
 * Body: partial product payload. Only keys present in the body are updated;
 * null clears an optional field. images/attributes/tags are replaced wholesale.
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

  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const present = pickPresent(body, parsed.data);
  if (Object.keys(present).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const product = await db.product.update({
      where: { id: params.id },
      data: productUpdateData(present),
      include,
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    if (err instanceof Error && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2025") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (code === "P2002") {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 409 }
        );
      }
    }
    throw err;
  }
}

/**
 * DELETE /api/admin/products/[id]
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // ClickEvent / AnalyticsEvent relations have no DB cascade; null them first.
    await db.clickEvent.updateMany({
      where: { productId: params.id },
      data: { productId: null },
    });
    await db.analyticsEvent.updateMany({
      where: { productId: params.id },
      data: { productId: null },
    });
    await db.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    throw err;
  }
}
