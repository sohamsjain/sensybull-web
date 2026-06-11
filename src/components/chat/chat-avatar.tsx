"use client";

import { useState } from "react";

// Fallback ticker-keyed logo CDN, used when the company has no synced
// Benzinga mark. "{ticker}" is replaced; swap providers via env.
const LOGO_URL_TEMPLATE =
  process.env.NEXT_PUBLIC_LOGO_URL_TEMPLATE ||
  "https://assets.parqet.com/logos/symbol/{ticker}?format=png&size=96";

const AVATAR_COLORS = [
  "bg-blue-500/30 text-blue-300",
  "bg-emerald-500/30 text-emerald-300",
  "bg-violet-500/30 text-violet-300",
  "bg-amber-500/30 text-amber-300",
  "bg-rose-500/30 text-rose-300",
  "bg-cyan-500/30 text-cyan-300",
  "bg-indigo-500/30 text-indigo-300",
  "bg-teal-500/30 text-teal-300",
];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Company avatar as a squircle (rounded square) — square brand marks fill
 * it naturally, unlike circles which leave white crescents.
 *
 * Source priority: synced Benzinga dark mark (made for dark UIs, sits on
 * slate) → ticker CDN logo (light artwork, sits on white) → colored
 * initials. Each failed image advances to the next source.
 */
export function ChatAvatar({
  ticker,
  name,
  logoUrl,
  size = "md",
}: {
  ticker: string | null;
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md";
}) {
  const candidates = [
    logoUrl || null,
    ticker ? LOGO_URL_TEMPLATE.replace("{ticker}", encodeURIComponent(ticker)) : null,
  ].filter(Boolean) as string[];

  // Keyed by identity so a reused component instance resets its failure
  // count when it starts rendering a different company.
  const identity = `${ticker}|${logoUrl || ""}`;
  const [failure, setFailure] = useState({ identity: "", stage: 0 });
  const stage = failure.identity === identity ? failure.stage : 0;
  const src = candidates[stage];

  const label = ticker || name.slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-9 h-9 text-[10px]" : "w-12 h-12 text-xs";
  const radius = size === "sm" ? "rounded-lg" : "rounded-xl";

  if (src) {
    // Benzinga dark marks belong on the dark surface; CDN logos on white
    const surface = src === logoUrl ? "bg-slate-800" : "bg-white";
    return (
      <div
        className={`${sizeClass} ${radius} ${surface} overflow-hidden shrink-0 select-none`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="w-full h-full object-contain p-0.5"
          onError={() => setFailure({ identity, stage: stage + 1 })}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${radius} ${colorFor(label)} flex items-center justify-center font-mono font-bold shrink-0 select-none`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
