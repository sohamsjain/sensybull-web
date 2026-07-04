"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

// One quiet style for every fallback avatar — company logos carry the
// visual identity; initials just need to be readable.
const AVATAR_STYLE =
  "bg-slate-200/70 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300";

export function CompanyAvatar({
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
  const radius = "rounded-full";

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
      className={`${sizeClass} ${radius} ${AVATAR_STYLE} flex items-center justify-center font-mono font-semibold shrink-0 select-none`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
