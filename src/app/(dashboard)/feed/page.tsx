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
import { toast } from "@/components/ui/app-toaster";
import { EMPTY_FILTERS, hasAnyFilter } from "@/lib/feed-filters";

export default function FeedPage() {
  const { user } = useAuth();
  const { scope, setScope, filters, setFilters } = useDashboard();

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

  const {
    events,
    total,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    loadMore,
    error,
    retry,
    connected,
  } = useEvents({
    filters,
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
      } catch {
        // A follow that silently does nothing is indistinguishable from one
        // that worked, and the reader finds out days later when no updates
        // arrive.
        toast({
          title: "Couldn't follow that company",
          description: "Check your connection and try again.",
          tone: "danger",
        });
      }
      setAddingCompanyId(null);
    },
    [refetch]
  );

  /** Undo every filter at once, from the zero-result state they produced. */
  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, [setFilters]);

  /**
   * Pivot on a row: its category or sector becomes that filter. Every
   * other filter stays, so "Healthcare" from a filtered list of movers is
   * healthcare movers.
   */
  const filterBy = useCallback(
    ({ eventType, sector }: { eventType?: string; sector?: string }) => {
      setFilters((prev) => ({
        ...prev,
        eventTypes: eventType ? [eventType] : prev.eventTypes,
        sectors: sector ? [sector] : prev.sectors,
      }));
    },
    [setFilters]
  );

  return (
    <div className="h-full flex flex-col min-w-0">
      <FeedToolbar
        connected={connected}
        total={loading ? null : total}
        refreshing={refreshing}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <FilingList
          events={events}
          filtered={hasAnyFilter(filters)}
          scope={scope ?? "all"}
          followedCount={watchlistedCompanyIds?.size ?? null}
          loading={loading}
          refreshing={refreshing}
          loadingMore={loadingMore}
          error={error}
          onRetry={retry}
          hasMore={hasMore}
          onLoadMore={loadMore}
          quotes={quotes}
          watchlistedCompanyIds={watchlistedCompanyIds ?? undefined}
          onAddToWatchlist={handleAddToWatchlist}
          addingCompanyId={addingCompanyId}
          isLoggedIn={!!user}
          onResetFilters={resetFilters}
          onShowEverything={() => setScope("all")}
          onFilterBy={filterBy}
        />
      </div>
    </div>
  );
}
