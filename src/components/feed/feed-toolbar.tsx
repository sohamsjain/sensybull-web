"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useDashboard, type FeedScope } from "@/app/(dashboard)/layout";
import type { FeedViews } from "@/hooks/use-feed-views";
import {
  EMPTY_FILTERS,
  PRESETS,
  activeFilterCount,
  applyPreset,
  filterPills,
} from "@/lib/feed-filters";
import { StatusDot, CountBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip, ChipRow, SegmentedControl } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon, FilterIcon, SearchIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { SearchInput } from "@/components/ui/search-input";
import { FeedViewsMenu } from "./feed-views-menu";
import { cn } from "@/lib/utils";

/** Whose updates you're reading. */
const SCOPES: { value: FeedScope; label: React.ReactNode }[] = [
  {
    value: "mine",
    // A phone's toolbar also holds search, Filters and Views
    label: (
      <>
        <span className="sm:hidden">Mine</span>
        <span className="hidden sm:inline">My companies</span>
      </>
    ),
  },
  { value: "all", label: "Everything" },
];

const PRIORITY: { value: "all" | "important"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "important", label: "Important" },
];

interface FeedToolbarProps {
  connected: boolean;
  /** Matching updates for the current filters; null until the first answer. */
  total: number | null;
  /** A new filter's answer is loading while the last one stays on screen. */
  refreshing: boolean;
  /** Opens the filter sheet (only shown below `lg`; the rails replace it). */
  onOpenFilters: () => void;
  views: FeedViews;
  /** Display name for an industry key, for its pill. */
  industryLabel: (key: string) => string | undefined;
}

/**
 * Feed header. Row one is *whose* updates and search, plus — below `lg`,
 * where the filters don't fit beside the feed — the door to the filter
 * sheet; row two says what the list is narrowed to right now.
 *
 * Row two is the honest part: each active filter is a pill you can remove
 * on its own, so a filtered feed never looks like a quiet market. With
 * nothing on, it offers a handful of presets — real filter sets, which
 * read back as ordinary pills once chosen, so they teach the panel rather
 * than hide it.
 *
 * On a phone, row one can't hold the scope switch, a usable search box,
 * Filters and Views at once — the search box was squeezed to two letters.
 * So below `sm` a signed-in reader's search is a glyph that swaps the
 * scope switch for a full-width field while it's open (or holds a query),
 * and Views is an icon that turns accent while a saved view is on screen.
 */
export function FeedToolbar({
  connected,
  total,
  refreshing,
  onOpenFilters,
  views,
  industryLabel,
}: FeedToolbarProps) {
  const { user } = useAuth();
  const { scope, setScope, filters, setFilters } = useDashboard();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  // Guests have no scope switch, so their search always has the room
  const searchExpanded = !user || searchOpen || filters.q !== "";

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const active = activeFilterCount(filters);
  const pills = filterPills(filters, industryLabel).filter((p) => p.key !== "important");
  const set = (patch: Partial<typeof filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="shrink-0 border-b border-line-subtle bg-canvas">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
        {/* Signed-in readers choose whose filings they're looking at */}
        {user && (
          <div className={cn("min-w-0", searchExpanded && "hidden sm:block")}>
            <SegmentedControl
              options={SCOPES}
              value={scope ?? "all"}
              onChange={setScope}
              label="Show updates from the companies you follow, or from every company"
            />
          </div>
        )}

        <SearchInput
          ref={searchRef}
          id="feed-search"
          value={filters.q}
          onValueChange={(q) => set({ q })}
          onBlur={() => setSearchOpen(false)}
          placeholder="Search company or headline…"
          className={cn("min-w-0 flex-1 sm:max-w-xs", !searchExpanded && "hidden sm:flex")}
          hint={<Kbd className="hidden md:inline-flex">/</Kbd>}
        />
        {!searchExpanded && (
          <IconButton
            size="lg"
            onClick={() => setSearchOpen(true)}
            aria-label="Search company or headline"
            className="ml-auto sm:hidden"
          >
            <SearchIcon />
          </IconButton>
        )}

        {/* From lg up the filters sit in rails beside the feed */}
        <Button
          variant={active > 0 ? "secondary" : "outline"}
          onClick={onOpenFilters}
          aria-label={
            active > 0 ? `Filters, ${active} on` : "Filters"
          }
          title="Filters (F)"
          className="px-2.5 sm:px-3 lg:hidden"
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filters</span>
          <CountBadge count={active} />
        </Button>

        {/* Below lg there's no left rail to list saved views */}
        {user && scope && views.loaded && (
          <div className="lg:hidden">
            <FeedViewsMenu
              views={views}
              scope={scope}
              filters={filters}
              onApply={(nextScope, next) => {
                setScope(nextScope);
                setFilters(next);
              }}
            />
          </div>
        )}

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
      </div>
    </div>
  );
}
