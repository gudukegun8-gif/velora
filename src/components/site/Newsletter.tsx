"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

interface NewsletterProps {
  variant?: "section" | "mini";
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Newsletter signup. POSTs to /api/newsletter (owned by the API layer).
 * Inline form only — never a popup.
 */
export function Newsletter({
  variant = "section",
  title = "The VÉLORA Edit",
  description = "A short, considered briefing on the fitness finds actually worth your attention. Once a week. No noise.",
  className,
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
      setMessage("You're on the list. Watch your inbox for the next edit.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success" && variant === "section") {
    return (
      <div className={cx("rounded-2xl border border-gold/30 bg-ink px-8 py-12 text-center", className)}>
        <p className="font-display text-3xl font-semibold text-cream">Welcome to the Edit.</p>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-cream/70">
          {message}
        </p>
      </div>
    );
  }

  if (variant === "mini") {
    return (
      <form onSubmit={submit} className={cx("w-full", className)} aria-label="Newsletter signup">
        <label htmlFor="newsletter-email-mini" className="sr-only">
          Email address
        </label>
        <div className="flex overflow-hidden rounded-full border border-cream/20 bg-coal focus-within:border-gold">
          <input
            id="newsletter-email-mini"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
            className="w-full bg-transparent px-4 py-2.5 font-sans text-sm text-cream placeholder:text-cream/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="shrink-0 bg-gold px-5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-golddeep hover:text-cream disabled:opacity-60"
          >
            {status === "sending" ? "Joining…" : "Join"}
          </button>
        </div>
        {message && (
          <p
            role="status"
            className={cx(
              "mt-2 font-sans text-xs",
              status === "success" ? "text-gold" : "text-red-300"
            )}
          >
            {message}
          </p>
        )}
      </form>
    );
  }

  return (
    <section aria-labelledby="newsletter-heading" className={cx("relative overflow-hidden rounded-3xl bg-ink px-6 py-14 md:px-14 md:py-20", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-golddeep/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-3 text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-gold">
          Newsletter
        </p>
        <h2 id="newsletter-heading" className="font-display text-3xl font-semibold text-cream md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-cream/70 md:text-base">
          {description}
        </p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row" aria-label="Newsletter signup">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
            className="w-full flex-1 rounded-full border border-cream/20 bg-coal px-6 py-3.5 font-sans text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="shrink-0 rounded-full bg-gold px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-golddeep hover:text-cream disabled:opacity-60"
          >
            {status === "sending" ? "Joining…" : "Subscribe"}
          </button>
        </form>
        {status === "error" && message && (
          <p role="alert" className="mt-4 font-sans text-sm text-red-300">
            {message}
          </p>
        )}
        <p className="mt-5 font-sans text-xs text-cream/45">
          Unsubscribe anytime. We never share your email.
        </p>
      </div>
    </section>
  );
}
