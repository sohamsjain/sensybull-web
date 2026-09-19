import type { CompanySearchResult } from "@/types/api";

/**
 * Where a company name goes when clicked: its financials page, in a new tab.
 *
 * The rule is the same everywhere a name appears — watchlist rows, the
 * conversation header, feed rows, search results — so it lives in one place.
 * A new tab always: the reader is in the middle of a list or a thread, and
 * the financials page is a reference they consult beside it, not a step
 * away from it.
 */
export function fundamentalsHref(ticker: string): string {
  return `/company/${encodeURIComponent(ticker)}`;
}

/** Anchor props for a link that opens in a new tab. */
export const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Open a company's financials in a new tab from a non-anchor control. */
export function openFundamentals(ticker: string): void {
  window.open(fundamentalsHref(ticker), "_blank", "noopener,noreferrer");
}

/**
 * Where a search result goes: its financials when it has them, otherwise
 * its filing history on the watchlist.
 */
export function companyHref(result: CompanySearchResult): string {
  return result.has_fundamentals !== false && result.ticker
    ? fundamentalsHref(result.ticker)
    : `/watchlist?c=${result.id}`;
}

/** Anchor props for a search result: financials open in a new tab. */
export function companyLinkProps(
  result: CompanySearchResult
): { href: string } & Partial<typeof NEW_TAB> {
  const href = companyHref(result);
  return href.startsWith("/company/") ? { href, ...NEW_TAB } : { href };
}
