"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${hh}:${mm}:${ss} · ${date}`;
}

/**
 * Live local clock for the header utility bar. Ticks every second;
 * renders nothing time-sensitive until mounted to avoid hydration mismatch.
 */
export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      aria-label="Local time"
      aria-live="off"
      className="tabular-nums text-[11px] tracking-[0.18em] text-cream/60 font-sans uppercase"
    >
      {now ? formatTime(now) : "--:--:--"}
    </span>
  );
}
