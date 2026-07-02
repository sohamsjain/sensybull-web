"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

const LOGO_COLORS = [
  "bg-fuchsia-500/10 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
  "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

export function CompanyLogo({
  ticker,
  name,
}: {
  ticker: string | null;
  name: string;
}) {
  const { resolvedTheme } = useTheme();
  const src =
    LOGO_DEV_TOKEN && ticker
      ? `https://img.logo.dev/ticker/${encodeURIComponent(ticker)}?token=${LOGO_DEV_TOKEN}&format=webp&size=128&theme=${resolvedTheme === "dark" ? "dark" : "light"}`
      : null;

  const [failed, setFailed] = useState<string | null>(null);
  const showImg = src && failed !== src;
  const label = ticker || name.slice(0, 2).toUpperCase();

  if (showImg) {
    return (
      <div
        className="w-10 h-10 rounded-full bg-white dark:bg-white/5 overflow-hidden shrink-0 select-none ring-1 ring-slate-200/60 dark:ring-white/[0.06]"
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
      className={`w-10 h-10 rounded-full ${colorFor(label)} flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none ring-1 ring-slate-200/60 dark:ring-white/[0.06]`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
