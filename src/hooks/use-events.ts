"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { FilingEvent, PriceReactions } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/context/socket-provider";
import {
  filtersToQuery,
  matchesFeedFilters,
  type FeedFilters,
  type FeedScope,
} from "@/lib/feed-filters";

export type { FeedScope };
export { matchesSearch } from "@/lib/feed-filters";

const PAGE_SIZE = 50;
const EMPTY: FilingEvent[] = [];
/** Typing in search waits this long before it becomes a request. */
const SEARCH_DEBOUNCE_MS = 300;

interface UseEventsOptions {
  /**
   * Every feed filter. Applied by the API (so a page is a page of matches)
   * and, for live socket events, by `matchesFeedFilters`.
   */
  filters: FeedFilters;
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

/** Debounce the search text only; every other filter applies at once. */
function useAppliedFilters(filters: FeedFilters): FeedFilters {
  const [q, setQ] = useState(filters.q);
  useEffect(() => {
    if (filters.q === q) return;
    // Clearing the box is instant; typing waits for a pause
    const delay = filters.q.trim() ? SEARCH_DEBOUNCE_MS : 0;
    const t = setTimeout(() => setQ(filters.q), delay);
    return () => clearTimeout(t);
  }, [filters.q, q]);
  return useMemo(() => ({ ...filters, q }), [filters, q]);
}

/** The API's answer for one list (stream + filters), grown by paging and
 *  by live arrivals. */
interface Answer {
  key: string;
  scope: FeedScope;
  events: FilingEvent[];
  total: number;
  page: number;
  hasMore: boolean;
  error: ApiError | null;
}

export function useEvents({
  filters,
  scope = "all",
  followedCompanyIds = null,
}: UseEventsOptions) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const applied = useAppliedFilters(filters);
  const path = scope === "mine" ? "/events/" : "/events/all";
  const query = filtersToQuery(applied).toString();
  // Identifies a list: a response for any other key (a filter changed
  // while it was in flight) is dropped.
  const listKey = `${path}?${query}`;

  // The followed set and the filters change without the socket needing to
  // resubscribe; refs keep them out of the listener effect's deps.
  const followedRef = useRef(followedCompanyIds);
  const filtersRef = useRef(applied);
  useEffect(() => {
    followedRef.current = followedCompanyIds;
    filtersRef.current = applied;
  }, [followedCompanyIds, applied]);

  const url = useCallback(
    (page: number) =>
      `${path}?${query ? `${query}&` : ""}page=${page}&per_page=${PAGE_SIZE}`,
    [path, query]
  );

  // First page. Refetches whenever the scope or any applied filter changes
  // (and on retry). State is only written when the answer lands.
  useEffect(() => {
    if (!scope) return;
    let cancelled = false;
    const key = listKey;
    api<PaginatedEvents>(url(1))
      .then((data) => {
        if (cancelled) return;
        const rows = data.events || [];
        setAnswer({
          key,
          scope,
          events: rows,
          total: data.total,
          page: 1,
          hasMore: data.has_more ?? rows.length < data.total,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setAnswer({
          key,
          scope,
          events: [],
          total: 0,
          page: 1,
          hasMore: false,
          error: err instanceof ApiError ? err : new ApiError(String(err), 0),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user, scope, listKey, url, attempt]);

  // Another stream's rows are simply wrong, so they never show under this
  // one; the same stream's last answer stays up while a new filter loads.
  const current = answer && answer.scope === scope ? answer : null;
  // Until the scope settles there is nothing to show yet, not "nothing filed"
  const loading = !current;
  const refreshing = !!current && current.key !== listKey;

  const loadMore = useCallback(async () => {
    if (!current || refreshing || loadingMore || !current.hasMore) return;
    const key = current.key;
    const page = current.page + 1;
    setLoadingMore(true);
    try {
      const data = await api<PaginatedEvents>(url(page));
      const rows = data.events || [];
      setAnswer((prev) => {
        if (!prev || prev.key !== key) return prev;
        // A live arrival may already sit in the list; offsets shift under
        // new events, so skip anything already shown.
        const seen = new Set(prev.events.map((e) => e.edgar_id));
        return {
          ...prev,
          events: [...prev.events, ...rows.filter((e) => !seen.has(e.edgar_id))],
          total: data.total,
          page,
          hasMore: data.has_more ?? page * PAGE_SIZE < data.total,
        };
      });
    } catch {
      // The sentinel's visible "Load earlier events" button stays as the retry
    } finally {
      setLoadingMore(false);
    }
  }, [current, refreshing, loadingMore, url]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Live events from the shared session socket (owned by SocketProvider).
  useEffect(() => {
    if (!socket || !scope) return;
    const key = orderKeyFor(scope);

    const onFiling = (event: FilingEvent) => {
      // The socket carries the whole public stream; in "mine" scope only
      // the companies the reader follows belong in the list, and in either
      // scope only what the active filters would have returned.
      if (scope === "mine" && !isFollowed(event, followedRef.current)) return;
      if (!matchesFeedFilters(event, filtersRef.current)) return;
      setAnswer((prev) => {
        if (!prev || prev.scope !== scope) return prev;
        const events = insertByReceivedOrder(prev.events, event, key);
        return events === prev.events
          ? prev
          : { ...prev, events, total: prev.total + 1 };
      });
    };

    // An existing event gained data (e.g. a press release backfilled with
    // its SEC filing link) — replace in place, ignore if not loaded
    const onFilingUpdate = (event: FilingEvent) => {
      setAnswer((prev) =>
        prev && prev.events.some((e) => e.id === event.id)
          ? {
              ...prev,
              events: prev.events.map((e) => (e.id === event.id ? event : e)),
            }
          : prev
      );
    };

    // Reactions are measured minutes-to-days after the filing arrives;
    // merge them into already-rendered events as they complete. (An event
    // that only now qualifies for a "moved" filter shows up on the next
    // fetch, not live — it wasn't in the list to update.)
    const onReaction = (update: PriceReactionUpdate) => {
      setAnswer((prev) =>
        prev && prev.events.some((e) => e.id === update.filing_event_id)
          ? {
              ...prev,
              events: prev.events.map((e) =>
                e.id === update.filing_event_id
                  ? {
                      ...e,
                      price_reactions: update.price_reactions,
                      explosive: update.explosive,
                    }
                  : e
              ),
            }
          : prev
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

  return {
    events: current?.events ?? EMPTY,
    total: current?.total ?? 0,
    loading,
    refreshing,
    loadingMore,
    hasMore: current?.hasMore ?? false,
    loadMore,
    error: current && !refreshing ? current.error : null,
    retry,
    connected,
    /** The search text the list currently reflects (debounced). */
    appliedQuery: applied.q,
  };
}
