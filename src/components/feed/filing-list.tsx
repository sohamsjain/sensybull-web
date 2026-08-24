"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

import type { FilingEvent } from "@/types/events";
import { orderKeyFor, type FeedScope } from "@/hooks/use-events";
import { dayLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { FilingCard } from "./filing-card";

interface FilingListProps {
  events: FilingEvent[];
  allCount: number;
  /** Whose updates this list is showing. */
  scope: FeedScope;
  /** How many companies the reader follows; null until that's known. */
  followedCount?: number | null;
  loading: boolean;
  hasMore: boolean;
  connected: boolean;
  onLoadMore: () => void;
  watchlistedCompanyIds?: Set<string>;
  onAddToWatchlist?: (companyId: string) => void;
  addingCompanyId?: string | null;
  isLoggedIn?: boolean;
}

/**
 * Where each stream's "last visit" mark lives. The two scopes are read at
 * different rhythms — you can be caught up on your own companies and days
 * behind on everything — so they remember separately.
 */
const LAST_SEEN_KEY: Record<FeedScope, string> = {
  mine: "feed-last-seen-mine",
  all: "feed-last-seen",
};

function readLastSeen(scope: FeedScope): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_SEEN_KEY[scope]);
  } catch {
    return null;
  }
}

export function FilingList({
  events,
  allCount,
  scope,
  followedCount = null,
  loading,
  hasMore,
  connected,
  onLoadMore,
  watchlistedCompanyIds,
  onAddToWatchlist,
  addingCompanyId,
  isLoggedIn,
}: FilingListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Where the reader left off last time they read this stream. Read during
  // render (and re-read when they switch streams), stamped in an effect.
  const [seen, setSeen] = useState(() => ({ scope, at: readLastSeen(scope) }));
  if (seen.scope !== scope) setSeen({ scope, at: readLastSeen(scope) });
  const lastSeen = seen.at;

  useEffect(() => {
    try {
      localStorage.setItem(LAST_SEEN_KEY[scope], new Date().toISOString());
    } catch {}
  }, [scope]);

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
      } else if (e.key === "c") {
        navigator.clipboard
          .writeText(`${window.location.origin}/e/${current.id}`)
          .catch(() => {});
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

  // Compared on the same key the list is sorted by, so the divider lands on
  // a real boundary rather than somewhere mid-list.
  const orderKey = orderKeyFor(scope);
  const isNewerThanLastSeen = (e: FilingEvent) => {
    const ts = orderKey(e);
    return !!lastSeen && !!ts && ts > lastSeen;
  };
  const anyNewSinceLastVisit =
    displayed.length > 0 && isNewerThanLastSeen(displayed[0]);

  return (
    <div className="relative h-full">
      {/* New live events, held behind a control rather than pushed at you */}
      {newCount > 0 && (
        <button
          onClick={showNewEvents}
          className="absolute top-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-md bg-brand px-3 py-1 text-micro font-medium text-brand-on shadow-popover transition-colors hover:bg-brand-hover"
        >
          <ArrowUpIcon className="size-3" />
          {newCount} new event{newCount !== 1 ? "s" : ""}
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-3xl">
          {/* Stream status */}
          <div className="flex items-center gap-2 px-4 py-2.5 text-meta text-ink-faint">
            <StatusDot live={connected} />
            <span>{connected ? "Live" : "Connecting…"}</span>
            <span className="text-ink-dim">·</span>
            <span className="tabular-nums">
              {displayed.length} event{displayed.length !== 1 ? "s" : ""}
            </span>
            {scope === "mine" && !!followedCount && (
              <>
                <span className="text-ink-dim">·</span>
                <span>
                  from your{" "}
                  <span className="tabular-nums">{followedCount}</span>{" "}
                  {followedCount === 1 ? "company" : "companies"}
                </span>
              </>
            )}
          </div>

          {/* Guest nudge */}
          {!isLoggedIn && scope === "all" && displayed.length > 0 && (
            <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-md border border-line-subtle bg-surface px-3 py-2.5">
              <p className="text-meta leading-snug text-ink-muted">
                Follow the companies you care about — sign in to build a
                watchlist and get every filing explained in plain English.
              </p>
              <Link href="/login" className="shrink-0">
                <Button size="sm">Sign in</Button>
              </Link>
            </div>
          )}

          {/* First-run nudge: signed in but following nobody yet */}
          {isLoggedIn &&
            scope === "all" &&
            watchlistedCompanyIds?.size === 0 &&
            displayed.length > 0 && (
              <p className="mx-4 mb-2 text-meta leading-snug text-ink-faint">
                This is everything, from every company. Filings from companies
                you follow live in your{" "}
                <Link
                  href="/watchlist"
                  className="text-brand-ink underline-offset-2 hover:underline"
                >
                  watchlist
                </Link>
                {" "}— use <span className="text-ink-muted">Track</span> on any
                event to start.
              </p>
            )}

          {/* Event rows, grouped by day, separated by hairlines */}
          <div className="divide-y divide-line-subtle border-t border-line-subtle">
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
                    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line-subtle bg-canvas/95 px-4 py-1 backdrop-blur">
                      <span className="eyebrow">{dayLabel(ts)}</span>
                    </div>
                  )}
                  {showLastVisit && (
                    <div
                      className="flex items-center gap-3 px-4 py-1.5"
                      aria-label="Events below were already visible on your last visit"
                    >
                      <span className="h-px flex-1 bg-brand/30" />
                      <span className="text-micro font-medium text-brand-ink">
                        last visit
                      </span>
                      <span className="h-px flex-1 bg-brand/30" />
                    </div>
                  )}
                  <FilingCard
                    event={event}
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
            <div className="flex justify-center py-4">
              <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={loading}>
                {loading ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}

          {/* Empty states */}
          {displayed.length === 0 && allCount > 0 && (
            <EmptyState
              className="pt-16"
              title="Nothing matches"
              description={`Try switching to "All", clearing the category filter, or emptying the search box.`}
            />
          )}
          {allCount === 0 && !loading && scope === "mine" && (
            <EmptyState
              className="pt-16"
              title={
                followedCount === 0
                  ? "You're not following anyone yet"
                  : "Nothing from your companies yet"
              }
              description={
                followedCount === 0
                  ? "Follow a company and every filing and press release it publishes lands here, in plain English. Or switch to Everything to watch the whole market live."
                  : "The companies you follow haven't filed anything recently. Switch to Everything to see the whole market."
              }
              action={
                followedCount === 0 ? (
                  <Link href="/watchlist">
                    <Button size="sm">Add a company</Button>
                  </Link>
                ) : undefined
              }
            />
          )}
          {allCount === 0 && !loading && scope === "all" && (
            <EmptyState
              className="pt-16"
              title="No events yet"
              description="New filings and press releases appear here in real time, seconds after they're published."
            />
          )}
          {loading && allCount === 0 && (
            <div className="space-y-px pt-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="mx-4 h-16" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
