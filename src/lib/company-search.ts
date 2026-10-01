import { publicApi } from "@/lib/api-client";
import type { CompanySearchResponse, CompanySearchResult } from "@/types/api";

/**
 * Company typeahead, shared by every search box in the app (navbar, ⌘K,
 * the watchlist's search home, /company).
 *
 * Speed comes from not waiting on the network when we don't have to:
 *
 * - **Cache.** Every answer is kept for the session, keyed by query, so
 *   backspacing or retyping is instant and every box shares what any box
 *   has already learned.
 * - **Narrowing.** The API matches a substring of ticker or name, so the
 *   matches for "appl" are a subset of the matches for "app". While "appl"
 *   is in flight, the cached "app" answer is filtered and re-ranked here
 *   with the API's own rules and shown immediately.
 * - **Completeness.** When the cached prefix answer came back with fewer
 *   rows than the limit, it was *every* match — so the narrowed list is the
 *   exact answer and no request is made at all.
 *
 * Ranking mirrors `_search_query()` in sensybull-api
 * `services/api/app/routes/companies.py`: exact ticker, then ticker prefix,
 * then the rest; market cap descending (nulls last); then name.
 */

/** Rows fetched per query. Fixed, so every box can reuse every answer. */
export const SEARCH_LIMIT = 8;

/** A keystroke this long after the last one starts a burst: search at once. */
export const BURST_GAP_MS = 250;
/** Inside a burst, wait this long for the typing to pause. */
export const TRAILING_MS = 110;

const MAX_ENTRIES = 200;
const cache = new Map<string, CompanySearchResult[]>();
const inflight = new Map<string, Promise<CompanySearchResult[]>>();

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

/** How long to wait before searching, given the gap since the last keystroke. */
export function searchDelay(sinceLastKeyMs: number): number {
  return sinceLastKeyMs >= BURST_GAP_MS ? 0 : TRAILING_MS;
}

// `%` and `_` are wildcards to the API's ILIKE, so a query containing one
// can't be answered by a plain substring test here.
const HAS_WILDCARD = /[%_]/;

function matches(r: CompanySearchResult, key: string): boolean {
  return (
    (r.ticker ?? "").toLowerCase().includes(key) ||
    (r.name ?? "").toLowerCase().includes(key)
  );
}

function tier(r: CompanySearchResult, key: string): number {
  const t = (r.ticker ?? "").toLowerCase();
  if (t === key) return 0;
  if (t.startsWith(key)) return 1;
  return 2;
}

/** Order rows the way the API would for `key`. Pure. */
export function rankResults(
  rows: CompanySearchResult[],
  key: string
): CompanySearchResult[] {
  return [...rows].sort((a, b) => {
    const byTier = tier(a, key) - tier(b, key);
    if (byTier) return byTier;
    const ca = a.market_cap ?? -Infinity;
    const cb = b.market_cap ?? -Infinity;
    if (ca !== cb) return cb - ca;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

/** The rows of `rows` that match `query`, ranked for it. Pure. */
export function narrowResults(
  rows: CompanySearchResult[],
  query: string
): CompanySearchResult[] {
  const key = normalizeQuery(query);
  if (!key || HAS_WILDCARD.test(key)) return [];
  return rankResults(rows.filter((r) => matches(r, key)), key).slice(0, SEARCH_LIMIT);
}

/**
 * Answer `query` from what is already known. `exact` means the list is what
 * the API would return; otherwise it is a provisional subset to show while
 * the request is in flight. Null when nothing cached bears on the query.
 */
export function lookupLocal(
  query: string,
  known: ReadonlyMap<string, CompanySearchResult[]> = cache
): { results: CompanySearchResult[]; exact: boolean } | null {
  const key = normalizeQuery(query);
  if (!key) return null;
  const hit = known.get(key);
  if (hit) return { results: hit, exact: true };
  if (HAS_WILDCARD.test(key)) return null;
  for (let i = key.length - 1; i > 0; i--) {
    const prefix = known.get(key.slice(0, i));
    if (!prefix) continue;
    return {
      results: narrowResults(prefix, key),
      exact: prefix.length < SEARCH_LIMIT,
    };
  }
  return null;
}

/** Fetch (or reuse) the API's answer for `query`. Concurrent calls share one request. */
export function fetchCompanies(query: string): Promise<CompanySearchResult[]> {
  const key = normalizeQuery(query);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(key);
  if (pending) return pending;

  // publicApi: a CORS-simple GET, so no preflight round trip per query.
  const request = publicApi<CompanySearchResponse>(
    `/companies/search?q=${encodeURIComponent(key)}&limit=${SEARCH_LIMIT}`
  )
    .then((data) => {
      const results = data.results || [];
      if (cache.size >= MAX_ENTRIES) {
        // Map iterates in insertion order: drop the oldest answer.
        cache.delete(cache.keys().next().value as string);
      }
      cache.set(key, results);
      return results;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}
