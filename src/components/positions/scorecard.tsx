"use client";

import type { Scorecard } from "@/types/api";

/**
 * Track-record strip: what the engine has judged and how the tape moved
 * afterwards. The moment there's real history, "breaks preceded an average
 * −X% week" is the product's own receipts.
 */

function pct(v: number | undefined): string | null {
  if (v === undefined) return null;
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function moveClass(v: number | undefined): string {
  if (v === undefined) return "";
  return v < 0
    ? "text-red-700 dark:text-red-400"
    : "text-emerald-700 dark:text-emerald-400";
}

export function ScorecardStrip({ scorecard }: { scorecard: Scorecard | null }) {
  if (!scorecard || scorecard.assessed_filings === 0) return null;

  const counts = scorecard.verdict_counts;
  const flagged = (counts.breaks ?? 0) + (counts.threatens ?? 0);
  const breaksWeek = scorecard.avg_move_after_verdict.breaks?.["1w"];
  const threatensWeek = scorecard.avg_move_after_verdict.threatens?.["1w"];

  return (
    <div className="mb-5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#12141b] px-3.5 py-2.5">
      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <span>
          <span className="text-slate-900 dark:text-white/90 font-medium tabular-nums">
            {scorecard.assessed_filings}
          </span>{" "}
          filing{scorecard.assessed_filings === 1 ? "" : "s"} judged
        </span>
        {flagged > 0 && (
          <span>
            <span className="text-slate-900 dark:text-white/90 font-medium tabular-nums">
              {flagged}
            </span>{" "}
            flagged your thesis
          </span>
        )}
        {breaksWeek !== undefined && (
          <span>
            after a break verdict:{" "}
            <span className={`font-medium tabular-nums ${moveClass(breaksWeek)}`}>
              {pct(breaksWeek)}
            </span>{" "}
            avg next week
          </span>
        )}
        {breaksWeek === undefined && threatensWeek !== undefined && (
          <span>
            after a threat verdict:{" "}
            <span className={`font-medium tabular-nums ${moveClass(threatensWeek)}`}>
              {pct(threatensWeek)}
            </span>{" "}
            avg next week
          </span>
        )}
      </div>
    </div>
  );
}
