"use client";

import type { PriceReactions } from "@/types/events";
import { REACTION_INTERVALS } from "@/config/constants";
import { fullDateTime } from "@/lib/utils";

interface PriceReactionStripProps {
  reactions: PriceReactions;
  className?: string;
}

function formatPct(pct: number): string {
  const rounded = Math.abs(pct) >= 10 ? pct.toFixed(1) : pct.toFixed(2);
  return `${pct > 0 ? "+" : ""}${rounded}%`;
}

/**
 * Horizontal strip of price moves after the filing (5m → 1w).
 * Emerald/red follows the sentiment color convention; ⚡ marks moves
 * ≥ 2× ATR(14). For after-hours filings early intervals resolve to the
 * next available print — the tooltip shows when it actually traded.
 */
export function PriceReactionStrip({
  reactions,
  className = "",
}: PriceReactionStripProps) {
  const points = REACTION_INTERVALS.map((interval) => ({
    interval,
    point: reactions[interval],
  }));
  if (!points.some(({ point }) => point && point.pct != null)) return null;

  return (
    <div
      className={`flex items-center gap-1 flex-wrap font-mono text-[11px] tabular-nums ${className}`}
      aria-label="Price reaction since filing"
    >
      {points.map(({ interval, point }) => {
        if (!point || point.pct == null) {
          return (
            <span
              key={interval}
              className="px-1.5 py-0.5 rounded text-slate-300 dark:text-slate-600"
              title={`${interval} after filing: not yet measured`}
            >
              {interval} —
            </span>
          );
        }
        const positive = point.pct >= 0;
        const tooltip = [
          `${interval} after filing: ${formatPct(point.pct)}`,
          point.price != null ? `at $${point.price}` : null,
          point.measured_at ? `(${fullDateTime(point.measured_at)})` : null,
          point.explosive ? "— explosive: ≥ 2× ATR(14)" : null,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={interval}
            className={`px-1.5 py-0.5 rounded ${
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
            }`}
            title={tooltip}
          >
            <span className="opacity-60">{interval}</span>{" "}
            {formatPct(point.pct)}
            {point.explosive && <span aria-hidden> ⚡</span>}
          </span>
        );
      })}
    </div>
  );
}
