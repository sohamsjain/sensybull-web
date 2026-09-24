"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useDashboard, type FeedScope } from "@/app/(dashboard)/layout";
import { useFeedFacets } from "@/hooks/use-feed-facets";
import { useFeedViews } from "@/hooks/use-feed-views";
import { api } from "@/lib/api-client";
import {
  EMPTY_FILTERS,
  PRESETS,
  activeFilterCount,
  applyPreset,
  filterPills,
  type FeedFilters,
} from "@/lib/feed-filters";
import { StatusDot, CountBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip, ChipRow, SegmentedControl } from "@/components/ui/chip";
import { CloseIcon, FilterIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { SearchInput } from "@/components/ui/search-input";
import { FeedViewsMenu } from "./feed-views-menu";
import { FilterPanel } from "./filter-panel";

/** Whose updates you're reading. */
const SCOPES: { value: FeedScope; label: string }[] = [
  { value: "mine", label: "My companies" },
  { value: "all", label: "Everything" },
];

const PRIORITY: { value: "all" | "important"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "important", label: "Important" },
];

/** Fallback while GET /events/types loads (mirrors the API's canonical list). */
const DEFAULT_EVENT_TYPES = [
  "Acquisition",
  "Material Agreement",
  "Earnings",
  "Bankruptcy",
  "Debt / Financing",
  "Restructuring",
  "Leadership Change",
  "Delisting",
  "Restatement",
  "Cybersecurity Incident",
  "Regulatory / Clinical",
];

interface FeedToolbarProps {
  connected: boolean;
  /** Matching updates for the current filters; null until the first answer. */
  total: number | null;
  /** A new filter's answer is loading while the last one stays on screen. */
  refreshing: boolean;
}

/**
 * Feed header. Row one is *whose* updates and search, plus the door to
 * every filter; row two says what the list is narrowed to right now.
 *
 * Row two is the honest part: each active filter is a pill you can remove
 * on its own, so a filtered feed never looks like a quiet market. With
 * nothing on, it offers a handful of presets — real filter sets, which
 * read back as ordinary pills once chosen, so they teach the panel rather
 * than hide it.
 */
export function FeedToolbar({ connected, total, refreshing }: FeedToolbarProps) {
  const { user } = useAuth();
  const { scope, setScope, filters, setFilters } = useDashboard();
  const [panelOpen, setPanelOpen] = useState(false);

  const [eventTypes, setEventTypes] = useState<string[]>(DEFAULT_EVENT_TYPES);
  useEffect(() => {
    let cancelled = false;
    api<{ event_types: string[] }>("/events/types")
      .then((data) => {
        if (cancelled || !data.event_types?.length) return;
        // "Other" isn't a useful filter — clearing the filter already covers it
        setEventTypes(data.event_types.filter((t) => t !== "Other"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const facets = useFeedFacets(scope, filters, panelOpen);
  const views = useFeedViews(!!user);

  // `f` opens the panel, like `/` focuses search
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
      setPanelOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const active = activeFilterCount(filters);
  const pills = filterPills(filters).filter((p) => p.key !== "important");
  const set = (patch: Partial<FeedFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="shrink-0 border-b border-line-subtle bg-canvas">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
        {/* Signed-in readers choose whose filings they're looking at */}
        {user && (
          <SegmentedControl
            options={SCOPES}
            value={scope ?? "all"}
            onChange={setScope}
            label="Show updates from the companies you follow, or from every company"
          />
        )}

        <SearchInput
          id="feed-search"
          value={filters.q}
          onValueChange={(q) => set({ q })}
          placeholder="Search company or headline…"
          className="min-w-0 flex-1 sm:max-w-xs"
          hint={<Kbd className="hidden md:inline-flex">/</Kbd>}
        />

        <Button
          variant={active > 0 ? "secondary" : "outline"}
          onClick={() => setPanelOpen(true)}
          aria-label={
            active > 0 ? `Filters, ${active} on` : "Filters"
          }
          title="Filters (F)"
          className="px-2.5 sm:px-3"
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filters</span>
          <CountBadge count={active} />
        </Button>

        <span
          className="ml-auto hidden items-center gap-1.5 text-meta text-ink-faint md:flex"
          aria-live="polite"
        >
          <StatusDot live={connected} />
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-3xl items-start gap-2 px-4 pb-2.5">
        <SegmentedControl
          options={PRIORITY}
          value={filters.important ? "important" : "all"}
          onChange={(v) => set({ important: v === "important" })}
          label="Show all updates or only important ones"
        />
        <span className="mt-2 h-5 w-px shrink-0 bg-line-subtle" />

        {/* Scrolls on touch, wraps from md up: a pointer can't swipe a
            hidden overflow */}
        <ChipRow
          className="min-w-0 flex-1 md:flex-wrap md:overflow-visible md:[mask-image:none]"
          aria-label={pills.length ? "Active filters" : "Suggested filters"}
        >
          {pills.length > 0 ? (
            <>
              {pills.map((pill) => (
                <Chip
                  key={pill.key}
                  selected
                  onClick={() => setFilters((prev) => pill.remove(prev))}
                  className="inline-flex items-center gap-1 pr-2"
                  title="Remove this filter"
                >
                  {pill.label}
                  <CloseIcon className="size-3.5" aria-hidden />
                  <span className="sr-only">(remove)</span>
                </Chip>
              ))}
              <Chip
                variant="quiet"
                onClick={() => setFilters({ ...EMPTY_FILTERS, q: filters.q })}
              >
                Clear
              </Chip>
            </>
          ) : (
            <>
              <span className="shrink-0 pl-1 text-micro text-ink-faint">Try</span>
              {PRESETS.map((preset) => (
                <Chip
                  key={preset.key}
                  variant="quiet"
                  onClick={() => setFilters((prev) => applyPreset(prev, preset.filters))}
                >
                  {preset.label}
                </Chip>
              ))}
            </>
          )}
        </ChipRow>

        {total != null && (
          <span
            className="mt-2 hidden shrink-0 text-micro tabular-nums text-ink-faint sm:inline"
            aria-live="polite"
          >
            {refreshing ? "Updating…" : `${total.toLocaleString()} update${total === 1 ? "" : "s"}`}
          </span>
        )}

        {user && scope && views.loaded && (
          <FeedViewsMenu
            views={views.views}
            scope={scope}
            filters={filters}
            onApply={(nextScope, next) => {
              setScope(nextScope);
              setFilters(next);
            }}
            onCreate={(name) => views.create(name, scope, filters)}
            onUpdate={(id) => views.update(id, scope, filters)}
            onRemove={views.remove}
          />
        )}
      </div>

      <FilterPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        filters={filters}
        onChange={setFilters}
        eventTypes={eventTypes}
        facets={facets}
        total={facets?.total ?? total}
      />
    </div>
  );
}
