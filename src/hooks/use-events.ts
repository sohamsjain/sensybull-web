"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FilingEvent } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import type { Watchlist } from "@/types/api";
import { api } from "@/lib/api-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { getTokens } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

interface UseEventsOptions {
  significanceFilter: Set<string>;
  eventTypeFilter: Set<string>;
  search: string;
  selectedWatchlist: Watchlist | null;
}

export function useEvents({
  significanceFilter,
  eventTypeFilter,
  search,
  selectedWatchlist,
}: UseEventsOptions) {
  const { user } = useAuth();
  const [events, setEvents] = useState<FilingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [connected, setConnected] = useState(false);
  const pageRef = useRef(1);

  // Fetch history from REST API
  useEffect(() => {
    setLoading(true);
    setEvents([]);
    pageRef.current = 1;

    const endpoint =
      user && selectedWatchlist ? "/events/" : "/events/all";

    api<PaginatedEvents>(`${endpoint}?page=1&per_page=50`)
      .then((data) => {
        setEvents(data.events || []);
        setHasMore((data.events?.length || 0) < data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, selectedWatchlist]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    pageRef.current += 1;
    const endpoint =
      user && selectedWatchlist ? "/events/" : "/events/all";
    try {
      const data = await api<PaginatedEvents>(
        `${endpoint}?page=${pageRef.current}&per_page=50`
      );
      setEvents((prev) => [...prev, ...(data.events || [])]);
      setHasMore(
        events.length + (data.events?.length || 0) < data.total
      );
    } catch {}
    setLoading(false);
  }, [loading, user, selectedWatchlist, events.length]);

  // WebSocket for live events
  useEffect(() => {
    const { access } = getTokens();
    const socket = connectSocket(access);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("filing_event", (event: FilingEvent) => {
      setEvents((prev) => {
        if (prev.some((e) => e.edgar_id === event.edgar_id)) return prev;
        return [event, ...prev];
      });
    });

    return () => disconnectSocket();
  }, [user]);

  // Client-side filtering
  const filtered = events.filter((e) => {
    const sig = e.briefing?.significance || "Medium";
    if (!significanceFilter.has(sig)) return false;

    if (eventTypeFilter.size > 0) {
      if (!e.event_types?.some((t) => eventTypeFilter.has(t))) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      if (
        !e.ticker?.toLowerCase().includes(q) &&
        !e.company_name?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (selectedWatchlist) {
      const tickers = new Set(
        selectedWatchlist.companies?.map((c) => c.ticker?.toUpperCase())
      );
      if (!tickers.has(e.ticker?.toUpperCase() ?? "")) return false;
    }

    return true;
  });

  return { events: filtered, allEvents: events, loading, hasMore, loadMore, connected };
}
