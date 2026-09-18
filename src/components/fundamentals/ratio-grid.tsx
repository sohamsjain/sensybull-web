"use client";

import type { FundamentalsRatios } from "@/types/fundamentals";
import { DEFAULT_HEADER_RATIOS, type HeaderRatioKey } from "@/lib/fundamentals/rows";
import {
  EMPTY,
  formatCompactDollars,
  formatMultiple,
  formatPerShare,
  formatPercent,
  formatPrice,
  formatShares,
} from "@/lib/fundamentals/format";
import { useQuote } from "@/hooks/use-quote";
import { formatChangePct } from "@/lib/quote";
import { cn } from "@/lib/utils";

function ratioText(key: HeaderRatioKey, r: Partial<FundamentalsRatios>): string {
  switch (key) {
    case "market_cap":
      return formatCompactDollars(r.market_cap);
    case "price":
      return formatPrice(r.price);
    case "high_low":
      return r.high_52w != null && r.low_52w != null
        ? `${formatPrice(r.high_52w)} / ${formatPrice(r.low_52w)}`
        : EMPTY;
    case "pe_ttm":
      return formatMultiple(r.pe_ttm);
    case "book_value_ps":
      return r.book_value_ps != null ? `$${formatPerShare(r.book_value_ps)}` : EMPTY;
    case "dividend_yield":
      return formatPercent(r.dividend_yield, 2);
    case "roce":
    case "roe":
    case "opm_ttm":
    case "sales_cagr_3y":
    case "profit_cagr_3y":
      return formatPercent(r[key], 1);
    case "shares_outstanding":
      return formatShares(r.shares_outstanding);
    case "pb":
    case "ev_ebitda":
    case "debt_to_equity":
    case "interest_coverage":
      return formatMultiple(r[key]);
    case "ev":
    case "fcf_ttm":
      return formatCompactDollars(r[key]);
    case "eps_ttm":
      return r.eps_ttm != null ? `$${formatPerShare(r.eps_ttm)}` : EMPTY;
  }
}

/**
 * The nine-cell ratio grid under the company name. Server-rendered from the
 * snapshot; only the price cell goes live once the page hydrates.
 */
export function RatioGrid({
  companyId,
  ratios,
}: {
  companyId: string;
  ratios: Partial<FundamentalsRatios>;
}) {
  const { quote } = useQuote(companyId);
  const live = quote && !quote.stale ? quote : null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
      {DEFAULT_HEADER_RATIOS.map((spec) => {
        const isPrice = spec.key === "price";
        const text =
          isPrice && live ? formatPrice(live.price) : ratioText(spec.key, ratios);
        const pct = isPrice && live ? live.change_pct : null;
        return (
          <div key={spec.key} className="min-w-0" title={spec.hint}>
            <dt className="text-micro text-ink-faint">{spec.label}</dt>
            <dd className="flex items-baseline gap-1.5 font-mono text-label tabular-nums text-ink">
              <span className="truncate">{text}</span>
              {pct != null && (
                <span
                  className={cn(
                    "text-micro",
                    pct >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {formatChangePct(pct)}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
