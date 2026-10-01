import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

/* ─── Form + layout primitives for the admin panel ─── */

export const inputCls =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 shadow-sm focus:border-golddeep focus:outline-none focus:ring-1 focus:ring-golddeep";

export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-coal focus:outline-none focus-visible:ring-2 focus-visible:ring-golddeep disabled:opacity-50 disabled:cursor-not-allowed";

export const btnGoldCls =
  "inline-flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-golddeep hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-golddeep disabled:opacity-50 disabled:cursor-not-allowed";

export const btnGhostCls =
  "inline-flex items-center justify-center gap-2 rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:border-golddeep hover:text-golddeep focus:outline-none focus-visible:ring-2 focus-visible:ring-golddeep disabled:opacity-50 disabled:cursor-not-allowed";

export const btnDangerCls =
  "inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed";

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/60"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink/50">{hint}</p> : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-lg border border-sand bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink/50">{sub}</p> : null}
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink/60">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  gold: "bg-gold/15 text-golddeep ring-gold/40",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  neutral: "bg-stone-100 text-stone-600 ring-stone-200",
  ink: "bg-ink text-cream ring-ink",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        badgeTones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof badgeTones {
  switch (status) {
    case "PUBLISHED":
      return "green";
    case "PENDING":
    case "IN_REVIEW":
      return "gold";
    case "ARCHIVED":
    case "REJECTED":
      return "red";
    case "APPROVED":
    case "FEATURED":
      return "blue";
    default:
      return "neutral";
  }
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {hint ? <p className="mt-2 max-w-md text-sm text-ink/60">{hint}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      <p className="text-ink/60">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={makeHref(prev)}
          aria-disabled={page <= 1}
          className={cx(btnGhostCls, "px-3 py-1.5", page <= 1 && "pointer-events-none opacity-40")}
        >
          Previous
        </Link>
        <Link
          href={makeHref(next)}
          aria-disabled={page >= totalPages}
          className={cx(
            btnGhostCls,
            "px-3 py-1.5",
            page >= totalPages && "pointer-events-none opacity-40"
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
