"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

const SIZES = {
  sm: "size-9 rounded-md text-nano",
  md: "size-10 text-micro rounded-md",
} as const;

/**
 * A company's mark. Rounded square rather than a circle: these are logos and
 * tickers, not people, and the square edge sits better in a dense list.
 * Falls back to the ticker in mono when there is no logo to show.
 */
export function CompanyAvatar({
  ticker,
  name,
  size = "md",
  className,
}: {
  ticker: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const src =
    LOGO_DEV_TOKEN && ticker
      ? `https://img.logo.dev/ticker/${encodeURIComponent(ticker)}?token=${LOGO_DEV_TOKEN}&format=webp&size=128&theme=${resolvedTheme === "dark" ? "dark" : "light"}`
      : null;

  const [failed, setFailed] = useState<string | null>(null);
  const showImg = src && failed !== src;
  const label = ticker || name.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center overflow-hidden border border-line-subtle",
        SIZES[size],
        showImg ? "bg-surface" : "bg-surface-hover font-mono font-semibold text-ink-muted",
        className
      )}
      aria-hidden="true"
    >
      {showImg ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(src)}
        />
      ) : (
        label.slice(0, 4)
      )}
    </div>
  );
}
