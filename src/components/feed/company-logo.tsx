"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

// One quiet style for every fallback logo — real logos carry the identity
const LOGO_STYLE =
  "bg-slate-200/70 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300";

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
      className={`w-10 h-10 rounded-full ${LOGO_STYLE} flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none ring-1 ring-slate-200/60 dark:ring-white/[0.06]`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
