import type { Sentiment } from "@/config/constants";
import { cn } from "@/lib/utils";

const ACCENT: Record<Sentiment, string> = {
  Positive: "text-emerald-600 dark:text-emerald-400",
  Negative: "text-red-600 dark:text-red-400",
  Mixed: "text-amber-600 dark:text-amber-400",
  Neutral: "text-slate-400 dark:text-slate-500",
};

const GLYPH: Record<Sentiment, string> = {
  Positive: "▲",
  Negative: "▼",
  Mixed: "◆",
  Neutral: "◆",
};

/**
 * The briefing's one-line verdict, with a sentiment-colored directional
 * glyph. Shared by the feed card and chat message so the takeaway reads
 * the same everywhere.
 */
export function InvestorTakeaway({
  text,
  sentiment,
  className,
}: {
  text: string;
  sentiment: Sentiment;
  className?: string;
}) {
  return (
    <p
      className={cn("flex gap-2 leading-snug", className)}
      title={`${sentiment} takeaway`}
    >
      <span
        className={cn("shrink-0 mt-0.5 text-[10px]", ACCENT[sentiment])}
        aria-hidden="true"
      >
        {GLYPH[sentiment]}
      </span>
      <span className="italic text-slate-600 dark:text-slate-300">{text}</span>
      <span className="sr-only">({sentiment} sentiment)</span>
    </p>
  );
}
