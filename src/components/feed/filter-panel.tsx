"use client";

import type { FeedFacets } from "@/types/api";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  type FeedFilters,
  type SectorIndustries,
} from "@/lib/feed-filters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CompanyFilters, UpdateFilters } from "./filter-sections";

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
  eventTypes: string[];
  industries: SectorIndustries[];
  facets: FeedFacets | null;
  /** Matches for the list as it stands (the list's own total). */
  total: number | null;
  /** Save what's on screen as a view; absent for guests. */
  onSaveView?: () => void;
}

/**
 * Below `lg`, where the feed has no room for rails, both halves of the
 * filters stack in one sheet that rises from the bottom — the thumb's end
 * of a phone — and stops short of the top, so the feed it's narrowing
 * stays in view behind it.
 *
 * Changes apply live; the footer's main button only closes the sheet,
 * stating what the reader will see. Saving sits beside it because the
 * moment a reader has built a filter worth keeping is right here.
 */
export function FilterPanel({
  open,
  onOpenChange,
  filters,
  onChange,
  eventTypes,
  industries,
  facets,
  total,
  onSaveView,
}: FilterPanelProps) {
  const active = activeFilterCount(filters);
  // Priority lives on the toolbar, so the sheet neither counts nor clears it
  const inSheet = active - (filters.important ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] gap-0 rounded-t-lg bg-canvas"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b border-line-subtle pr-14">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="text-meta text-ink-faint">
            {inSheet === 0
              ? "Narrow the feed by what happened and to whom."
              : `${inSheet} filter${inSheet === 1 ? "" : "s"} on`}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          <div className="space-y-6">
            <UpdateFilters
              filters={filters}
              onChange={onChange}
              facets={facets}
              eventTypes={eventTypes}
            />
          </div>
          <div className="mt-6 space-y-6 border-t border-line-subtle pt-6">
            <CompanyFilters
              filters={filters}
              onChange={onChange}
              facets={facets}
              industries={industries}
            />
          </div>
        </div>

        <SheetFooter className="flex-row items-center gap-2 border-t border-line-subtle pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="ghost"
            disabled={inSheet === 0}
            onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q, important: filters.important })}
          >
            Clear
          </Button>
          {onSaveView && (
            <Button variant="outline" disabled={active === 0} onClick={onSaveView}>
              Save view
            </Button>
          )}
          <Button className="ml-auto" onClick={() => onOpenChange(false)}>
            {total == null
              ? "Show updates"
              : `Show ${total.toLocaleString()}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
