"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/trending", label: "Trending Review" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/comparisons", label: "Comparisons" },
  { href: "/admin/merchants", label: "Merchants" },
  { href: "/admin/clicks", label: "Clicks" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/settings", label: "Settings" },
];

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-gold/15 text-gold ring-1 ring-inset ring-gold/40"
          : "text-cream/70 hover:bg-white/5 hover:text-cream"
      )}
    >
      {label}
    </Link>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col bg-coal md:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="font-display text-2xl font-semibold tracking-wide text-cream">
              V&Eacute;LORA
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
              Admin
            </p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          <div className="space-y-2 border-t border-white/10 px-3 py-4">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-sm font-medium text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
            >
              View Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-sand bg-coal px-4 py-3 md:hidden">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-cream">V&Eacute;LORA Admin</p>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-cream/80 hover:text-cream"
              >
                Logout
              </button>
            </div>
            <nav
              className="mt-2 flex gap-1 overflow-x-auto pb-1"
              aria-label="Admin navigation"
            >
              {NAV.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              <Link
                href="/"
                className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-cream/70 hover:bg-white/5 hover:text-cream"
              >
                View Site
              </Link>
            </nav>
          </header>

          <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
