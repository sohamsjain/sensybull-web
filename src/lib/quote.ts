import type { Quote } from "@/types/api";

/**
 * Price with the precision the number deserves: two decimals for ordinary
 * share prices, four for sub-dollar names where "$0.01" hides the move.
 */
export function formatQuotePrice(price: number): string {
  const decimals = Math.abs(price) >= 1 ? 2 : 4;
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Signed day change, e.g. "+1.24%" / "-0.86%". */
export function formatChangePct(pct: number): string {
  const rounded = Math.abs(pct) >= 10 ? pct.toFixed(1) : pct.toFixed(2);
  return `${pct > 0 ? "+" : ""}${rounded}%`;
}

/** Signed dollar change, e.g. "+1.86" / "-1.86". */
export function formatChange(change: number): string {
  const abs = Math.abs(change);
  const decimals = abs >= 1 ? 2 : 4;
  return `${change > 0 ? "+" : change < 0 ? "-" : ""}${abs.toFixed(decimals)}`;
}

/** Hover text: what the number is and how fresh it is. */
export function quoteTooltip(quote: Quote): string {
  const parts = [`${quote.ticker} ${formatQuotePrice(quote.price)}`];
  if (quote.change != null && quote.change_pct != null) {
    parts.push(
      `${formatChange(quote.change)} (${formatChangePct(
        quote.change_pct
      )}) today`
    );
  }
  if (quote.prev_close != null) {
    parts.push(`prev close ${formatQuotePrice(quote.prev_close)}`);
  }
  if (quote.stale) {
    parts.push("last synced price — live data unavailable");
  } else if (quote.as_of) {
    parts.push(`as of ${new Date(quote.as_of).toLocaleString()}`);
  }
  return parts.join(" · ");
}
