"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cx } from "@/lib/utils";

interface ProductZoomImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

/**
 * Large product image with scroll-to-zoom.
 * - Hover over the image and scroll: zooms in/out smoothly (no click needed)
 * - Zoom follows the cursor, so details under the pointer stay in view
 * - Drag to pan while zoomed; double-click (or double-tap) resets
 * - A small hint pill tells visitors how it works
 */
export default function ProductZoomImage({ src, alt, priority = false }: ProductZoomImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 50, oy: 50 });
  const originRef = useRef({ x: 50, y: 50 });

  const MIN = 1;
  const MAX = 4;

  const applyOrigin = useCallback((clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    originRef.current = { x, y };
    setOrigin(`${x}% ${y}%`);
  }, []);

  // Scroll wheel → smooth zoom centered on cursor. Prevents page scroll while over image.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyOrigin(e.clientX, e.clientY);
      setScale((s) => {
        const next = s * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
        return Math.min(MAX, Math.max(MIN, next));
      });
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [applyOrigin]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (panning) {
        const frame = frameRef.current;
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        const dx = ((e.clientX - panStart.current.x) / rect.width) * 100;
        const dy = ((e.clientY - panStart.current.y) / rect.height) * 100;
        const x = Math.min(100, Math.max(0, panStart.current.ox + dx));
        const y = Math.min(100, Math.max(0, panStart.current.oy + dy));
        originRef.current = { x, y };
        setOrigin(`${x}% ${y}%`);
      } else if (scale > 1) {
        applyOrigin(e.clientX, e.clientY);
      }
    },
    [panning, scale, applyOrigin]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: originRef.current.x, oy: originRef.current.y };
  };

  const endPan = () => setPanning(false);

  const reset = useCallback(() => {
    setScale(1);
    originRef.current = { x: 50, y: 50 };
    setOrigin("50% 50%");
    setPanning(false);
  }, []);

  // Reset zoom when the image source changes
  useEffect(() => {
    reset();
  }, [src, reset]);

  return (
    <div
      ref={frameRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      onDoubleClick={reset}
      className={cx(
        "relative aspect-square select-none overflow-hidden rounded-3xl bg-coal",
        scale > 1 ? (panning ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      )}
      role="img"
      aria-label={`${alt} — scroll over the image to zoom`}
    >
      <div
        className="h-full w-full transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `scale(${scale})`, transformOrigin: origin }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          draggable={false}
        />
      </div>
      {/* Zoom hint pill */}
      <div
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full",
          "bg-ink/70 px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/90",
          "backdrop-blur-sm transition-opacity duration-500",
          scale > 1.05 ? "opacity-0" : "opacity-100"
        )}
      >
        Scroll to zoom &nbsp;·&nbsp; Drag to explore
      </div>
      {/* Reset button, visible while zoomed */}
      {scale > 1.05 && (
        <button
          type="button"
          onClick={reset}
          className="absolute right-4 top-4 rounded-full bg-ink/70 px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream backdrop-blur-sm transition-colors hover:bg-ink hover:text-gold"
          aria-label="Reset image zoom"
        >
          Reset
        </button>
      )}
    </div>
  );
}
