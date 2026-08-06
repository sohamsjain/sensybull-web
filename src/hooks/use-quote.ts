"use client";

import { useState, useEffect } from "react";
import type { Quote } from "@/types/api";
import { api } from "@/lib/api-client";

/** How often an open company's price refreshes (backend caches 60s). */
const POLL_MS = 60_000;

/**
 * Last price + day change for one company, polled while the tab is visible.
 *
 * Backgrounded tabs stop polling and refetch on the way back, so a watchlist
 * left open overnight doesn't burn requests on a closed market.
 */
export function useQuote(companyId: string | null) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading"
  );

  // Clear the previous company's price during render (same adjust-during-render
  // pattern as useBars) so the header never shows a stale company's number.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (companyId && loadedFor !== companyId) {
    setLoadedFor(companyId);
    setQuote(null);
    setState("loading");
  }

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    const load = () => {
      if (document.visibilityState === "hidden") return;
      api<Quote>(`/companies/${companyId}/quote`)
        .then((response) => {
          if (cancelled) return;
          setQuote(response);
          setState("ready");
        })
        .catch(() => {
          // 422 no_ticker / 503 market data down / unknown symbol
          if (!cancelled) setState("unavailable");
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
  }, [companyId]);

  return { quote, state };
}
