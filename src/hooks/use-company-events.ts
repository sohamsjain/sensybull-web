"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import type { FilingEvent } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import { api } from "@/lib/api-client";

interface CompanyEventsState {
  companyId: string | null;
  events: FilingEvent[]; // newest first
  hasMore: boolean;
}

// Session-lifetime cache so revisiting a chat paints instantly from the last
// known history while a fresh fetch revalidates in the background.
const historyCache = new Map<string, CompanyEventsState>();

/**
 * One company's filing history for the conversation view, newest first.
 * Pass the live socket from useChats so listeners follow reconnections
 * instead of clinging to a stale instance.
 */
export function useCompanyEvents(companyId: string | null, socket: Socket | null) {
  const [state, setState] = useState<CompanyEventsState>({
    companyId: null,
    events: [],
    hasMore: false,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    pageRef.current = 1;

    api<PaginatedEvents>(`/events/company/${companyId}?page=1&per_page=50`)
      .then((data) => {
        if (cancelled) return;
        setState({
          companyId,
          events: data.events || [],
          hasMore: (data.events?.length || 0) < data.total,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ companyId, events: [], hasMore: false });
      });

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const loadEarlier = useCallback(async () => {
    if (loadingMore || !companyId) return;
    setLoadingMore(true);
    pageRef.current += 1;
    try {
      const data = await api<PaginatedEvents>(
        `/events/company/${companyId}?page=${pageRef.current}&per_page=50`
      );
      setState((prev) => {
        if (prev.companyId !== companyId) return prev;
        const merged = [...prev.events, ...(data.events || [])];
        return { ...prev, events: merged, hasMore: merged.length < data.total };
      });
    } catch {}
    setLoadingMore(false);
  }, [loadingMore, companyId]);

  // Append live events for this company from the shared socket
  useEffect(() => {
    if (!companyId || !socket) return;

    const handler = (event: FilingEvent) => {
      if (event.company_id !== companyId) return;
      setState((prev) => {
        if (prev.companyId !== companyId) return prev;
        if (prev.events.some((e) => e.edgar_id === event.edgar_id)) return prev;
        // Ignore server replays of historical events: anything not newer
        // than the loaded head belongs to pages REST already serves, and
        // prepending it would display an old filing as the latest message.
        const newest = prev.events[0]?.received_at;
        if (newest && (event.received_at || "") <= newest) return prev;
        return { ...prev, events: [event, ...prev.events] };
      });
    };
    socket.on("filing_event", handler);
    return () => {
      socket.off("filing_event", handler);
    };
  }, [companyId, socket]);

  // Keep the cache in sync with whatever was last loaded
  useEffect(() => {
    if (state.companyId) historyCache.set(state.companyId, state);
  }, [state]);

  // While switching companies, paint from cache immediately if we've been
  // here before; otherwise show the loading state — never the previous
  // chat's messages.
  const current =
    state.companyId === companyId
      ? state
      : (companyId && historyCache.get(companyId)) || null;

  return {
    events: current?.events ?? [],
    loading: (!!companyId && !current) || loadingMore,
    hasMore: current?.hasMore ?? false,
    loadEarlier,
  };
}
