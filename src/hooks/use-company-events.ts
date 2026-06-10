"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FilingEvent } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import { api } from "@/lib/api-client";
import { getSocket } from "@/lib/socket";

interface CompanyEventsState {
  companyId: string | null;
  events: FilingEvent[]; // newest first
  hasMore: boolean;
}

/**
 * One company's filing history for the conversation view, newest first.
 * Live events arrive via the socket already opened by useChats.
 */
export function useCompanyEvents(companyId: string | null) {
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
    if (!companyId) return;
    const socket = getSocket();
    if (!socket) return;

    const handler = (event: FilingEvent) => {
      if (event.company_id !== companyId) return;
      setState((prev) => {
        if (prev.companyId !== companyId) return prev;
        if (prev.events.some((e) => e.edgar_id === event.edgar_id)) return prev;
        return { ...prev, events: [event, ...prev.events] };
      });
    };
    socket.on("filing_event", handler);
    return () => {
      socket.off("filing_event", handler);
    };
  }, [companyId]);

  // While switching companies, show the loading state rather than the
  // previous chat's messages.
  const current = state.companyId === companyId ? state : null;

  return {
    events: current?.events ?? [],
    loading: (!!companyId && !current) || loadingMore,
    hasMore: current?.hasMore ?? false,
    loadEarlier,
  };
}
