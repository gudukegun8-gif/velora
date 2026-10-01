"use server";

import { redirect } from "next/navigation";
import { loginAdmin, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/admin-schemas";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const session = await loginAdmin(parsed.data.email, parsed.data.password);
    await setSessionCookie(session);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Login failed" };
  }

  redirect("/admin");
}
