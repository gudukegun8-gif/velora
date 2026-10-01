export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://velora.vercel.app";

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "VÉLORA";

/**
 * Build an absolute URL from a site-relative path.
 */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Canonical URL for a page path.
 */
export function canonical(path: string): string {
  return absoluteUrl(path);
}
