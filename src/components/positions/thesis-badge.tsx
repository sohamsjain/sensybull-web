"use client";

import type { ThesisStatus, ThesisImpact } from "@/types/api";

// Thesis status is meaningful signal, not decoration: intact stays quiet,
// watch gets a restrained amber, broken gets the same restrained red the
// feed reserves for High materiality.
const STATUS_STYLES: Record<ThesisStatus, string> = {
  intact:
    "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05]",
  watch:
    "text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15",
  broken:
    "text-red-700 dark:text-red-300 bg-red-500/10 dark:bg-red-500/15",
};

const STATUS_LABEL: Record<ThesisStatus, string> = {
  intact: "Thesis intact",
  watch: "Thesis at risk",
  broken: "Thesis broken",
};

export function ThesisBadge({
  status,
  className = "",
}: {
  status: ThesisStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "broken"
            ? "bg-red-500"
            : status === "watch"
              ? "bg-amber-500"
              : "bg-slate-400 dark:bg-slate-500"
        }`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

// Impact verdicts read like sentiment, so they use the same emerald/red the
// rest of the app reserves for sentiment/price data.
const IMPACT_STYLES: Record<ThesisImpact, string> = {
  supports: "text-emerald-700 dark:text-emerald-400",
  neutral: "text-slate-500 dark:text-slate-400",
  threatens: "text-amber-700 dark:text-amber-400",
  breaks: "text-red-700 dark:text-red-400",
};

const IMPACT_LABEL: Record<ThesisImpact, string> = {
  supports: "Supports",
  neutral: "Neutral",
  threatens: "Threatens",
  breaks: "Breaks",
};

export function ImpactLabel({ impact }: { impact: ThesisImpact }) {
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wide ${IMPACT_STYLES[impact]}`}>
      {IMPACT_LABEL[impact]}
    </span>
  );
}
