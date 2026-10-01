import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export const ADMIN_COOKIE = "velora_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AdminSession {
  email: string;
  name: string | null;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verify admin credentials against the AdminUser table.
 * Throws an Error("Invalid email or password") on bad credentials.
 */
export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const normalized = email.trim().toLowerCase();
  const user = await db.adminUser.findUnique({ where: { email: normalized } });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("Invalid email or password");
  }
  return { email: user.email, name: user.name };
}

/**
 * Sign a session JWT (HS256, 12h expiry).
 */
export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ email: session.email, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getKey());
}

/**
 * Verify a session JWT. Returns the session or null.
 */
export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.email !== "string") return null;
    return {
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}

/**
 * Set the httpOnly session cookie.
 */
export async function setSessionCookie(session: AdminSession): Promise<void> {
  const token = await createSessionToken(session);
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
}

/**
 * Read the current admin session from the cookie, or null.
 */
export async function getSession(): Promise<AdminSession | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Require an authenticated admin session in a server component / action.
 * Redirects to /admin/login when unauthenticated.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
