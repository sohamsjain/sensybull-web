"use client";

import type { FundamentalsRatios } from "@/types/fundamentals";
import { DEFAULT_HEADER_RATIOS, type HeaderRatioKey } from "@/lib/fundamentals/rows";
import {
  EMPTY,
  EMPTY_STAT,
  formatPrice,
  statCompactDollars,
  statMultiple,
  statPercent,
  statPerShare,
  statPrice,
  statShares,
  type StatValue,
} from "@/lib/fundamentals/format";
import { useQuote } from "@/hooks/use-quote";
import { formatChangePct } from "@/lib/quote";
import { cn } from "@/lib/utils";

function ratioStat(key: HeaderRatioKey, r: Partial<FundamentalsRatios>): StatValue {
  switch (key) {
    case "market_cap":
    case "ev":
    case "fcf_ttm":
    case "revenue_ttm":
    case "net_income_ttm":
      return statCompactDollars(r[key]);
    case "price":
      return statPrice(r.price);
    case "high_low":
      return r.high_52w != null && r.low_52w != null
        ? { value: `${formatPrice(r.high_52w)} / ${formatPrice(r.low_52w)}` }
        : EMPTY_STAT;
    case "book_value_ps":
    case "eps_ttm":
      return statPerShare(r[key]);
    case "dividend_yield":
      return statPercent(r.dividend_yield, 2);
    case "roce":
    case "roe":
    case "opm_ttm":
    case "sales_cagr_3y":
    case "profit_cagr_3y":
      return statPercent(r[key], 1);
    case "shares_outstanding":
      return statShares(r.shares_outstanding);
    case "pe_ttm":
    case "pb":
    case "ev_ebitda":
    case "debt_to_equity":
    case "interest_coverage":
      return statMultiple(r[key]);
  }
}

/**
 * The header stats: one row per ratio, label left and figure right, three
 * columns across. Screener's layout, and for the same reason — a reader
 * scanning for one number finds it by its label, and every figure lands on
 * the same right edge so the column can be read straight down.
 *
 * Alternate rows are tinted rather than ruled. A band carries the eye
 * across all three columns at once, which is the direction this grid is
 * actually read in; a rule under every cell would draw twenty-one
 * horizontal lines and fight the figures for attention.
 *
 * Server-rendered from the snapshot; only the price row goes live once the
 * page hydrates.
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
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {DEFAULT_HEADER_RATIOS.map((spec, index) => {
        const isPrice = spec.key === "price";
        const stat = isPrice && live ? statPrice(live.price) : ratioStat(spec.key, ratios);
        const pct = isPrice && live ? live.change_pct : null;
        const missing = stat.value === EMPTY;
        // Banding follows the widest layout's rows so the stripe reads
        // straight across all three columns.
        const striped = Math.floor(index / 3) % 2 === 1;
        return (
          <div
            key={spec.key}
            title={spec.hint}
            className={cn(
              "flex items-baseline justify-between gap-3 px-2.5 py-1.5",
              striped && "sm:bg-stripe",
              index % 2 === 1 && "max-sm:bg-stripe"
            )}
          >
            <dt className="shrink-0 text-body text-ink-muted">{spec.label}</dt>
            <dd
              className={cn(
                "flex min-w-0 items-baseline gap-1 text-body tabular-nums",
                missing ? "text-ink-faint" : "text-ink"
              )}
            >
              <span className="truncate font-semibold">{stat.value}</span>
              {stat.unit && (
                <span className="shrink-0 font-normal text-ink-faint">{stat.unit}</span>
              )}
              {pct != null && (
                <span
                  className={cn(
                    "shrink-0 text-micro",
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
