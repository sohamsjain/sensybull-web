export const SIGNIFICANCE_LEVELS = ["High", "Medium", "Low"] as const;

export const SIGNIFICANCE_CONFIG = {
  High: {
    label: "HIGH",
    badge: "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
    dot: "bg-red-500 dark:bg-red-400",
    border: "border-red-500/30",
    activeToggle:
      "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  },
  Medium: {
    label: "MED",
    badge:
      "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
    border: "border-amber-500/30",
    activeToggle:
      "bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400",
  },
  Low: {
    label: "LOW",
    badge:
      "bg-slate-500/10 text-slate-500 dark:bg-slate-400/10 dark:text-slate-400",
    dot: "bg-slate-400 dark:bg-slate-500",
    border: "border-slate-200 dark:border-slate-700",
    activeToggle:
      "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300",
  },
} as const;

export const SENTIMENT_CONFIG = {
  Positive: { color: "bg-emerald-500 dark:bg-emerald-400", title: "Positive" },
  Negative: { color: "bg-red-500 dark:bg-red-400", title: "Negative" },
  Neutral: { color: "bg-slate-400 dark:bg-slate-500", title: "Neutral" },
  Mixed: { color: "bg-amber-500 dark:bg-amber-400", title: "Mixed" },
} as const;

export type Significance = keyof typeof SIGNIFICANCE_CONFIG;
export type Sentiment = keyof typeof SENTIMENT_CONFIG;
