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
 * watchlist header. Emerald/red follows the price-data color convention;
 * a stale price (market data down) renders muted with no change figure.
 */
export function StockQuote({ quote, loading, className = "" }: StockQuoteProps) {
  if (loading) {
    return (
      <div
        className={`h-4 w-16 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse ${className}`}
        aria-hidden
      />
    );
  }
  if (!quote) return null;

  const pct = quote.change_pct;
  const positive = pct != null && pct >= 0;

  return (
    <div
      className={`flex items-baseline gap-1.5 font-mono text-xs tabular-nums shrink-0 ${className}`}
      title={quoteTooltip(quote)}
      aria-label={`${quote.ticker} ${formatQuotePrice(quote.price)}${
        pct != null ? `, ${formatChangePct(pct)} today` : ""
      }`}
    >
      <span
        className={
          quote.stale
            ? "text-slate-400 dark:text-slate-500"
            : "text-slate-900 dark:text-white/90 font-medium"
        }
      >
        {formatQuotePrice(quote.price)}
      </span>
      {pct != null && (
        <span
          className={
            positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }
        >
          {formatChangePct(pct)}
        </span>
      )}
    </div>
  );
}
