"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FilingEvent, PriceReactions } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/context/socket-provider";
import { isImportant } from "@/lib/event-actions";
import { toCurrentCategory } from "@/lib/event-categories";

interface UseEventsOptions {
  /** "important" keeps only market-moving updates; "all" keeps everything. */
  filter: "all" | "important";
  /** Event-type category (from GET /events/types); null keeps every type. */
  eventType?: string | null;
  search: string;
}

/**
 * True when the event belongs to the given category.
 *
 * Events classified before the taxonomy shipped carry the old labels, so
 * both sides are read through toCurrentCategory() — a filter on "Strategic
 * Transactions" still finds the historical Acquisitions.
 */
export function matchesEventType(e: FilingEvent, type: string): boolean {
  const target = toCurrentCategory(type);
  if (e.event_types?.some((t) => toCurrentCategory(t) === target)) return true;
  const primary = e.briefing?.primary_event_type;
  return !!primary && toCurrentCategory(primary) === target;
}

interface PriceReactionUpdate {
  filing_event_id: string;
  ticker: string | null;
  price_reactions: PriceReactions;
  explosive: boolean;
}

const receivedOrderKey = (e: FilingEvent) =>
  e.received_at || e.filing_date || "";

/**
 * Merge a socket-delivered filing into the feed in received-order position,
 * mirroring /events/all (created_at desc). The shared /feed socket also
 * replays the signed-in user's watchlist history on connect; blindly
 * prepending those would pin old watchlist filings to the top, upranking
 * them above newer events. A genuinely new filing carries the newest
 * received_at and still lands first; an older replayed one slots into its
 * true chronological place. Duplicates (by edgar_id) are ignored.
 */
export function insertByReceivedOrder(
  list: FilingEvent[],
  event: FilingEvent
): FilingEvent[] {
  if (list.some((e) => e.edgar_id === event.edgar_id)) return list;
  const ts = receivedOrderKey(event);
  const idx = list.findIndex((e) => receivedOrderKey(e) < ts);
  return idx === -1
    ? [...list, event]
    : [...list.slice(0, idx), event, ...list.slice(idx)];
}

export function useEvents({ filter, eventType = null, search }: UseEventsOptions) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [events, setEvents] = useState<FilingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  // Fetch history from REST API — always the public stream, in the order
  // events were received, so pages line up with the live socket feed
  useEffect(() => {
    setLoading(true);
    setEvents([]);
    pageRef.current = 1;

    api<PaginatedEvents>(`/events/all?page=1&per_page=50`)
      .then((data) => {
        setEvents(data.events || []);
        setHasMore((data.events?.length || 0) < data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    pageRef.current += 1;
    try {
      const data = await api<PaginatedEvents>(
        `/events/all?page=${pageRef.current}&per_page=50`
      );
      setEvents((prev) => {
        // A replayed watchlist filing may already sit in the list at its
        // chronological spot; skip it so a later page doesn't duplicate it.
        const seen = new Set(prev.map((e) => e.edgar_id));
        const incoming = (data.events || []).filter(
          (e) => !seen.has(e.edgar_id)
        );
        return [...prev, ...incoming];
      });
      setHasMore(
        events.length + (data.events?.length || 0) < data.total
      );
    } catch {}
    setLoading(false);
  }, [loading, events.length]);

  // Live events from the shared session socket (owned by SocketProvider).
  useEffect(() => {
    if (!socket) return;

    const onFiling = (event: FilingEvent) => {
      setEvents((prev) => insertByReceivedOrder(prev, event));
    };

    // An existing event gained data (e.g. a press release backfilled with
    // its SEC filing link) — replace in place, ignore if not loaded
    const onFilingUpdate = (event: FilingEvent) => {
      setEvents((prev) =>
        prev.some((e) => e.id === event.id)
          ? prev.map((e) => (e.id === event.id ? event : e))
          : prev
      );
    };

    // Reactions are measured minutes-to-days after the filing arrives;
    // merge them into already-rendered events as they complete
    const onReaction = (update: PriceReactionUpdate) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === update.filing_event_id
            ? {
                ...e,
                price_reactions: update.price_reactions,
                explosive: update.explosive,
              }
            : e
        )
      );
    };

    socket.on("filing_event", onFiling);
    socket.on("filing_event_update", onFilingUpdate);
    socket.on("price_reaction", onReaction);
    return () => {
      socket.off("filing_event", onFiling);
      socket.off("filing_event_update", onFilingUpdate);
      socket.off("price_reaction", onReaction);
    };
  }, [socket]);

  // Client-side filtering
  const filtered = events.filter((e) => {
    if (filter === "important" && !isImportant(e)) return false;
    if (eventType && !matchesEventType(e, eventType)) return false;

    if (search) {
      const q = search.toLowerCase();
      if (
        !e.ticker?.toLowerCase().includes(q) &&
        !e.company_name?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  return { events: filtered, allEvents: events, loading, hasMore, loadMore, connected };
}
