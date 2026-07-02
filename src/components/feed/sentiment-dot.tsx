import { SENTIMENT_CONFIG, type Sentiment } from "@/config/constants";

/**
 * Sentiment indicator. The dot alone is color-only, so it always carries an
 * accessible label; pass `label` to spell the sentiment out visually too
 * (used when a card or message is expanded).
 */
export function SentimentDot({
  sentiment,
  label = false,
}: {
  sentiment: Sentiment;
  label?: boolean;
}) {
  const config = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.Neutral;
  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`${config.title} sentiment`}
      title={`${config.title} sentiment`}
    >
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {label && (
        <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
          {config.title}
        </span>
      )}
    </span>
  );
}
