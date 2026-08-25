"use client";

import { useState, useMemo, useCallback } from "react";
import { useDashboard } from "../layout";
import { useEvents } from "@/hooks/use-events";
import { useWatchlists } from "@/hooks/use-watchlists";
import { useAuth } from "@/hooks/use-auth";
import { useQuotes } from "@/hooks/use-quotes";
import { addToDefaultWatchlist } from "@/lib/default-watchlist";
import { FilingList } from "@/components/feed/filing-list";
import { FeedToolbar } from "@/components/feed/feed-toolbar";

export default function FeedPage() {
  const { user } = useAuth();
  const { scope, filter, eventType, search } = useDashboard();

  const { watchlists, loading: watchlistsLoading, refetch } = useWatchlists();
  const [addingCompanyId, setAddingCompanyId] = useState<string | null>(null);

  // Null until the watchlist has actually loaded — the events hook needs to
  // tell "follows nobody" apart from "not known yet" before it filters the
  // live stream down to the reader's companies.
  const watchlistedCompanyIds = useMemo(() => {
    if (!user || watchlistsLoading) return null;
    const ids = new Set<string>();
    for (const wl of watchlists) {
      for (const c of wl.companies || []) {
        ids.add(c.id);
      }
    }
    return ids;
  }, [watchlists, watchlistsLoading, user]);

  const { events, allEvents, loading, hasMore, loadMore, connected } = useEvents({
    filter,
    eventType,
    search,
    scope,
    followedCompanyIds: watchlistedCompanyIds,
  });

  // One request for every visible filer's price (signed-in only — the quote
  // endpoint needs a session, so the public feed simply shows no prices)
  const quotes = useQuotes(
    useMemo(
      () => events.map((e) => e.company_id).filter((id): id is string => !!id),
      [events]
    ),
    !!user
  );

  const handleAddToWatchlist = useCallback(
    async (companyId: string) => {
      setAddingCompanyId(companyId);
      try {
        await addToDefaultWatchlist(companyId);
        await refetch();
      } catch {}
      setAddingCompanyId(null);
    },
    [refetch]
  );

  return (
    <div className="h-full flex flex-col min-w-0">
      <FeedToolbar connected={connected} />
      <div className="flex-1 min-w-0 overflow-hidden">
        <FilingList
          events={events}
          allCount={allEvents.length}
          scope={scope ?? "all"}
          followedCount={watchlistedCompanyIds?.size ?? null}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          quotes={quotes}
          watchlistedCompanyIds={watchlistedCompanyIds ?? undefined}
          onAddToWatchlist={handleAddToWatchlist}
          addingCompanyId={addingCompanyId}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
