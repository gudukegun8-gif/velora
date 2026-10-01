import { NextResponse } from "next/server";
import { loginAdmin, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/admin-schemas";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Body: { email, password }
 * Sets the httpOnly velora_admin session cookie on success.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  try {
    const session = await loginAdmin(parsed.data.email, parsed.data.password);
    await setSessionCookie(session);
    return NextResponse.json({ ok: true, user: session });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 401 }
    );
  }
}
