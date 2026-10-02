import Link from "next/link";
import { cx } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ink";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink border border-gold shadow-[0_4px_20px_-6px_rgba(201,162,39,0.5)] hover:bg-golddeep hover:text-cream hover:border-golddeep hover:shadow-[0_8px_28px_-6px_rgba(201,162,39,0.6)] hover:-translate-y-px",
  secondary:
    "bg-transparent text-cream border border-cream/30 hover:border-gold/70 hover:text-gold hover:-translate-y-px",
  ghost: "bg-transparent text-cream hover:text-gold underline-offset-4 hover:underline",
  ink: "bg-transparent text-cream hover:text-gold border border-cream/25 hover:border-gold/60 hover:-translate-y-px",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

interface ButtonProps {
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}

/**
 * Link-styled button used across the public site.
 */
export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external = false,
}: ButtonProps) {
  const classes = cx(
    "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium uppercase tracking-[0.14em] transition-all duration-300 ease-out",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer sponsored">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
