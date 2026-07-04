export const SIGNIFICANCE_LEVELS = ["High", "Medium", "Low"] as const;

// Quiet by design: only High materiality gets a (restrained) color; Medium
// and Low stay neutral so the UI doesn't shout.
export const SIGNIFICANCE_CONFIG = {
  High: {
    label: "HIGH",
    badge: "text-red-600/80 dark:text-red-400/80",
    dot: "bg-red-500/80 dark:bg-red-400/80",
    border: "border-red-500/30",
    activeToggle:
      "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  },
  Medium: {
    label: "MED",
    badge: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400 dark:bg-slate-500",
    border: "border-slate-200 dark:border-slate-700",
    activeToggle:
      "bg-slate-200 text-slate-700 dark:bg-white/[0.1] dark:text-slate-200",
  },
  Low: {
    label: "LOW",
    badge: "text-slate-400 dark:text-slate-500",
    dot: "bg-slate-300 dark:bg-slate-600",
    border: "border-slate-200 dark:border-slate-700",
    activeToggle:
      "bg-slate-200 text-slate-700 dark:bg-white/[0.1] dark:text-slate-200",
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

export const MARKET_CAP_BUCKETS = [
  { key: "mega", label: "Mega", hint: "≥$200B", min: 200e9, max: Infinity },
  { key: "large", label: "Large", hint: "$10–200B", min: 10e9, max: 200e9 },
  { key: "mid", label: "Mid", hint: "$2–10B", min: 2e9, max: 10e9 },
  { key: "small", label: "Small", hint: "$300M–2B", min: 300e6, max: 2e9 },
  { key: "micro", label: "Micro", hint: "<$300M", min: 0, max: 300e6 },
] as const;

export type MarketCapBucket = (typeof MARKET_CAP_BUCKETS)[number]["key"];

export function marketCapBucket(cap: number | null | undefined): MarketCapBucket | null {
  if (cap == null || cap <= 0) return null;
  const bucket = MARKET_CAP_BUCKETS.find((b) => cap >= b.min && cap < b.max);
  return bucket?.key ?? null;
}

/** Display order of price-reaction intervals on event cards. */
export const REACTION_INTERVALS = ["5m", "15m", "30m", "1h", "1d", "1w"] as const;
