"use client";

import type { PriceReactions } from "@/types/events";
import { reactionSlots } from "@/lib/price-reactions";
import { fullDateTime } from "@/lib/utils";

interface PriceReactionStripProps {
  reactions: PriceReactions;
  /** The event's `price_reaction_intervals` — which slots it will get. */
  intervals?: string[] | null;
  className?: string;
}

function formatPct(pct: number): string {
  const rounded = Math.abs(pct) >= 10 ? pct.toFixed(1) : pct.toFixed(2);
  return `${pct > 0 ? "+" : ""}${rounded}%`;
}

/**
 * Horizontal strip of price moves after the filing (5m → 1w).
 * Success/danger follows the price-data colour convention; ⚡ marks moves
 * ≥ 2× ATR(14). A filing made during the session gets 5m–1h; one made
 * outside it gets a single "At open" chip (the next session's opening
 * print) instead — slot choice lives in `reactionSlots()`.
 */
export function PriceReactionStrip({
  reactions,
  intervals,
  className = "",
}: PriceReactionStripProps) {
  const points = reactionSlots(reactions, intervals);
  if (!points.some(({ point }) => point && point.pct != null)) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-1 font-mono text-micro tabular-nums ${className}`}
      aria-label="Price reaction since filing"
    >
      {points.map(({ interval, label, description, point }) => {
        if (!point || point.pct == null) {
          return (
            <span
              key={interval}
              className="rounded-xs px-1.5 py-0.5 text-ink-dim"
              title={`${description}: not yet measured`}
            >
              {label} —
            </span>
          );
        }
        const positive = point.pct >= 0;
        const tooltip = [
          `${description}: ${formatPct(point.pct)}`,
          point.price != null ? `at $${point.price}` : null,
          point.measured_at ? `(${fullDateTime(point.measured_at)})` : null,
          point.explosive ? "— explosive: ≥ 2× ATR(14)" : null,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={interval}
            className={`rounded-xs px-1.5 py-0.5 ${
              positive
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger"
            }`}
            title={tooltip}
          >
            <span className="opacity-60">{label}</span>{" "}
            {formatPct(point.pct)}
            {point.explosive && <span aria-hidden> ⚡</span>}
          </span>
        );
      })}
    </div>
  );
}
