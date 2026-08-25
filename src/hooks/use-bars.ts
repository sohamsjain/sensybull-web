"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Bar, BarsResponse } from "@/types/api";
import { api } from "@/lib/api-client";

export type BarsLookback = "1M" | "3M" | "6M" | "1Y";

/** History arrives a year at a time, however small the opening window is. */
const PAGE_LOOKBACK = "1Y";

/**
 * Daily OHLCV bars for a company's price chart (backend proxies Alpaca).
 *
 * `lookback` is the opening window, not a ceiling: `loadOlder()` walks
 * backwards from the earliest bar held, so panning left keeps finding
 * history until the company runs out of it.
 */
export function useBars(companyId: string | null, lookback: BarsLookback) {
  const [bars, setBars] = useState<Bar[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading"
  );
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  // Reset when the query changes (adjust-during-render, same pattern as
  // CompanySheet) so the skeleton shows without a setState-in-effect
  const key = companyId ? `${companyId}:${lookback}` : null;
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (key && loadedFor !== key) {
    setLoadedFor(key);
    setBars([]);
    setState("loading");
    setLoadingOlder(false);
    setExhausted(false);
  }

  // A page in flight when the company changes must not land on the new one
  const keyRef = useRef(key);
  const pendingRef = useRef(false);
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    api<BarsResponse>(
      `/companies/${companyId}/bars?timeframe=1D&lookback=${lookback}`
    )
      .then((response) => {
        if (cancelled) return;
        setBars(response.bars);
        setState(response.bars.length > 0 ? "ready" : "unavailable");
      })
      .catch(() => {
        // 422 no_ticker / 503 Alpaca down / unknown symbol
        if (!cancelled) setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, lookback]);

  const loadOlder = useCallback(() => {
    if (!companyId || pendingRef.current || exhausted || state !== "ready") return;
    const oldest = bars[0]?.t;
    if (!oldest) return;

    const requestedFor = keyRef.current;
    pendingRef.current = true;
    setLoadingOlder(true);
    api<BarsResponse>(
      `/companies/${companyId}/bars?timeframe=1D&lookback=${PAGE_LOOKBACK}` +
        `&end=${encodeURIComponent(oldest)}`
    )
      .then((response) => {
        if (keyRef.current !== requestedFor) return;
        // The window is end-exclusive, but a bar on the boundary would
        // duplicate a candle and break the chart's ordering — drop it.
        const older = response.bars.filter((bar) => bar.t < oldest);
        if (older.length === 0) setExhausted(true);
        else setBars((current) => [...older, ...current]);
      })
      .catch(() => {
        // Nothing older to be had, or the proxy is down: stop asking.
        if (keyRef.current === requestedFor) setExhausted(true);
      })
      .finally(() => {
        pendingRef.current = false;
        if (keyRef.current === requestedFor) setLoadingOlder(false);
      });
  }, [companyId, bars, exhausted, state]);

  return { bars, state, loadOlder, loadingOlder, exhausted };
}
