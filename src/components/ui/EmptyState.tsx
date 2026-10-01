import Link from "next/link";
import { cx } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

/**
 * Elegant empty state used wherever a query returns nothing.
 * Never fabricates data — it invites the visitor elsewhere.
 */
export function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "flex flex-col items-center rounded-2xl border border-cream/10 bg-coal px-6 py-14 text-center md:py-20",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-ink font-display text-2xl text-gold"
      >
        V
      </span>
      <h3 className="font-display text-2xl font-semibold text-cream md:text-3xl">{title}</h3>
      <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-cream/65 md:text-base">
        {message}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:border-gold hover:text-gold"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
