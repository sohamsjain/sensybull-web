"use client";

/**
 * Reusable "Track on Sensybull" button — a styled deep link to /add/:symbol.
 * Self-contained styling (no dependency on the app shell) so it can sit on
 * marketing pages, dialogs, or docs and always look right.
 *
 *   <TrackButton symbol="MU" />                        → "+ Track MU"
 *   <TrackButton symbol="MU" label="Track Micron" />   → "+ Track Micron"
 */

import Link from "next/link";
import { addPath } from "@/lib/share";
import { trackShareEvent } from "@/lib/share-analytics";
import { cn } from "@/lib/utils";

export interface TrackButtonProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "minimal" | "dark";
  /** "auto" follows the app theme; "light"/"dark" force a palette. */
  theme?: "light" | "dark" | "auto";
  /** Show the Sensybull mark before the label. */
  showLogo?: boolean;
  /** true = pill; false = square corners; default rounded-lg. */
  rounded?: boolean | "full";
  /** Custom label; defaults to "Track {SYMBOL}". */
  label?: string;
  /** Attribution recorded when the link is followed, e.g. "profile-page". */
  refSource?: string;
  className?: string;
}

const SIZES = {
  sm: "h-7 gap-1.5 px-2.5 text-meta",
  md: "h-8 gap-1.5 px-3 text-label",
  lg: "h-10 gap-2 px-4 text-body",
} as const;

// [variant][theme] — "auto" pairs the light palette with dark: overrides.
const VARIANTS: Record<
  NonNullable<TrackButtonProps["variant"]>,
  Record<NonNullable<TrackButtonProps["theme"]>, string>
> = {
  // "auto" uses design tokens and follows the app theme. The forced
  // palettes stay on literal colours on purpose: they render on pages that
  // are not ours and cannot see our custom properties.
  primary: {
    auto: "bg-brand text-brand-on hover:bg-brand-hover",
    light: "bg-[#4b3fd4] text-white hover:bg-[#4034bd]",
    dark: "bg-[#6355e8] text-white hover:bg-[#7466f0]",
  },
  outline: {
    auto: "border border-brand/40 text-brand-ink hover:bg-brand-soft",
    light: "border border-[#4b3fd4]/40 text-[#4b3fd4] hover:bg-[#4b3fd4]/10",
    dark: "border border-[#8b7cf6]/40 text-[#8b7cf6] hover:bg-[#8b7cf6]/10",
  },
  minimal: {
    auto: "px-0 text-brand-ink underline-offset-4 hover:underline",
    light: "px-0 text-[#4b3fd4] underline-offset-4 hover:underline",
    dark: "px-0 text-[#8b7cf6] underline-offset-4 hover:underline",
  },
  dark: {
    auto: "border border-white/10 bg-[#13161c] text-white hover:bg-[#1a1d25]",
    light: "border border-white/10 bg-[#13161c] text-white hover:bg-[#1a1d25]",
    dark: "border border-white/10 bg-[#13161c] text-white hover:bg-[#1a1d25]",
  },
};

export function TrackButton({
  symbol,
  size = "md",
  variant = "primary",
  theme = "auto",
  showLogo = false,
  rounded,
  label,
  refSource,
  className,
}: TrackButtonProps) {
  const normalized = symbol.trim().toUpperCase();
  const radius =
    rounded === "full" ? "rounded-full" : rounded === false ? "rounded-none" : "rounded-md";

  return (
    <Link
      href={addPath(normalized, refSource ? { ref: refSource } : undefined)}
      onClick={() =>
        trackShareEvent("button_clicked", {
          symbol: normalized,
          attribution: refSource ? { ref: refSource } : undefined,
        })
      }
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors select-none",
        SIZES[size],
        VARIANTS[variant][theme],
        radius,
        className
      )}
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.png" alt="" className="size-4 dark:invert" aria-hidden />
      ) : (
        <span aria-hidden>+</span>
      )}
      {label ?? `Track ${normalized}`}
    </Link>
  );
}
