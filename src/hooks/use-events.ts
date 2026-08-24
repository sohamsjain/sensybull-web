"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FilingEvent, PriceReactions } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/context/socket-provider";
import { isImportant } from "@/lib/event-actions";

/**
 * Whose updates the feed is showing: only the companies you follow
 * (`GET /events/`, auth) or every company that files (`GET /events/all`).
 */
export type FeedScope = "mine" | "all";

interface UseEventsOptions {
  /** "important" keeps only market-moving updates; "all" keeps everything. */
  filter: "all" | "important";
  /** Event-type category (from GET /events/types); null keeps every type. */
  eventType?: string | null;
  search: string;
  /**
   * Whose updates to load. `null` means the scope hasn't been decided yet
   * (it depends on whether the visitor is signed in) — nothing is fetched
   * until it settles, so the reader never sees the wrong stream flash first.
   */
  scope?: FeedScope | null;
  /**
   * Ids of the companies the user follows. In "mine" scope the shared socket
   * still delivers the whole public stream, so live events are filtered
   * against this set. `null` means "not loaded yet".
   */
  followedCompanyIds?: Set<string> | null;
}

/** True when the event carries the given category label. */
export function matchesEventType(e: FilingEvent, type: string): boolean {
  if (e.event_types?.includes(type)) return true;
  return e.briefing?.primary_event_type === type;
}

interface PriceReactionUpdate {
  filing_event_id: string;
  ticker: string | null;
  price_reactions: PriceReactions;
  explosive: boolean;
}

const receivedOrderKey = (e: FilingEvent) =>
  e.received_at || e.filing_date || "";

const filedOrderKey = (e: FilingEvent) => e.filing_date || e.received_at || "";

/**
 * The order the endpoint backing a scope returns: `/events/all` is ordered by
 * receipt (so REST pages line up with the live socket), `/events/` by filing
 * date. Live events have to be slotted in by the same key, or a socket
 * arrival lands somewhere the next REST page disagrees with.
 */
export function orderKeyFor(scope: FeedScope): (e: FilingEvent) => string {
  return scope === "mine" ? filedOrderKey : receivedOrderKey;
}

/**
 * Merge a socket-delivered filing into the feed in the list's own order,
 * mirroring the REST endpoint behind it. The shared /feed socket also
 * replays the signed-in user's watchlist history on connect; blindly
 * prepending those would pin old watchlist filings to the top, upranking
 * them above newer events. A genuinely new filing carries the newest
 * timestamp and still lands first; an older replayed one slots into its
 * true chronological place. Duplicates (by edgar_id) are ignored.
 */
export function insertByReceivedOrder(
  list: FilingEvent[],
  event: FilingEvent,
  key: (e: FilingEvent) => string = receivedOrderKey
): FilingEvent[] {
  if (list.some((e) => e.edgar_id === event.edgar_id)) return list;
  const ts = key(event);
  const idx = list.findIndex((e) => key(e) < ts);
  return idx === -1
    ? [...list, event]
    : [...list.slice(0, idx), event, ...list.slice(idx)];
}

/** Does this event come from a company the reader follows? */
export function isFollowed(
  e: FilingEvent,
  followed: Set<string> | null | undefined
): boolean {
  return !!e.company_id && !!followed?.has(e.company_id);
}

/** Matches the search box against the ticker, the name, and the headline. */
export function matchesSearch(e: FilingEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    !!e.ticker?.toLowerCase().includes(q) ||
    !!e.company_name?.toLowerCase().includes(q) ||
    !!e.briefing?.headline?.toLowerCase().includes(q)
  );
}

export function useEvents({
  filter,
  eventType = null,
  search,
  scope = "all",
  followedCompanyIds = null,
}: UseEventsOptions) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [events, setEvents] = useState<FilingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  const path = scope === "mine" ? "/events/" : "/events/all";

  // The followed set changes as the watchlist loads and as companies are
  // tracked; a ref keeps that out of the socket subscription's deps so a
  // watchlist edit never tears down and rebuilds the listeners.
  const followedRef = useRef(followedCompanyIds);
  useEffect(() => {
    followedRef.current = followedCompanyIds;
  }, [followedCompanyIds]);

  // Fetch history from the REST API. Refetches when the scope changes — the
  // two streams come from different endpoints in different orders.
  useEffect(() => {
    if (!scope) return;
    setLoading(true);
    setEvents([]);
    pageRef.current = 1;

    let cancelled = false;
    api<PaginatedEvents>(`${path}?page=1&per_page=50`)
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events || []);
        setHasMore((data.events?.length || 0) < data.total);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, scope, path]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    pageRef.current += 1;
    try {
      const data = await api<PaginatedEvents>(
        `${path}?page=${pageRef.current}&per_page=50`
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
  }, [loading, events.length, path]);

  // Live events from the shared session socket (owned by SocketProvider).
  useEffect(() => {
    if (!socket || !scope) return;
    const key = orderKeyFor(scope);

    const onFiling = (event: FilingEvent) => {
      // The socket carries the whole public stream; in "mine" scope only
      // the companies the reader follows belong in the list.
      if (scope === "mine" && !isFollowed(event, followedRef.current)) return;
      setEvents((prev) => insertByReceivedOrder(prev, event, key));
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
  }, [socket, scope]);

  // Client-side filtering
  const filtered = events.filter((e) => {
    if (filter === "important" && !isImportant(e)) return false;
    if (eventType && !matchesEventType(e, eventType)) return false;
    if (!matchesSearch(e, search)) return false;
    return true;
  });

  return { events: filtered, allEvents: events, loading, hasMore, loadMore, connected };
}
