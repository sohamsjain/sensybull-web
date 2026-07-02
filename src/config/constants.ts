export const SIGNIFICANCE_LEVELS = ["High", "Medium", "Low"] as const;

export const SIGNIFICANCE_CONFIG = {
  High: {
    label: "HIGH",
    badge:
      "bg-red-500/10 text-red-700 border-red-500/30 dark:bg-red-500/20 dark:text-red-400",
    border: "border-red-500/30",
    activeToggle:
      "bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  },
  Medium: {
    label: "MED",
    badge:
      "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400",
    border: "border-amber-500/30",
    activeToggle:
      "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  Low: {
    label: "LOW",
    badge:
      "bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    activeToggle:
      "bg-slate-500/15 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
  },
} as const;

export const SENTIMENT_CONFIG = {
  Positive: { color: "bg-green-400", title: "Positive" },
  Negative: { color: "bg-red-400", title: "Negative" },
  Neutral: { color: "bg-slate-500", title: "Neutral" },
  Mixed: { color: "bg-amber-400", title: "Mixed" },
} as const;

export type Significance = keyof typeof SIGNIFICANCE_CONFIG;
export type Sentiment = keyof typeof SENTIMENT_CONFIG;
