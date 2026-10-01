import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login — VÉLORA",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-coal px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-4xl font-semibold tracking-wide text-cream">
            V&Eacute;LORA
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Admin Console
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink/60 p-8 shadow-2xl">
          <h1 className="mb-6 font-display text-2xl font-semibold text-cream">
            Sign in to continue
          </h1>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-cream/40">
          Restricted area. All access is logged.
        </p>
      </div>
    </div>
  );
}
