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
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
} as const;

// [variant][theme] — "auto" pairs the light palette with dark: overrides.
const VARIANTS: Record<
  NonNullable<TrackButtonProps["variant"]>,
  Record<NonNullable<TrackButtonProps["theme"]>, string>
> = {
  primary: {
    auto: "bg-indigo-600 hover:bg-indigo-500 text-white",
    light: "bg-indigo-600 hover:bg-indigo-500 text-white",
    dark: "bg-indigo-600 hover:bg-indigo-500 text-white",
  },
  outline: {
    auto: "border border-indigo-500/40 text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400",
    light: "border border-indigo-500/40 text-indigo-600 hover:bg-indigo-500/10",
    dark: "border border-indigo-400/40 text-indigo-400 hover:bg-indigo-400/10",
  },
  minimal: {
    auto: "text-indigo-600 hover:underline underline-offset-4 dark:text-indigo-400 px-0",
    light: "text-indigo-600 hover:underline underline-offset-4 px-0",
    dark: "text-indigo-400 hover:underline underline-offset-4 px-0",
  },
  dark: {
    auto: "bg-[#12141b] hover:bg-[#1a1d25] text-white border border-white/10",
    light: "bg-[#12141b] hover:bg-[#1a1d25] text-white border border-white/10",
    dark: "bg-[#12141b] hover:bg-[#1a1d25] text-white border border-white/10",
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
    rounded === "full" ? "rounded-full" : rounded === false ? "rounded-none" : "rounded-lg";

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
        <img src="/logo.png" alt="" className="w-4 h-4 dark:invert" aria-hidden />
      ) : (
        <span aria-hidden>+</span>
      )}
      {label ?? `Track ${normalized}`}
    </Link>
  );
}
