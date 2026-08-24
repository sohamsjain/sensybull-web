"use client";

import type { Quote } from "@/types/api";
import {
  formatChangePct,
  formatQuotePrice,
  quoteTooltip,
} from "@/lib/quote";

interface StockQuoteProps {
  quote: Quote | null;
  loading: boolean;
  className?: string;
}

/**
 * Compact last price + day change, shown beside the company name in the
 * watchlist header. Success/danger follows the price-data colour convention;
 * a stale price (market data down) renders muted with no change figure.
 */
export function StockQuote({ quote, loading, className = "" }: StockQuoteProps) {
  if (loading) {
    return (
      <div
        className={`h-4 w-16 animate-pulse rounded-xs bg-surface-hover ${className}`}
        aria-hidden
      />
    );
  }
  if (!quote) return null;

  const pct = quote.change_pct;
  const positive = pct != null && pct >= 0;

  return (
    <div
      className={`flex shrink-0 items-baseline gap-1.5 font-mono text-meta tabular-nums ${className}`}
      title={quoteTooltip(quote)}
      aria-label={`${quote.ticker} ${formatQuotePrice(quote.price)}${
        pct != null ? `, ${formatChangePct(pct)} today` : ""
      }`}
    >
      <span
        className={
          quote.stale ? "text-ink-faint" : "font-medium text-ink"
        }
      >
        {formatQuotePrice(quote.price)}
      </span>
      {pct != null && (
        <span
          className={
            positive ? "text-success" : "text-danger"
          }
        >
          {formatChangePct(pct)}
        </span>
      )}
    </div>
  );
}
