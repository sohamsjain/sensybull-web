"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

const AVATAR_COLORS = [
  "bg-fuchsia-500/30 text-fuchsia-300",
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
  const { resolvedTheme } = useTheme();
  const src =
    LOGO_DEV_TOKEN && ticker
      ? `https://img.logo.dev/ticker/${encodeURIComponent(ticker)}?token=${LOGO_DEV_TOKEN}&format=webp&size=128&theme=${resolvedTheme === "dark" ? "dark" : "light"}`
      : null;

  const [failed, setFailed] = useState<string | null>(null);
  const showImg = src && failed !== src;

  const label = ticker || name.slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-9 h-9 text-[10px]" : "w-12 h-12 text-xs";
  const radius = size === "sm" ? "rounded-lg" : "rounded-xl";

  if (showImg) {
    return (
      <div
        className={`${sizeClass} ${radius} bg-transparent overflow-hidden shrink-0 select-none`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setFailed(src)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${radius} ${colorFor(label)} flex items-center justify-center font-mono font-semibold shrink-0 select-none`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
