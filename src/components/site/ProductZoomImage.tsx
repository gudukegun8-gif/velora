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
 *
 * Implementation notes (bug fixes):
 * - Transform is applied directly to the DOM node via ref (no React state
 *   per mousemove/wheel), so rapid pointer movement never triggers
 *   re-render storms that made the page vibrate.
 * - No `will-change: transform` — promoting the image to its own compositor
 *   layer made browsers rasterize it once and scale the bitmap, which is
 *   what rendered the photo permanently blurry.
 * - No CSS transition on the transform during active zoom; transitions on
 *   rapidly-updated transforms fight each new value and cause stutter.
 *   The reset action animates via a short one-off transition instead.
 */
export default function ProductZoomImage({ src, alt, priority = false }: ProductZoomImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ scale: 1, ox: 50, oy: 50 });
  const rafRef = useRef<number>(0);
  const [zoomed, setZoomed] = useState(false);
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 50, oy: 50 });

  const MIN = 1;
  const MAX = 4;

  const applyTransform = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const { scale, ox, oy } = stateRef.current;
    inner.style.transform = `scale(${scale})`;
    inner.style.transformOrigin = `${ox}% ${oy}%`;
  }, []);

  const scheduleApply = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      applyTransform();
    });
  }, [applyTransform]);

  const setZoomedFlag = useCallback(() => {
    setZoomed(stateRef.current.scale > 1.05);
  }, []);

  const originFromEvent = useCallback((clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const o = originFromEvent(e.clientX, e.clientY);
      const st = stateRef.current;
      if (o) {
        st.ox = o.x;
        st.oy = o.y;
      }
      const next = st.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
      st.scale = Math.min(MAX, Math.max(MIN, next));
      scheduleApply();
      setZoomedFlag();
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [originFromEvent, scheduleApply, setZoomedFlag]);

  // Cancel any pending frame on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const st = stateRef.current;
      if (panning) {
        const frame = frameRef.current;
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        const dx = ((e.clientX - panStart.current.x) / rect.width) * 100;
        const dy = ((e.clientY - panStart.current.y) / rect.height) * 100;
        st.ox = Math.min(100, Math.max(0, panStart.current.ox + dx));
        st.oy = Math.min(100, Math.max(0, panStart.current.oy + dy));
        scheduleApply();
      } else if (st.scale > 1) {
        const o = originFromEvent(e.clientX, e.clientY);
        if (o) {
          st.ox = o.x;
          st.oy = o.y;
          scheduleApply();
        }
      }
    },
    [panning, originFromEvent, scheduleApply]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (stateRef.current.scale <= 1) return;
    setPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: stateRef.current.ox,
      oy: stateRef.current.oy,
    };
  };

  const endPan = () => setPanning(false);

  const reset = useCallback(() => {
    const inner = innerRef.current;
    const st = stateRef.current;
    st.scale = 1;
    st.ox = 50;
    st.oy = 50;
    if (inner) {
      // One-off smooth ease back to normal; remove the transition afterwards
      // so it never interferes with active zooming.
      inner.style.transition = "transform 200ms ease-out";
      applyTransform();
      window.setTimeout(() => {
        if (innerRef.current) innerRef.current.style.transition = "";
      }, 220);
    } else {
      applyTransform();
    }
    setPanning(false);
    setZoomed(false);
  }, [applyTransform]);

  // Reset zoom when the image source changes
  const srcRef = useRef(src);
  useEffect(() => {
    if (srcRef.current !== src) {
      srcRef.current = src;
      const st = stateRef.current;
      st.scale = 1;
      st.ox = 50;
      st.oy = 50;
      applyTransform();
      setPanning(false);
      setZoomed(false);
    }
  }, [src, applyTransform]);

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
        zoomed ? (panning ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      )}
      role="img"
      aria-label={`${alt} — scroll over the image to zoom`}
    >
      <div ref={innerRef} className="h-full w-full" style={{ transform: "scale(1)", transformOrigin: "50% 50%" }}>
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
          zoomed ? "opacity-0" : "opacity-100"
        )}
      >
        Scroll to zoom &nbsp;·&nbsp; Drag to explore
      </div>
      {/* Reset button, visible while zoomed */}
      {zoomed && (
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
