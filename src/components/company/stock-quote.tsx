"use client";

import type { Quote } from "@/types/api";
import { formatChangePct, formatQuotePrice, quoteTooltip } from "@/lib/quote";
import { cn } from "@/lib/utils";

interface StockQuoteProps {
  quote: Quote | null | undefined;
  loading?: boolean;
  /** "sm" for list rows, "md" beside a pane title. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Last price + day change. The same figure everywhere it appears — pane
 * header, feed row, watchlist row — so a price never has two shapes.
 *
 * Success/danger follows the price-data colour convention; a stale price
 * (market data down) renders muted with no change figure.
 */
export function StockQuote({
  quote,
  loading = false,
  size = "md",
  className,
}: StockQuoteProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-xs bg-surface-hover",
          size === "sm" ? "h-3 w-14" : "h-4 w-16",
          className
        )}
        aria-hidden
      />
    );
  }
  if (!quote) return null;

  const pct = quote.change_pct;
  const positive = pct != null && pct >= 0;

  return (
    <div
      className={cn(
        "flex shrink-0 items-baseline gap-1.5 font-mono tabular-nums",
        size === "sm" ? "text-micro" : "text-meta",
        className
      )}
      title={quoteTooltip(quote)}
      aria-label={`${quote.ticker} ${formatQuotePrice(quote.price)}${
        pct != null ? `, ${formatChangePct(pct)} today` : ""
      }`}
    >
      <span className={quote.stale ? "text-ink-faint" : "font-medium text-ink"}>
        {formatQuotePrice(quote.price)}
      </span>
      {pct != null && (
        <span className={positive ? "text-success" : "text-danger"}>
          {formatChangePct(pct)}
        </span>
      )}
    </div>
  );
}
