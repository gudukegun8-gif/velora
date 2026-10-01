import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparisonPatchSchema } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError, pickPresent } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/comparisons/[id]
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const comparison = await db.comparison.findUnique({ where: { id: params.id } });
  if (!comparison) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }
  return NextResponse.json({ comparison });
}

/**
 * PATCH /api/admin/comparisons/[id]
 * Body: partial comparison payload; only present keys are updated, null clears.
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

  const parsed = comparisonPatchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const present = pickPresent(body, parsed.data);
  if (Object.keys(present).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(present)) {
    data[key] = value;
  }
  if (present.status === "PUBLISHED") data.publishedAt = new Date();
  if (present.status === "DRAFT") data.publishedAt = null;

  try {
    const comparison = await db.comparison.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true, comparison });
  } catch (err) {
    if (err instanceof Error && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2025") {
        return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
      }
      if (code === "P2002") {
        return NextResponse.json(
          { error: "A comparison with this slug already exists" },
          { status: 409 }
        );
      }
    }
    throw err;
  }
}

/**
 * DELETE /api/admin/comparisons/[id]
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    await db.comparison.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
    }
    throw err;
  }
}
