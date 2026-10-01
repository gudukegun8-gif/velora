import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function isSafeRedirect(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * GET /go/[id]
 * Affiliate click redirect. Records a ClickEvent (no IP stored), then 302s to
 * the product's affiliate URL. Falls back to the product page when there is
 * no affiliate URL, and 404s for unknown ids.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const product = await db.product.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, affiliateUrl: true, merchantId: true },
  });

  if (!product) {
    notFound();
  }

  if (!product.affiliateUrl || !isSafeRedirect(product.affiliateUrl)) {
    return NextResponse.redirect(new URL(`/products/${product.slug}`, req.url), 302);
  }

  const referer = req.headers.get("referer");
  let page: string | undefined;
  if (referer) {
    try {
      page = new URL(referer).pathname;
    } catch {
      page = undefined;
    }
  }

  await db.clickEvent.create({
    data: {
      productId: product.id,
      merchantId: product.merchantId,
      page,
      referrer: referer ?? undefined,
      campaign: req.nextUrl.searchParams.get("utm_campaign") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  return NextResponse.redirect(product.affiliateUrl, 302);
}
