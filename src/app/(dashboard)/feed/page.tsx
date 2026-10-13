"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDashboard } from "../layout";
import { useEvents } from "@/hooks/use-events";
import { useWatchlists } from "@/hooks/use-watchlists";
import { useAuth } from "@/hooks/use-auth";
import { useQuotes } from "@/hooks/use-quotes";
import { useFeedFacets } from "@/hooks/use-feed-facets";
import { useFeedViews } from "@/hooks/use-feed-views";
import { useFilterOptions } from "@/hooks/use-filter-options";
import { FILTER_RAILS_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { addToDefaultWatchlist } from "@/lib/default-watchlist";
import { FilingList } from "@/components/feed/filing-list";
import { FeedToolbar } from "@/components/feed/feed-toolbar";
import { FilterPanel } from "@/components/feed/filter-panel";
import { CompanyFilters, UpdateFilters } from "@/components/feed/filter-sections";
import { SaveViewDialog, SavedViewsSection } from "@/components/feed/saved-views";
import { toast } from "@/components/ui/app-toaster";
import {
  EMPTY_FILTERS,
  dropUnknownIndustries,
  hasAnyFilter,
  type FeedFilters,
  type FeedScope,
} from "@/lib/feed-filters";

export default function FeedPage() {
  const { user } = useAuth();
  const { scope, setScope, filters, setFilters } = useDashboard();

  const { watchlists, loading: watchlistsLoading, refetch } = useWatchlists();
  const [addingCompanyId, setAddingCompanyId] = useState<string | null>(null);

  // Null until the watchlist has actually loaded — the events hook needs to
  // tell "follows nobody" apart from "not known yet" before it filters the
  // live stream down to the reader's companies.
  const options = useFilterOptions();
  const views = useFeedViews(!!user);
  // From lg up the filters are rails beside the feed; below it, a sheet
  const wide = useMediaQuery(FILTER_RAILS_QUERY);
  const [panelOpen, setPanelOpen] = useState(false);
  const [savingFromPanel, setSavingFromPanel] = useState(false);
  // Counts only while some filter is on screen — the rails always are
  const facets = useFeedFacets(scope, filters, wide || panelOpen);

  // A shared link can name an industry no company carries any more; the
  // API would refuse the whole feed over it, so drop it once we know
  useEffect(() => {
    setFilters((prev) => dropUnknownIndustries(prev, options.industries));
  }, [options.industries, setFilters]);

  // `f` takes you to the filters: the left rail when it's on screen,
  // otherwise the sheet. Like `/` for search.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "f" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      if (wide) {
        document
          .querySelector<HTMLElement>("#feed-filters-update button")
          ?.focus();
      } else {
        setPanelOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [wide]);

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
        industries: sector ? [] : prev.industries,
      }));
    },
    [setFilters]
  );

  const applyView = useCallback(
    (nextScope: FeedScope, next: FeedFilters) => {
      setScope(nextScope);
      setFilters(next);
    },
    [setScope, setFilters]
  );

  return (
    <div className="flex h-full min-w-0">
      {/* Left rail: saved views, then what kind of news */}
      <aside
        aria-label="Saved views and update filters"
        className="hidden w-64 shrink-0 overflow-y-auto overscroll-contain border-r border-line-subtle bg-canvas-sunken lg:block xl:w-72"
      >
        <div className="space-y-6 px-4 py-5">
          <SavedViewsSection
            views={views}
            signedIn={!!user}
            scope={scope}
            filters={filters}
            onApply={applyView}
          />
          <div id="feed-filters-update" className="space-y-6 border-t border-line-subtle pt-5">
            <UpdateFilters
              filters={filters}
              onChange={setFilters}
              facets={facets}
              eventTypes={options.eventTypes}
            />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <FeedToolbar
          connected={connected}
          total={loading ? null : total}
          refreshing={refreshing}
          onOpenFilters={() => setPanelOpen(true)}
          views={views}
          industryLabel={options.industryLabel}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
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

      {/* Right rail: to what kind of company, and did the stock care */}
      <aside
        aria-label="Company filters"
        className="hidden w-64 shrink-0 overflow-y-auto overscroll-contain border-l border-line-subtle bg-canvas-sunken lg:block xl:w-72"
      >
        <div className="space-y-6 px-4 py-5">
          <CompanyFilters
            filters={filters}
            onChange={setFilters}
            facets={facets}
            industries={options.industries}
          />
        </div>
      </aside>

      <FilterPanel
        open={panelOpen && !wide}
        onOpenChange={setPanelOpen}
        filters={filters}
        onChange={setFilters}
        eventTypes={options.eventTypes}
        industries={options.industries}
        facets={facets}
        total={facets?.total ?? (loading ? null : total)}
        onSaveView={
          user && scope
            ? () => {
                // One modal at a time: the sheet gives way to the dialog
                setPanelOpen(false);
                setSavingFromPanel(true);
              }
            : undefined
        }
      />
      {user && scope && (
        <SaveViewDialog
          open={savingFromPanel}
          onOpenChange={setSavingFromPanel}
          onSave={(name, alerts) => views.create(name, scope, filters, alerts)}
        />
      )}
    </div>
  );
}
