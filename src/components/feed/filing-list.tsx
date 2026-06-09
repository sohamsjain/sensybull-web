"use client";

import type { FilingEvent } from "@/types/events";
import { FilingCard } from "./filing-card";
import { Button } from "@/components/ui/button";

interface FilingListProps {
  events: FilingEvent[];
  allCount: number;
  loading: boolean;
  hasMore: boolean;
  connected: boolean;
  onLoadMore: () => void;
}

export function FilingList({
  events,
  allCount,
  loading,
  hasMore,
  connected,
  onLoadMore,
}: FilingListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Connection status */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-slate-500 text-xs">
          {connected ? "Live" : "Connecting..."} &middot; {events.length}{" "}
          event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Event cards */}
      <div className="space-y-2 max-w-3xl">
        {events.map((event) => (
          <FilingCard key={event.edgar_id || event.id} event={event} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={onLoadMore}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200"
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {/* Empty states */}
      {events.length === 0 && allCount > 0 && (
        <p className="text-slate-500 text-sm text-center mt-12">
          No events match your filters.
        </p>
      )}
      {allCount === 0 && !loading && (
        <div className="text-center mt-16">
          <p className="text-slate-500 text-sm">No filing events yet.</p>
          <p className="text-slate-600 text-xs mt-1">
            New 8-K filings will appear here in real time.
          </p>
        </div>
      )}
      {loading && allCount === 0 && (
        <p className="text-slate-500 text-sm text-center mt-12">
          Loading events...
        </p>
      )}
    </div>
  );
}
