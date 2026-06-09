"use client";

import { useDashboard } from "../layout";
import { useEvents } from "@/hooks/use-events";
import { FilingList } from "@/components/feed/filing-list";

export default function FeedPage() {
  const { significanceFilter, eventTypeFilter, search, selectedWatchlist } =
    useDashboard();

  const { events, allEvents, loading, hasMore, loadMore, connected } =
    useEvents({
      significanceFilter,
      eventTypeFilter,
      search,
      selectedWatchlist,
    });

  return (
    <FilingList
      events={events}
      allCount={allEvents.length}
      loading={loading}
      hasMore={hasMore}
      connected={connected}
      onLoadMore={loadMore}
    />
  );
}
