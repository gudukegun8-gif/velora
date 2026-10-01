"use client";

import { useCallback, useEffect, useState } from "react";
import { cx } from "@/lib/utils";

export const SAVED_KEY = "velora_saved";

export interface SavedProduct {
  id: string;
  slug: string;
  title: string;
  image?: string;
}

export function readSaved(): SavedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedProduct[]) : [];
  } catch {
    return [];
  }
}

function writeSaved(items: SavedProduct[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("velora:saved-changed"));
  } catch {
    // Storage unavailable — fail silently.
  }
}

interface SaveButtonProps {
  id: string;
  slug: string;
  title: string;
  image?: string;
  className?: string;
}

/**
 * Toggles a product in the visitor's local save list (localStorage).
 * Stores id/slug/title/image so /saved can render without an API.
 */
export function SaveButton({ id, slug, title, image, className }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().some((item) => item.id === id));
  }, [id]);

  const toggle = useCallback(() => {
    const current = readSaved();
    const exists = current.some((item) => item.id === id);
    const next = exists
      ? current.filter((item) => item.id !== id)
      : [...current, { id, slug, title, ...(image ? { image } : {}) }];
    writeSaved(next);
    setSaved(!exists);
  }, [id, slug, title, image]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved items` : `Save ${title} for later`}
      title={saved ? "Saved" : "Save for later"}
      className={cx(
        "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors",
        saved
          ? "border-gold bg-gold text-ink"
          : "border-ink/15 bg-cream/80 text-ink/70 hover:border-golddeep hover:text-golddeep",
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
