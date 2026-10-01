"use client";

import { useEffect } from "react";

export type TrackType = "product_view" | "page_view" | "guide_view";

interface TrackViewProps {
  type: TrackType;
  page?: string;
  productId?: string;
  articleId?: string;
}

/**
 * Fire-and-forget view tracking. POSTs to /api/track (owned by the API
 * layer); errors are swallowed so analytics can never break the page.
 */
export function TrackView({ type, page, productId, articleId }: TrackViewProps) {
  useEffect(() => {
    const payload: Record<string, string> = { type };
    if (page) payload.page = page;
    if (productId) payload.productId = productId;
    if (articleId) payload.articleId = articleId;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silent — tracking must never affect the visitor experience.
    });
  }, [type, page, productId, articleId]);

  return null;
}
