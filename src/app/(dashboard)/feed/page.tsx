"use client";

import { useState, useMemo, useCallback } from "react";
import { useDashboard } from "../layout";
import { useEvents } from "@/hooks/use-events";
import { useWatchlists } from "@/hooks/use-watchlists";
import { useAuth } from "@/hooks/use-auth";
import { FilingList } from "@/components/feed/filing-list";

export default function FeedPage() {
  const { user } = useAuth();
  const { significanceFilter, eventTypeFilter, search, selectedWatchlist } =
    useDashboard();

  const { events, allEvents, loading, hasMore, loadMore, connected } =
    useEvents({
      significanceFilter,
      eventTypeFilter,
      search,
      selectedWatchlist,
    });

  const { watchlists, create, addCompany } = useWatchlists();
  const [addingCompanyId, setAddingCompanyId] = useState<string | null>(null);

  const watchlistedCompanyIds = useMemo(() => {
    const ids = new Set<string>();
    for (const wl of watchlists) {
      for (const c of wl.companies || []) {
        ids.add(c.id);
      }
    }
    return ids;
  }, [watchlists]);

  const handleAddToWatchlist = useCallback(
    async (companyId: string) => {
      setAddingCompanyId(companyId);
      try {
        let targetWatchlist = watchlists[0];
        if (!targetWatchlist) {
          targetWatchlist = await create("My Watchlist");
        }
        if (targetWatchlist?.id) {
          await addCompany(targetWatchlist.id, companyId);
        }
      } catch {}
      setAddingCompanyId(null);
    },
    [watchlists, create, addCompany]
  );

  return (
    <FilingList
      events={events}
      allCount={allEvents.length}
      loading={loading}
      hasMore={hasMore}
      connected={connected}
      onLoadMore={loadMore}
      watchlistedCompanyIds={watchlistedCompanyIds}
      onAddToWatchlist={handleAddToWatchlist}
      addingCompanyId={addingCompanyId}
      isLoggedIn={!!user}
    />
  );
}
