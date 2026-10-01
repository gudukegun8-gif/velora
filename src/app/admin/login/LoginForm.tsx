"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { btnGoldCls } from "@/components/admin/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnGoldCls + " w-full py-2.5"}>
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState<LoginState | null, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/70"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@velora.com"
          className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/70"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
