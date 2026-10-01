import Link from "next/link";
import { cx } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ink";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink hover:bg-golddeep hover:text-cream border border-gold hover:border-golddeep",
  secondary:
    "bg-transparent text-cream border border-cream/40 hover:border-gold hover:text-gold",
  ghost: "bg-transparent text-cream hover:text-gold underline-offset-4 hover:underline",
  ink: "bg-transparent text-cream hover:text-gold border border-cream/30 hover:border-gold",
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
    "inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold uppercase tracking-[0.14em] transition-colors duration-200",
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
