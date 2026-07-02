"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FilingEvent } from "@/types/events";
import { dayLabel } from "@/lib/utils";
import { useDensity } from "@/hooks/use-density";
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

const LAST_SEEN_KEY = "feed-last-seen";

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
  const [density] = useDensity();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Where the reader left off last session; written once per visit
  const [lastSeen] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(LAST_SEEN_KEY)
  );
  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  }, []);

  // While the reader is scrolled down, hold new live events behind a pill
  // instead of yanking the list out from under them.
  const [pinnedTopId, setPinnedTopId] = useState<string | null>(null);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop <= 40) {
      setPinnedTopId(null);
    } else {
      setPinnedTopId((prev) => prev ?? events[0]?.id ?? null);
    }
  }, [events]);

  let newCount = 0;
  let displayed = events;
  if (pinnedTopId) {
    const idx = events.findIndex((e) => e.id === pinnedTopId);
    if (idx > 0) {
      newCount = idx;
      displayed = events.slice(idx);
    }
  }

  const showNewEvents = () => {
    setPinnedTopId(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard navigation: j/k move, o/Enter expand, e EDGAR, w watchlist
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("feed-search")?.focus();
        return;
      }
      if (e.key === "Escape") {
        setSelectedIdx(-1);
        return;
      }
      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        setSelectedIdx((i) =>
          e.key === "j"
            ? Math.min(i + 1, displayed.length - 1)
            : Math.max(i - 1, 0)
        );
        return;
      }

      const current = selectedIdx >= 0 ? displayed[selectedIdx] : undefined;
      if (!current) return;
      if (e.key === "o" || e.key === "Enter") {
        e.preventDefault();
        toggleExpanded(current.id);
      } else if (e.key === "e" && current.edgar_url) {
        window.open(current.edgar_url, "_blank", "noopener,noreferrer");
      } else if (
        e.key === "w" &&
        current.company_id &&
        onAddToWatchlist &&
        isLoggedIn &&
        !watchlistedCompanyIds?.has(current.company_id)
      ) {
        onAddToWatchlist(current.company_id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    displayed,
    selectedIdx,
    toggleExpanded,
    onAddToWatchlist,
    isLoggedIn,
    watchlistedCompanyIds,
  ]);

  // Keep the keyboard cursor visible
  useEffect(() => {
    if (selectedIdx < 0) return;
    scrollRef.current
      ?.querySelector(`[data-feed-idx="${selectedIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const isNewerThanLastSeen = (e: FilingEvent) => {
    const ts = e.received_at || e.filing_date;
    return !!lastSeen && !!ts && ts > lastSeen;
  };
  const anyNewSinceLastVisit =
    displayed.length > 0 && isNewerThanLastSeen(displayed[0]);

  return (
    <div className="relative h-full">
      {/* New live events pill */}
      {newCount > 0 && (
        <button
          onClick={showNewEvents}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/30 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 8.5v-7M2 4.5 5 1.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {newCount} new event{newCount !== 1 ? "s" : ""}
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
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
              {displayed.length} event{displayed.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Event cards, grouped by day */}
          <div className="space-y-3">
            {displayed.map((event, i) => {
              const ts = event.received_at || event.filing_date || "";
              const prev = i > 0 ? displayed[i - 1] : null;
              const prevTs = prev
                ? prev.received_at || prev.filing_date || ""
                : null;
              const showDay =
                !!ts && (!prevTs || dayLabel(ts) !== dayLabel(prevTs));
              const showLastVisit =
                anyNewSinceLastVisit &&
                !!prev &&
                isNewerThanLastSeen(prev) &&
                !isNewerThanLastSeen(event);
              return (
                <div key={event.edgar_id || event.id} data-feed-idx={i}>
                  {showDay && (
                    <div className="sticky top-0 z-10 flex justify-center py-1 pointer-events-none">
                      <span className="text-[11px] px-3 py-1 rounded-full bg-white/90 dark:bg-[#0a0a12]/90 backdrop-blur border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 shadow-sm">
                        {dayLabel(ts)}
                      </span>
                    </div>
                  )}
                  {showLastVisit && (
                    <div className="flex items-center gap-3 my-3" aria-label="Events below were already visible on your last visit">
                      <span className="flex-1 h-px bg-violet-500/25" />
                      <span className="text-[11px] text-violet-600/80 dark:text-violet-400/80 font-medium">
                        last visit
                      </span>
                      <span className="flex-1 h-px bg-violet-500/25" />
                    </div>
                  )}
                  <FilingCard
                    event={event}
                    density={density}
                    expanded={expandedIds.has(event.id)}
                    onToggleExpanded={() => toggleExpanded(event.id)}
                    selected={i === selectedIdx}
                    isWatchlisted={
                      event.company_id
                        ? watchlistedCompanyIds?.has(event.company_id)
                        : false
                    }
                    onAddToWatchlist={onAddToWatchlist}
                    addingToWatchlist={addingCompanyId === event.company_id}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              );
            })}
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
          {displayed.length === 0 && allCount > 0 && (
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

          {/* Keyboard hints */}
          {displayed.length > 0 && (
            <p className="hidden md:block text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6 mb-2 select-none">
              <kbd className="font-mono">j</kbd>/<kbd className="font-mono">k</kbd> navigate
              &nbsp;·&nbsp; <kbd className="font-mono">o</kbd> expand
              &nbsp;·&nbsp; <kbd className="font-mono">e</kbd> EDGAR
              {isLoggedIn && <>&nbsp;·&nbsp; <kbd className="font-mono">w</kbd> watch</>}
              &nbsp;·&nbsp; <kbd className="font-mono">/</kbd> search
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
