"use client";

import { useState, useEffect } from "react";
import type { MoversResponse } from "@/types/api";
import { api } from "@/lib/api-client";

const REFRESH_MS = 120_000; // matches the backend's 2-minute cache TTL

/** Event-driven top gainers/losers (companies that filed in the last 7 days). */
export function useMovers(limit = 5) {
  const [movers, setMovers] = useState<MoversResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMovers = () => {
      api<MoversResponse>(`/movers?limit=${limit}`)
        .then((data) => {
          if (!cancelled) setMovers(data);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchMovers();
    const timer = setInterval(fetchMovers, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [limit]);

  return { movers, loading };
}
