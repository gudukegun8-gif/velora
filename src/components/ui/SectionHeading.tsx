import Link from "next/link";
import { cx } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  dark?: boolean;
}

/**
 * Editorial section heading with an optional eyebrow and "view all" link.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
  dark = true,
}: SectionHeadingProps) {
  return (
    <div
      className={cx(
        "mb-8 flex flex-col gap-3 md:mb-10",
        align === "center" ? "items-center text-center" : "items-start"
      )}
    >
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <div className={cx(align === "center" && "w-full")}>
          {eyebrow && (
            <p className="mb-3 flex items-center gap-3 text-[11px] font-sans font-medium uppercase tracking-[0.28em] text-golddeep">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-gold/60" />
              {eyebrow}
            </p>
          )}
          <h2
            className={cx(
              "font-display text-3xl font-medium tracking-tight md:text-4xl",
              dark ? "text-cream" : "text-ink"
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cx(
                "mt-3 max-w-2xl font-sans text-sm leading-relaxed md:text-base",
                dark ? "text-cream/70" : "text-ink/70"
              )}
            >
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className={cx(
              "shrink-0 font-sans text-xs font-medium uppercase tracking-[0.18em] underline-offset-4 hover:underline",
              dark ? "text-gold" : "text-golddeep"
            )}
          >
            {linkLabel} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
