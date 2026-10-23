"use client";

import { useEffect, useRef, useState } from "react";
import { ADSTERRA, adsEnabled, socialBarEnabled } from "@/lib/ads";

type BannerZone = { key: string; src: string; width: number; height: number };

/**
 * Adsterra iframe-format banner (atOptions). The network script uses
 * document.write, so it is isolated inside a sandboxed srcDoc iframe —
 * the only safe way to run it inside a React/Next app.
 */
export function AdBanner({ zone, label = true }: { zone: BannerZone; label?: boolean }) {
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script type="text/javascript">atOptions={'key':'${zone.key}','format':'iframe','height':${zone.height},'width':${zone.width},'params':{}};</script><script type="text/javascript" src="${zone.src}"></script></body></html>`;
  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.2em] text-cream/40">
          Advertisement
        </p>
      )}
      <iframe
        title="Advertisement"
        srcDoc={srcDoc}
        width={zone.width}
        height={zone.height}
        scrolling="no"
        frameBorder="0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ border: 0, maxWidth: "100%" }}
      />
    </div>
  );
}

/**
 * Responsive top/bottom banner: exactly ONE size renders per device —
 * 728x90 on desktop, 468x60 on tablets, 320x50 on phones.
 */
export function AdLeaderboard() {
  const [zone, setZone] = useState<BannerZone | null>(null);

  useEffect(() => {
    const pick = () => {
      const w = window.innerWidth;
      setZone(
        w >= 768
          ? ADSTERRA.banners.leaderboard728x90
          : w >= 480
            ? ADSTERRA.banners.fullBanner468x60
            : ADSTERRA.banners.mobileBanner320x50,
      );
    };
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, []);

  if (!zone) return null;
  return (
    <div className="mx-auto my-8 flex w-full justify-center px-4">
      <AdBanner zone={zone} />
    </div>
  );
}

/**
 * Desktop-only fixed side rail (160x600). Hidden below 1600px viewport
 * width so it can never overlap the centered content column.
 */
export function AdSkyscraperRail() {
  return (
    <div
      aria-label="Advertisement"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 min-[1600px]:block"
    >
      <AdBanner zone={ADSTERRA.banners.skyscraper160x600} label={false} />
    </div>
  );
}

/** Medium rectangle 300x250 — in-grid / in-content unit, max 1 per page. */
export function AdRectangle() {
  return (
    <div className="flex justify-center">
      <AdBanner zone={ADSTERRA.banners.rectangle300x250} />
    </div>
  );
}

/**
 * Adsterra Native Banner — restrained, clearly-labeled unit in the
 * prepared slots (product page, guide end, homepage).
 */
export function AdNativeBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adsEnabled || !ref.current) return;
    const host = ref.current;
    if (host.querySelector("script")) return; // already injected

    const container = document.createElement("div");
    container.id = `container-${ADSTERRA.nativeKey}`;
    host.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = ADSTERRA.nativeSrc;
    host.appendChild(script);
  }, []);

  if (!adsEnabled) return null;

  return (
    <aside aria-label="Advertisement" className="mx-auto my-10 w-full max-w-3xl px-4">
      <p className="mb-2 text-center font-sans text-[10px] uppercase tracking-[0.2em] text-cream/40">
        Advertisement
      </p>
      <div ref={ref} className="min-h-[90px]" />
    </aside>
  );
}

/**
 * Adsterra Social Bar — site-wide floating format, injected once.
 */
export function AdSocialBar() {
  useEffect(() => {
    if (!socialBarEnabled) return;
    if (document.querySelector(`script[src="${ADSTERRA.socialBarSrc}"]`)) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = ADSTERRA.socialBarSrc;
    document.body.appendChild(script);
  }, []);

  return null;
}
