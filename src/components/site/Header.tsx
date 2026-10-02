"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo3D } from "@/components/site/Logo3D";
import { readSaved } from "@/components/site/SaveButton";
import { cx } from "@/lib/utils";

const NAV = [
  { label: "Women", href: "/c/women" },
  { label: "Men", href: "/c/men" },
  { label: "Equipment", href: "/c/equipment" },
  { label: "Workouts", href: "/c/workouts" },
  { label: "Recovery", href: "/c/recovery" },
  { label: "Trending", href: "/trending" },
  { label: "Guides", href: "/guides" },
];

function SavedCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readSaved().length);
    update();
    window.addEventListener("velora:saved-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("velora:saved-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className="hidden sm:inline">Saved</span>
      {count > 0 && (
        <span
          aria-label={`${count} saved items`}
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-ink"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

/**
 * Sticky site header on ink. Client component for the mobile menu and the
 * localStorage-backed saved-items count.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-ink text-cream">
      <div className="relative mx-auto flex h-24 max-w-7xl items-center pl-4 pr-2 sm:pl-6 sm:pr-3 lg:pl-8 lg:pr-4">
        {/* Logo — left, bigger for clear wordmark readability */}
        <Link href="/" aria-label="VÉLORA home" className="flex shrink-0 items-center">
          <Logo3D />
        </Link>

        {/* Nav — centered */}
        <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cx(
                "nav-link font-sans text-[13px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-gold",
                pathname === item.href ? "text-gold" : "text-cream/80"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons — far right corner (search at the very edge) */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/saved"
            aria-label="View saved items"
            className="flex h-10 items-center justify-center rounded-full px-2 text-cream/85 transition-colors hover:text-gold"
          >
            <SavedCount />
          </Link>
          <Link
            href="/search"
            aria-label="Search products and guides"
            className="flex h-10 w-10 items-center justify-center rounded-full text-cream/85 transition-colors hover:text-gold"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-cream/85 transition-colors hover:text-gold lg:hidden"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cx(
          "overflow-hidden border-cream/10 bg-ink transition-[max-height] duration-300 ease-in-out lg:hidden",
          open ? "max-h-[480px] border-t" : "max-h-0"
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cx(
                "border-b border-cream/5 py-3.5 font-sans text-sm font-medium uppercase tracking-[0.16em] transition-colors last:border-0 hover:text-gold",
                pathname === item.href ? "text-gold" : "text-cream/85"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
