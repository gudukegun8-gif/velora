import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/logout
 * Clears the admin session cookie.
 */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
