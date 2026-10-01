import { cx } from "@/lib/utils";

type BadgeTone = "gold" | "ink" | "outline" | "cream";

const tones: Record<BadgeTone, string> = {
  gold: "bg-gold text-ink",
  ink: "bg-ink text-cream",
  outline: "border border-golddeep/50 text-golddeep",
  cream: "bg-cream/90 text-ink",
};

export function Badge({
  tone = "gold",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-sans font-semibold uppercase tracking-[0.14em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
