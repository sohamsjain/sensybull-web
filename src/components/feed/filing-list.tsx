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
  watchlistedCompanyIds?: Set<string>;
  onAddToWatchlist?: (companyId: string) => void;
  addingCompanyId?: string | null;
  isLoggedIn?: boolean;
}

export function FilingList({
  events,
  allCount,
  loading,
  hasMore,
  connected,
  onLoadMore,
  watchlistedCompanyIds,
  onAddToWatchlist,
  addingCompanyId,
  isLoggedIn,
}: FilingListProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Connection status */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {connected ? "Live Feed" : "Connecting..."}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">&middot;</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm tabular-nums">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Event cards */}
        <div className="space-y-3">
          {events.map((event) => (
            <FilingCard
              key={event.edgar_id || event.id}
              event={event}
              isWatchlisted={
                event.company_id
                  ? watchlistedCompanyIds?.has(event.company_id)
                  : false
              }
              onAddToWatchlist={onAddToWatchlist}
              addingToWatchlist={addingCompanyId === event.company_id}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button
              variant="ghost"
              onClick={onLoadMore}
              disabled={loading}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {loading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}

        {/* Empty states */}
        {events.length === 0 && allCount > 0 && (
          <div className="text-center mt-16">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slate-400 dark:text-slate-500">
                <path d="M8 4H4v12h12v-4M14 2l4 4-8 8H6v-4l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No events match your filters.
            </p>
            <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
              Try adjusting your significance or event type filters.
            </p>
          </div>
        )}
        {allCount === 0 && !loading && (
          <div className="text-center mt-16">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slate-400 dark:text-slate-500">
                <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No filing events yet.
            </p>
            <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
              New 8-K filings will appear here in real time.
            </p>
          </div>
        )}
        {loading && allCount === 0 && (
          <div className="flex flex-col items-center gap-3 mt-16">
            <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              Loading events...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
