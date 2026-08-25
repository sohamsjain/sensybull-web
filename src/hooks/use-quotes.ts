"use client";

import { useEffect, useMemo, useState } from "react";

import type { Quote } from "@/types/api";
import { api } from "@/lib/api-client";

/** How often prices refresh (the backend caches each ticker for 60s). */
const POLL_MS = 60_000;

/** The endpoint's own cap — asking for more would silently drop the tail. */
const MAX_IDS = 120;

interface QuotesResponse {
  quotes: Record<string, Quote>;
}

/**
 * Prices for a screenful of companies, in one request.
 *
 * The feed and the watchlist both show a price on every row; asking per
 * company would mean dozens of requests per screen. Ids are sorted and
 * joined into a stable key so scrolling in new rows refetches, but a
 * re-render with the same set doesn't.
 *
 * Polls only while the tab is visible, and returns an empty map for signed
 * out readers — the endpoint needs a session, and a public feed simply
 * shows no prices.
 */
export function useQuotes(companyIds: string[], enabled = true) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  const key = useMemo(
    () => [...new Set(companyIds.filter(Boolean))].sort().slice(0, MAX_IDS).join(","),
    [companyIds]
  );

  useEffect(() => {
    if (!enabled || !key) return;
    let cancelled = false;

    const load = () => {
      if (document.visibilityState === "hidden") return;
      api<QuotesResponse>(`/companies/quotes?ids=${encodeURIComponent(key)}`)
        .then((response) => {
          if (cancelled) return;
          // Merge rather than replace: rows scrolled out of the current
          // request keep the price they were last shown with.
          setQuotes((prev) => ({ ...prev, ...(response.quotes || {}) }));
        })
        .catch(() => {
          // Prices are decoration on a row of filings — never surface an error
        });
    };

    load();
    const timer = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [key, enabled]);

  return quotes;
}
