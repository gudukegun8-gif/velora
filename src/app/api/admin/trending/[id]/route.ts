import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trendingPatchSchema } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/trending/[id]
 * Body: { trendStatus, isFeatured? }
 * Used by the trending review queue to move products through the pipeline.
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

  const parsed = trendingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const product = await db.product.update({
      where: { id: params.id },
      data: {
        trendStatus: parsed.data.trendStatus,
        ...(parsed.data.isFeatured !== undefined ? { isFeatured: parsed.data.isFeatured } : {}),
      },
      select: { id: true, title: true, trendStatus: true, isFeatured: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    throw err;
  }
}
