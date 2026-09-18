/**
 * Number formatting for the fundamentals page.
 *
 * Screener's convention, adapted to dollars: statement amounts in one unit
 * for the whole table ($ Mn by default, $ Bn on request), integers unless
 * the number is small enough that rounding would erase it, thousands
 * separators, a leading minus (never parentheses), and "—" for a number
 * the company simply doesn't report. Percentages and days are integers.
 */

export type Units = "mn" | "bn";

export const UNIT_LABEL: Record<Units, string> = { mn: "$ Mn", bn: "$ Bn" };

const DIVISOR: Record<Units, number> = { mn: 1_000_000, bn: 1_000_000_000 };

export const EMPTY = "—";

function group(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** A statement amount (whole dollars) in the table's unit. */
export function formatAmount(dollars: number | null | undefined, units: Units): string {
  if (dollars == null || !Number.isFinite(dollars)) return EMPTY;
  const scaled = dollars / DIVISOR[units];
  const abs = Math.abs(scaled);
  // Below 10 in the current unit, an integer would hide the figure
  // ($2.4 Mn of revenue is not "2"). Billions always carry two decimals.
  const decimals = units === "bn" ? 2 : abs < 10 && abs > 0 ? 1 : 0;
  const rounded = Number(scaled.toFixed(decimals));
  if (rounded === 0) return "0";
  return group(rounded, decimals);
}

/** Whole percent, e.g. "34%", "-3%". */
export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  return `${group(Number(value.toFixed(decimals)), decimals)}%`;
}

/** Days ratios: integers. */
export function formatDays(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  return group(Math.round(value), 0);
}

/** Per-share dollars (EPS, book value): two decimals. */
export function formatPerShare(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  return group(value, 2);
}

/** A plain multiple (P/E, P/B, EV/EBITDA): one decimal. */
export function formatMultiple(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  return group(value, 1);
}

/** "$3.56T", "$45.2B", "$820M" — for the header, not the tables. */
export function formatCompactDollars(dollars: number | null | undefined): string {
  if (dollars == null || !Number.isFinite(dollars)) return EMPTY;
  const abs = Math.abs(dollars);
  const sign = dollars < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
  return `${sign}$${group(abs, 0)}`;
}

/** Share counts: "14.8B", "312M". */
export function formatShares(count: number | null | undefined): string {
  if (count == null || !Number.isFinite(count)) return EMPTY;
  if (count >= 1e9) return `${(count / 1e9).toFixed(1)}B`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(0)}M`;
  return group(count, 0);
}

/** "$240.50" with the precision a share price deserves. */
export function formatPrice(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price)) return EMPTY;
  const decimals = Math.abs(price) >= 1 ? 2 : 4;
  return `$${group(price, decimals)}`;
}

/** Growth-grid cell: a CAGR as a whole percent, or "—". */
export function formatGrowth(value: number | null | undefined): string {
  return formatPercent(value, 0);
}

/** "Sep 2025" → unchanged; "2025-09-27" → "Sep 27, 2025". */
export function formatFilingDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY;
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Employees, holders: "164,000". */
export function formatCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return EMPTY;
  return group(value, 0);
}
