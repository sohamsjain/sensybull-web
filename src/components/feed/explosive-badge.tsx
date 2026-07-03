"use client";

/**
 * Flags an event whose price move reached 2× ATR(14) at any measured
 * interval. Amber = materiality, per the design color rules.
 */
export function ExplosiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"
      title="Price moved at least 2× the 14-day ATR after this filing"
    >
      <span aria-hidden>⚡</span>
      2× ATR
    </span>
  );
}
