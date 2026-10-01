/**
 * Lightweight class-name joiner (clsx-lite).
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a price using Intl.NumberFormat (en-US).
 */
export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Slugify a string: lowercase, trimmed, non-alphanumerics → dashes.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Truncate a string to maxLength characters with an ellipsis.
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/**
 * Discount percentage between an original and current price.
 * Returns 0 when inputs are invalid or there is no discount.
 */
export function discountPercent(price: number, original: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(original) || original <= 0 || price >= original) {
    return 0;
  }
  return Math.round(((original - price) / original) * 100);
}
