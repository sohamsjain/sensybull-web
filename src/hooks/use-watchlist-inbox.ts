"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WatchlistEntry, WatchlistInboxResponse, EventPreview, ReadStateResponse, PaginatedWatchlists } from "@/types/api";
import type { FilingEvent } from "@/types/events";
import { api } from "@/lib/api-client";
import { filedPhrase } from "@/lib/forms";
import { addToDefaultWatchlist } from "@/lib/default-watchlist";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/context/socket-provider";

/** Inbox order: unread companies first, then most recent activity. */
function sortEntries(list: WatchlistEntry[]): WatchlistEntry[] {
  return [...list].sort((a, b) => {
    const aUnread = a.unread_count > 0 ? 0 : 1;
    const bUnread = b.unread_count > 0 ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    return (b.last_activity_at || "").localeCompare(a.last_activity_at || "");
  });
}

function toPreview(event: FilingEvent): EventPreview {
  return {
    id: event.id,
    headline:
      event.briefing?.headline ||
      `${event.company_name} ${filedPhrase(event.signal_type)}`,
    significance: event.briefing?.significance || null,
    sentiment: event.briefing?.sentiment || null,
    primary_event_type: event.briefing?.primary_event_type || null,
    max_tier: event.max_tier,
    signal_type: event.signal_type,
    filing_date: event.filing_date,
    received_at: event.received_at,
  };
}

/**
 * Watchlist inbox state: every watchlist company with live unread counts.
 * New socket events bump the matching company to the top; events for the
 * currently open company are auto-marked as read instead.
 */
export function useWatchlistInbox(activeCompanyId: string | null) {
  const { user } = useAuth();
  // The shared session socket (owned by SocketProvider) is exposed here so
  // dependent hooks (useCompanyEvents) attach to the same instance.
  const { socket, connected } = useSocket();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const activeRef = useRef(activeCompanyId);

  useEffect(() => {
    activeRef.current = activeCompanyId;
  }, [activeCompanyId]);

  const refetch = useCallback(async () => {
    try {
      const data = await api<WatchlistInboxResponse>("/watchlist/");
      setEntries(sortEntries(data.items || []));
      setLoading(false);
    } catch {}
  }, []);

  // Only fetch once signed in; the watchlist page gates rendering on auth,
  // so stale state from a previous session is never shown.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<WatchlistInboxResponse>("/watchlist/")
      .then((data) => {
        if (cancelled) return;
        setEntries(sortEntries(data.items || []));
        setLoading(false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const markRead = useCallback((companyId: string) => {
    setEntries((prev) =>
      prev.map((c) =>
        c.company.id === companyId
          ? { ...c, unread_count: 0, last_read_at: new Date().toISOString() }
          : c
      )
    );
    api<ReadStateResponse>(`/watchlist/${companyId}/read`, { method: "POST" }).catch(
      () => {}
    );
  }, []);

  const setMuted = useCallback(async (companyId: string, muted: boolean) => {
    setEntries((prev) =>
      prev.map((c) => (c.company.id === companyId ? { ...c, muted } : c))
    );
    try {
      await api<ReadStateResponse>(`/watchlist/${companyId}/mute`, {
        method: "PUT",
        body: JSON.stringify({ muted }),
      });
    } catch {
      // Roll back the optimistic update on failure
      setEntries((prev) =>
        prev.map((c) =>
          c.company.id === companyId ? { ...c, muted: !muted } : c
        )
      );
    }
  }, []);

  /** Add a company to the user's watchlist. */
  const addCompany = useCallback(
    async (companyId: string) => {
      await addToDefaultWatchlist(companyId);
      await refetch();
    },
    [refetch]
  );

  /** Remove a company from every watchlist that contains it. */
  const removeCompany = useCallback(
    async (companyId: string) => {
      const data = await api<PaginatedWatchlists>("/watchlists/");
      const containing = (data.watchlists || []).filter((wl) =>
        wl.companies?.some((c) => c.id === companyId)
      );
      await Promise.all(
        containing.map((wl) =>
          api(`/watchlists/${wl.id}/companies/${companyId}`, {
            method: "DELETE",
          })
        )
      );
      await refetch();
    },
    [refetch]
  );

  // Live updates: new filing events reorder the inbox in real time. Attaches
  // to the shared session socket rather than owning a connection.
  useEffect(() => {
    if (!user || !socket) return;

    const onFiling = (event: FilingEvent) => {
      if (!event.company_id) return;
      const isActive = activeRef.current === event.company_id;
      setEntries((prev) => {
        const idx = prev.findIndex((c) => c.company.id === event.company_id);
        if (idx === -1) return prev; // not one of the user's companies
        const entry = prev[idx];
        // The server replays recent historical events on every (re)connect.
        // Only events strictly newer than the entry's last known activity are
        // genuinely new — REST already accounted for everything else, so
        // counting replays would resurrect cleared unread badges.
        const ts = event.received_at || "";
        if (entry.last_activity_at && ts <= entry.last_activity_at) return prev;
        const updated: WatchlistEntry = {
          ...entry,
          last_event: toPreview(event),
          last_activity_at: event.received_at,
          unread_count: isActive ? 0 : entry.unread_count + 1,
        };
        const next = [...prev];
        next[idx] = updated;
        return sortEntries(next);
      });
      if (isActive) {
        api(`/watchlist/${event.company_id}/read`, { method: "POST" }).catch(
          () => {}
        );
      }
    };

    socket.on("filing_event", onFiling);
    return () => {
      socket.off("filing_event", onFiling);
    };
  }, [user, socket]);

  const totalUnread = entries.reduce((sum, c) => sum + c.unread_count, 0);

  return {
    entries,
    totalUnread,
    // Signed-out users have nothing to load; don't report a perpetual
    // loading state for them.
    loading: loading && !!user,
    connected,
    socket,
    refetch,
    markRead,
    setMuted,
    addCompany,
    removeCompany,
  };
}
