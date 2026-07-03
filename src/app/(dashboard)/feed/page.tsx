"use client";

import { useState, useMemo, useCallback } from "react";
import { useDashboard } from "../layout";
import { useEvents } from "@/hooks/use-events";
import { useWatchlists } from "@/hooks/use-watchlists";
import { useAuth } from "@/hooks/use-auth";
import { FilingList } from "@/components/feed/filing-list";
import { FeedToolbar } from "@/components/feed/feed-toolbar";
import { UpcomingCatalysts } from "@/components/feed/upcoming-catalysts";
import { MarketMovers } from "@/components/feed/market-movers";

export default function FeedPage() {
  const { user } = useAuth();
  const {
    significanceFilter,
    eventTypeFilter,
    marketCapFilter,
    search,
    selectedWatchlist,
  } = useDashboard();

  const { events, allEvents, loading, hasMore, loadMore, connected } =
    useEvents({
      significanceFilter,
      eventTypeFilter,
      marketCapFilter,
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
    <div className="h-full flex flex-col min-w-0">
      <FeedToolbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
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
        </div>
        <aside className="hidden xl:flex xl:flex-col w-80 shrink-0 border-l border-slate-200 dark:border-white/[0.06]">
          <div className="shrink-0">
            <MarketMovers />
          </div>
          {/* Catalysts keep their own scroll area below the pinned movers */}
          <div className="flex-1 min-h-0">
            <UpcomingCatalysts />
          </div>
        </aside>
      </div>
    </div>
  );
}
