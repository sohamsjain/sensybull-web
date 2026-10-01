"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createLocalPref } from "@/lib/local-pref";
import type { CompanySearchResult } from "@/types/api";

/**
 * The companies a reader has opened from search, newest first. Kept in this
 * browser only (a convenience, not account state), and cleared on sign-out
 * so a shared machine doesn't hand one reader's lookups to the next.
 */
export type SearchHistoryEntry = Pick<
  CompanySearchResult,
  "id" | "name" | "ticker" | "has_fundamentals"
>;

export const SEARCH_HISTORY_MAX = 10;

const store = createLocalPref("sensybull:search-history", "[]");

/** Put `entry` first, drop its older copy, cap the list. Pure. */
export function pushHistory(
  list: SearchHistoryEntry[],
  entry: SearchHistoryEntry,
  max = SEARCH_HISTORY_MAX
): SearchHistoryEntry[] {
  return [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, max);
}

/** Parse the stored value; anything malformed reads as no history. */
export function parseHistory(raw: string): SearchHistoryEntry[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (e): e is SearchHistoryEntry =>
        !!e &&
        typeof e.id === "string" &&
        typeof e.ticker === "string" &&
        e.ticker !== "" &&
        typeof e.name === "string"
    );
  } catch {
    return [];
  }
}

/** Remember a search result the reader just opened. */
export function recordSearch(result: CompanySearchResult): void {
  const entry: SearchHistoryEntry = {
    id: result.id,
    name: result.name,
    ticker: result.ticker,
    has_fundamentals: result.has_fundamentals,
  };
  store.set(JSON.stringify(pushHistory(parseHistory(store.get()), entry)));
}

export function clearSearchHistory(): void {
  store.set("[]");
}

/** The reader's recent searches; empty during SSR and before hydration. */
export function useSearchHistory(): SearchHistoryEntry[] {
  const raw = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  return useMemo(() => parseHistory(raw), [raw]);
}
