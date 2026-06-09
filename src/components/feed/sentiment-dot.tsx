import { SENTIMENT_CONFIG, type Sentiment } from "@/config/constants";

export function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  const config = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.Neutral;
  return (
    <span
      className={`w-2 h-2 rounded-full ${config.color}`}
      title={config.title}
    />
  );
}
