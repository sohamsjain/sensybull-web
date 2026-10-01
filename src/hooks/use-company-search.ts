"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  fetchCompanies,
  lookupLocal,
  narrowResults,
  normalizeQuery,
  searchDelay,
} from "@/lib/company-search";
import type { CompanySearchResult } from "@/types/api";

export type CompanySearchStatus = "idle" | "loading" | "ready" | "offline";

/**
 * Typeahead results for `query`, from `src/lib/company-search.ts`.
 *
 * Everything shown is derived from the *current* query on every render, so
 * an answer that lands after the reader typed on (or erased the box) can
 * only fill the cache — it can never put a stale list on screen.
 *
 * Debounce is adaptive: the first keystroke after a pause searches at once
 * (leading edge), keystrokes inside a fast burst wait for the typing to
 * pause, and a query the cache can already answer exactly never waits or
 * fetches at all.
 */
export function useCompanySearch(query: string): {
  results: CompanySearchResult[];
  status: CompanySearchStatus;
} {
  const key = normalizeQuery(query);
  // Bumped when an answer lands, so the render re-reads the cache.
  const [, setLanded] = useState(0);
  const [failed, setFailed] = useState<{ key: string; offline: boolean } | null>(null);
  // The last list the network gave us. While a query with nothing cached is
  // in flight, its rows that still match are shown — never rows that don't,
  // so the list can't read as belonging to an earlier query.
  const [lastAnswer, setLastAnswer] = useState<CompanySearchResult[]>([]);
  const lastKeyAt = useRef(0);

  const local = lookupLocal(key);
  const exact = local?.exact ?? false;

  useEffect(() => {
    const now = performance.now();
    const gap = now - lastKeyAt.current;
    lastKeyAt.current = now;
    if (!key || exact) return;

    const timer = setTimeout(() => {
      fetchCompanies(key).then(
        (results) => {
          setLastAnswer(results);
          setLanded((n) => n + 1);
        },
        (err) => {
          setFailed({
            key,
            offline: err instanceof ApiError && err.isOffline,
          });
        }
      );
    }, searchDelay(gap));
    return () => clearTimeout(timer);
  }, [key, exact]);

  if (!key) return { results: [], status: "idle" };
  if (local?.exact) return { results: local.results, status: "ready" };
  if (failed?.key === key) {
    return { results: [], status: failed.offline ? "offline" : "ready" };
  }
  return {
    results: local?.results ?? narrowResults(lastAnswer, key),
    status: "loading",
  };
}
