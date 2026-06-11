"use client";

import { useState } from "react";

// Ticker-keyed logo CDN. Parqet's logo API is free for ticker symbols;
// swap providers via env without touching code. "{ticker}" is replaced.
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

export function ChatAvatar({
  ticker,
  name,
  size = "md",
}: {
  ticker: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  // Track which ticker's logo failed so a reused component instance
  // retries when it starts rendering a different company.
  const [failedTicker, setFailedTicker] = useState<string | null>(null);

  const label = ticker || name.slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-9 h-9 text-[10px]" : "w-12 h-12 text-xs";
  const showLogo = !!ticker && failedTicker !== ticker;

  if (showLogo) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-white shrink-0 select-none`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL_TEMPLATE.replace("{ticker}", encodeURIComponent(ticker))}
          alt=""
          loading="lazy"
          className="w-full h-full object-contain p-0.5"
          onError={() => setFailedTicker(ticker)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorFor(label)} rounded-full flex items-center justify-center font-mono font-bold shrink-0 select-none`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
