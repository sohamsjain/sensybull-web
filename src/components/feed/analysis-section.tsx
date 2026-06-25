"use client";

import { useState } from "react";
import type { EventAnalysis } from "@/types/events";

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  low: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
};

/**
 * Second-order analysis for a filing: the deterministic financial ratios plus
 * an unbiased, bull-and-bear interpretation. Informational only — never advice.
 */
export function AnalysisSection({ analysis }: { analysis?: EventAnalysis | null }) {
  const [showDetail, setShowDetail] = useState(false);

  if (!analysis || analysis.status !== "done" || !analysis.insight) return null;
  const { insight, metrics, fundamentals_as_of } = analysis;
  const lines = metrics?.lines || [];
  const hasDetail =
    lines.length > 0 ||
    insight.bull_points.length > 0 ||
    insight.bear_points.length > 0 ||
    insight.caveats.length > 0;

  const confidence = insight.confidence || "medium";

  return (
    <div
      className="mt-3 rounded-lg border border-violet-500/15 bg-violet-500/[0.04] p-3"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-300/90">
          Deep analysis
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ${
            CONFIDENCE_STYLE[confidence] || CONFIDENCE_STYLE.medium
          }`}
          title="How confident the analysis is, given available data"
        >
          {confidence} confidence
        </span>
        {fundamentals_as_of && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto tabular-nums">
            financials as of {fundamentals_as_of}
          </span>
        )}
      </div>

      {/* Insight */}
      {insight.insight && (
        <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
          {insight.insight}
        </p>
      )}

      {/* Detail toggle */}
      {hasDetail && (
        <button
          onClick={() => setShowDetail((s) => !s)}
          className="mt-2 text-[11px] text-violet-400 hover:text-violet-300 font-medium"
        >
          {showDetail ? "Hide financial detail" : "Show financial detail"}
        </button>
      )}

      {showDetail && (
        <div className="mt-2 space-y-2.5">
          {/* Computed ratios */}
          {lines.length > 0 && (
            <ul className="space-y-1">
              {lines.map((line, i) => (
                <li
                  key={i}
                  className="text-[12px] text-slate-600 dark:text-slate-300 font-mono leading-snug flex gap-1.5"
                >
                  <span className="text-violet-400/70 shrink-0">›</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Bull / bear */}
          {(insight.bull_points.length > 0 || insight.bear_points.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <PointList label="Bull" color="emerald" points={insight.bull_points} />
              <PointList label="Bear" color="rose" points={insight.bear_points} />
            </div>
          )}

          {/* Caveats */}
          {insight.caveats.length > 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic leading-relaxed">
              Caveats: {insight.caveats.join("; ")}
            </p>
          )}

          <p className="text-[10px] text-slate-400/80 dark:text-slate-600">
            Informational analysis from reported financials — not investment advice.
          </p>
        </div>
      )}
    </div>
  );
}

function PointList({
  label,
  color,
  points,
}: {
  label: string;
  color: "emerald" | "rose";
  points: string[];
}) {
  if (points.length === 0) return null;
  const dot = color === "emerald" ? "text-emerald-400" : "text-rose-400";
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${dot}`}>
        {label}
      </p>
      <ul className="space-y-0.5">
        {points.map((p, i) => (
          <li key={i} className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug flex gap-1.5">
            <span className={`${dot} shrink-0`}>•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
