"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

const SIZES = {
  sm: "size-9 text-nano",
  md: "size-10 text-micro",
} as const;

/**
 * A company's mark: the logo where we have one, the ticker in mono where we
 * don't. Round, so a wordmark, a monogram and four letters of ticker all
 * occupy the same silhouette down the left edge of a list.
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
        "flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-line-subtle",
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
