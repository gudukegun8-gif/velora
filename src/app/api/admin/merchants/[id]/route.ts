import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { merchantPatchSchema } from "@/lib/admin-schemas";
import { requireApiAdmin, validationError, pickPresent } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// trackingConfig is deliberately excluded everywhere here.
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

/**
 * GET /api/admin/merchants/[id]
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const merchant = await db.merchant.findUnique({ where: { id: params.id }, select });
  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }
  return NextResponse.json({ merchant });
}

/**
 * PATCH /api/admin/merchants/[id]
 * Body: partial merchant payload; only present keys are updated, null clears.
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

  const parsed = merchantPatchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const present = pickPresent(body, parsed.data);
  if (Object.keys(present).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(present)) {
    if (key === "trackingConfig") continue; // never writable here
    data[key] = value;
  }

  try {
    const merchant = await db.merchant.update({ where: { id: params.id }, data, select });
    return NextResponse.json({ ok: true, merchant });
  } catch (err) {
    if (err instanceof Error && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2025") {
        return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
      }
      if (code === "P2002") {
        return NextResponse.json(
          { error: "A merchant with this slug already exists" },
          { status: 409 }
        );
      }
    }
    throw err;
  }
}

/**
 * DELETE /api/admin/merchants/[id]
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    await db.clickEvent.updateMany({
      where: { merchantId: params.id },
      data: { merchantId: null },
    });
    await db.merchant.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }
    throw err;
  }
}
