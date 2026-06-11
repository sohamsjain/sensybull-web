"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { Chat, ChatsResponse, ChatPreviewEvent, ReadStateResponse, PaginatedWatchlists, Watchlist } from "@/types/api";
import type { FilingEvent } from "@/types/events";
import { api, getTokens } from "@/lib/api-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";

/** Inbox order: unread chats first, then most recent activity. */
function sortChats(list: Chat[]): Chat[] {
  return [...list].sort((a, b) => {
    const aUnread = a.unread_count > 0 ? 0 : 1;
    const bUnread = b.unread_count > 0 ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    return (b.last_activity_at || "").localeCompare(a.last_activity_at || "");
  });
}

function toPreview(event: FilingEvent): ChatPreviewEvent {
  return {
    id: event.id,
    headline:
      event.briefing?.headline ||
      `${event.company_name} filed an ${event.signal_type}`,
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
 * Chat list state: watchlist companies as conversations, with live unread
 * counts. New socket events bump the matching chat to the top; events for
 * the currently open chat are auto-marked as read instead.
 */
export function useChats(activeCompanyId: string | null) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  // The live socket instance, exposed so dependent hooks (useCompanyEvents)
  // re-attach their listeners whenever the connection is re-established.
  const [socket, setSocket] = useState<Socket | null>(null);
  const activeRef = useRef(activeCompanyId);

  useEffect(() => {
    activeRef.current = activeCompanyId;
  }, [activeCompanyId]);

  const refetch = useCallback(async () => {
    try {
      const data = await api<ChatsResponse>("/chats/");
      setChats(sortChats(data.chats || []));
      setLoading(false);
    } catch {}
  }, []);

  // Only fetch once signed in; the chats page gates rendering on auth, so
  // stale state from a previous session is never shown.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<ChatsResponse>("/chats/")
      .then((data) => {
        if (cancelled) return;
        setChats(sortChats(data.chats || []));
        setLoading(false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const markRead = useCallback((companyId: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.company.id === companyId
          ? { ...c, unread_count: 0, last_read_at: new Date().toISOString() }
          : c
      )
    );
    api<ReadStateResponse>(`/chats/${companyId}/read`, { method: "POST" }).catch(
      () => {}
    );
  }, []);

  const setMuted = useCallback(async (companyId: string, muted: boolean) => {
    setChats((prev) =>
      prev.map((c) => (c.company.id === companyId ? { ...c, muted } : c))
    );
    try {
      await api<ReadStateResponse>(`/chats/${companyId}/mute`, {
        method: "PUT",
        body: JSON.stringify({ muted }),
      });
    } catch {
      // Roll back the optimistic update on failure
      setChats((prev) =>
        prev.map((c) =>
          c.company.id === companyId ? { ...c, muted: !muted } : c
        )
      );
    }
  }, []);

  /** Add a company to the user's first watchlist (created if none exists). */
  const addCompany = useCallback(
    async (companyId: string) => {
      const data = await api<PaginatedWatchlists>("/watchlists/");
      let wl = data.watchlists?.[0];
      if (!wl) {
        wl = (
          await api<{ watchlist: Watchlist }>("/watchlists/", {
            method: "POST",
            body: JSON.stringify({ name: "My Watchlist" }),
          })
        ).watchlist;
      }
      await api(`/watchlists/${wl.id}/companies`, {
        method: "POST",
        body: JSON.stringify({ company_id: companyId }),
      });
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

  // Live updates: new filing events reorder the inbox in real time
  useEffect(() => {
    if (!user) return;
    const { access } = getTokens();
    const socket = connectSocket(access);

    socket.on("connect", () => {
      setConnected(true);
      setSocket(socket);
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("filing_event", (event: FilingEvent) => {
      if (!event.company_id) return;
      const isActive = activeRef.current === event.company_id;
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.company.id === event.company_id);
        if (idx === -1) return prev; // not one of the user's chats
        const chat = prev[idx];
        // The server replays recent historical events on every (re)connect.
        // Only events strictly newer than the chat's last known activity are
        // genuinely new — REST already accounted for everything else, so
        // counting replays would resurrect cleared unread badges.
        const ts = event.received_at || "";
        if (chat.last_activity_at && ts <= chat.last_activity_at) return prev;
        const updated: Chat = {
          ...chat,
          last_event: toPreview(event),
          last_activity_at: event.received_at,
          unread_count: isActive ? 0 : chat.unread_count + 1,
        };
        const next = [...prev];
        next[idx] = updated;
        return sortChats(next);
      });
      if (isActive) {
        api(`/chats/${event.company_id}/read`, { method: "POST" }).catch(
          () => {}
        );
      }
    });

    return () => disconnectSocket();
  }, [user]);

  const totalUnread = chats.reduce((sum, c) => sum + c.unread_count, 0);

  return {
    chats,
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
