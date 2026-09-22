/**
 * Number formatting for the fundamentals page.
 *
 * Screener's convention, adapted to dollars: every statement amount is in
 * $ Mn — one unit for the whole page, stated once under the header, never
 * a per-table toggle — as a whole number with thousands separators, a
 * leading minus (never parentheses), and "—" for a figure the company
 * simply doesn't report. Percentages and days are integers too.
 *
 * Whole numbers throughout is the point: a column that mixes "8.4" and
 * "12" and "140" can't be scanned, and scanning is what the column is for.
 * A company whose lines are all under $1 Mn rounds to zeros, which is the
 * honest reading at this scale.
 */

export const EMPTY = "—";

/** The one unit every statement table is in. */
export const AMOUNT_UNIT = "$ Mn";

const MILLION = 1_000_000;

function group(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** A statement amount (whole dollars) in $ Mn. */
export function formatAmount(dollars: number | null | undefined): string {
  if (dollars == null || !Number.isFinite(dollars)) return EMPTY;
  const rounded = Math.round(dollars / MILLION);
  // -0 prints as "-0"; a rounded-away figure is just zero.
  return group(rounded === 0 ? 0 : rounded, 0);
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
  const { value, unit } = compactDollars(dollars);
  return unit ? `${value}${unit}` : value;
}

/** Share counts: "14.8B", "312M". */
export function formatShares(count: number | null | undefined): string {
  const { value, unit } = compactShares(count);
  return unit ? `${value}${unit}` : value;
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

/* ── Header stats ──────────────────────────────────────────────────────
 * A stat is a number plus its unit, kept apart so the unit can be set in
 * a quieter weight: what makes screener's stat block scannable is that
 * the eye lands on "16,78,172" and not on "Cr.". Every stat formatter
 * below returns the pair; the grid renders the unit dimmed.
 */

export interface StatValue {
  value: string;
  unit?: string;
}

export const EMPTY_STAT: StatValue = { value: EMPTY };

function compactDollars(dollars: number | null | undefined): StatValue {
  if (dollars == null || !Number.isFinite(dollars)) return EMPTY_STAT;
  const abs = Math.abs(dollars);
  const sign = dollars < 0 ? "-" : "";
  if (abs >= 1e12) return { value: `${sign}$${(abs / 1e12).toFixed(2)}`, unit: "T" };
  if (abs >= 1e9) return { value: `${sign}$${(abs / 1e9).toFixed(1)}`, unit: "B" };
  if (abs >= 1e6) return { value: `${sign}$${(abs / 1e6).toFixed(0)}`, unit: "M" };
  return { value: `${sign}$${group(abs, 0)}` };
}

function compactShares(count: number | null | undefined): StatValue {
  if (count == null || !Number.isFinite(count)) return EMPTY_STAT;
  if (count >= 1e9) return { value: (count / 1e9).toFixed(1), unit: "B" };
  if (count >= 1e6) return { value: (count / 1e6).toFixed(0), unit: "M" };
  return { value: group(count, 0) };
}

/** "$3.56" + "T" — a big dollar figure for a stat row. */
export function statCompactDollars(dollars: number | null | undefined): StatValue {
  return compactDollars(dollars);
}

/** "14.8" + "B" — a share count for a stat row. */
export function statShares(count: number | null | undefined): StatValue {
  return compactShares(count);
}

/** "10.3" + "%". */
export function statPercent(value: number | null | undefined, decimals = 1): StatValue {
  if (value == null || !Number.isFinite(value)) return EMPTY_STAT;
  return { value: group(Number(value.toFixed(decimals)), decimals), unit: "%" };
}

/** "22.5" — a bare multiple carries no unit. */
export function statMultiple(value: number | null | undefined): StatValue {
  return value == null || !Number.isFinite(value)
    ? EMPTY_STAT
    : { value: group(value, 1) };
}

/** "$1,240.00" — a price carries its currency, not a suffix. */
export function statPrice(price: number | null | undefined): StatValue {
  const text = formatPrice(price);
  return text === EMPTY ? EMPTY_STAT : { value: text };
}

/** "$6.08" — a per-share dollar figure. */
export function statPerShare(value: number | null | undefined): StatValue {
  if (value == null || !Number.isFinite(value)) return EMPTY_STAT;
  return { value: `$${group(value, 2)}` };
}
