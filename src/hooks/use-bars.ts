"use client";

import { useState, useEffect } from "react";
import type { BarsResponse } from "@/types/api";
import { api } from "@/lib/api-client";

export type BarsLookback = "1M" | "3M" | "6M" | "1Y";

/** Daily OHLCV bars for a company's price chart (backend proxies Alpaca). */
export function useBars(companyId: string | null, lookback: BarsLookback) {
  const [data, setData] = useState<BarsResponse | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading"
  );

  // Reset when the query changes (adjust-during-render, same pattern as
  // CompanySheet) so the skeleton shows without a setState-in-effect
  const key = companyId ? `${companyId}:${lookback}` : null;
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (key && loadedFor !== key) {
    setLoadedFor(key);
    setData(null);
    setState("loading");
  }

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    api<BarsResponse>(
      `/companies/${companyId}/bars?timeframe=1D&lookback=${lookback}`
    )
      .then((response) => {
        if (cancelled) return;
        setData(response);
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

  return { bars: data?.bars ?? [], state };
}
