"use client";

import type { FeedFacets } from "@/types/api";
import {
  CAP_BUCKETS,
  EMPTY_FILTERS,
  MOVES,
  SECTORS,
  SENTIMENTS,
  SOURCES,
  WINDOWS,
  activeFilterCount,
  toggle,
  type FeedFilters,
} from "@/lib/feed-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
  /** Canonical event-type labels (GET /events/types, minus "Other"). */
  eventTypes: string[];
  /** Per-option counts; null while loading or when the API couldn't say. */
  facets: FeedFacets | null;
  /** Matches for the list as it stands (the list's own total). */
  total: number | null;
}

/**
 * Every way to narrow the feed, in the order an investor asks: how much it
 * matters, how recent, did the stock care, what happened, to what kind of
 * company, from which source, in what tone.
 *
 * Changes apply as they're made — the list refreshes behind the sheet —
 * so the footer button only closes it, stating what the reader will see.
 * Each option carries the count it would return with every other filter
 * held, so a dead end is visible before it's clicked; zero-count options
 * dim but stay clickable (a live event can still arrive).
 */
export function FilterPanel({
  open,
  onOpenChange,
  filters,
  onChange,
  eventTypes,
  facets,
  total,
}: FilterPanelProps) {
  const set = (patch: Partial<FeedFilters>) => onChange({ ...filters, ...patch });
  const active = activeFilterCount(filters);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-canvas sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b border-line-subtle pr-14">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="text-meta text-ink-faint">
            {active === 0
              ? "Narrow the feed by what happened and to whom."
              : `${active} filter${active === 1 ? "" : "s"} on`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <FilterGroup title="Priority">
            <OptionChip
              selected={!filters.important}
              onClick={() => set({ important: false })}
            >
              All updates
            </OptionChip>
            <OptionChip
              selected={filters.important}
              count={facets?.important}
              onClick={() => set({ important: !filters.important })}
            >
              Important only
            </OptionChip>
          </FilterGroup>

          <FilterGroup title="Time">
            <OptionChip
              selected={!filters.since}
              onClick={() => set({ since: null })}
            >
              Any time
            </OptionChip>
            {WINDOWS.map((w) => (
              <OptionChip
                key={w.key}
                selected={filters.since === w.key}
                onClick={() => set({ since: filters.since === w.key ? null : w.key })}
              >
                {w.label}
              </OptionChip>
            ))}
          </FilterGroup>

          <FilterGroup
            title="Price reaction"
            hint="A move of at least twice the stock's typical daily range, measured after the update"
          >
            <OptionChip
              selected={!filters.moved}
              onClick={() => set({ moved: null })}
            >
              Any
            </OptionChip>
            {MOVES.map((m) => (
              <OptionChip
                key={m.key}
                selected={filters.moved === m.key}
                count={facets?.moved[m.key]}
                onClick={() => set({ moved: filters.moved === m.key ? null : m.key })}
              >
                {m.label}
              </OptionChip>
            ))}
          </FilterGroup>

          <FilterGroup
            title="What happened"
            onClear={
              filters.eventTypes.length ? () => set({ eventTypes: [] }) : undefined
            }
          >
            {eventTypes.map((t) => (
              <OptionChip
                key={t}
                selected={filters.eventTypes.includes(t)}
                count={facets ? (facets.event_type[t] ?? 0) : undefined}
                onClick={() => set({ eventTypes: toggle(filters.eventTypes, t) })}
              >
                {t}
              </OptionChip>
            ))}
          </FilterGroup>

          <FilterGroup
            title="Sector"
            onClear={filters.sectors.length ? () => set({ sectors: [] }) : undefined}
          >
            {SECTORS.map((s) => (
              <OptionChip
                key={s}
                selected={filters.sectors.includes(s)}
                count={facets ? (facets.sector[s] ?? 0) : undefined}
                onClick={() => set({ sectors: toggle(filters.sectors, s) })}
              >
                {s}
              </OptionChip>
            ))}
          </FilterGroup>

          <FilterGroup
            title="Market cap"
            onClear={filters.caps.length ? () => set({ caps: [] }) : undefined}
          >
            {CAP_BUCKETS.map((b) => (
              <OptionChip
                key={b.key}
                selected={filters.caps.includes(b.key)}
                count={facets ? (facets.cap[b.key] ?? 0) : undefined}
                onClick={() => set({ caps: toggle(filters.caps, b.key) })}
              >
                {b.label}
                <span
                  className={cn(
                    "font-normal",
                    filters.caps.includes(b.key) ? "text-brand-on/80" : "text-ink-faint"
                  )}
                >
                  {b.range}
                </span>
              </OptionChip>
            ))}
          </FilterGroup>

          <FilterGroup title="Source">
            <OptionChip
              selected={!filters.source}
              onClick={() => set({ source: null })}
            >
              Both
            </OptionChip>
            {SOURCES.map((s) => (
              <OptionChip
                key={s.key}
                selected={filters.source === s.key}
                count={facets ? (facets.source[s.key] ?? 0) : undefined}
                onClick={() => set({ source: filters.source === s.key ? null : s.key })}
              >
                {s.label}
              </OptionChip>
            ))}
          </FilterGroup>

          <FilterGroup
            title="Tone"
            hint="How the briefing reads the news for shareholders — the model's judgement, not a rating"
            onClear={
              filters.sentiments.length ? () => set({ sentiments: [] }) : undefined
            }
          >
            {SENTIMENTS.map((s) => (
              <OptionChip
                key={s}
                selected={filters.sentiments.includes(s)}
                count={facets ? (facets.sentiment[s] ?? 0) : undefined}
                onClick={() => set({ sentiments: toggle(filters.sentiments, s) })}
              >
                {s}
              </OptionChip>
            ))}
          </FilterGroup>
        </div>

        <SheetFooter className="flex-row items-center gap-2 border-t border-line-subtle">
          <Button
            variant="ghost"
            disabled={active === 0}
            onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q })}
          >
            Clear all
          </Button>
          <Button className="ml-auto" onClick={() => onOpenChange(false)}>
            {total == null
              ? "Show updates"
              : `Show ${total.toLocaleString()} update${total === 1 ? "" : "s"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FilterGroup({
  title,
  hint,
  onClear,
  children,
}: {
  title: string;
  hint?: string;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="eyebrow">{title}</h3>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-micro font-medium text-brand-ink hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      {hint && <p className="-mt-1 mb-2 text-micro text-ink-faint">{hint}</p>}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}

/**
 * A filter option. Same look as `Chip` (solid accent when selected) with a
 * trailing count; zero dims the option rather than disabling it.
 */
function OptionChip({
  selected,
  count,
  onClick,
  children,
}: {
  selected: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const empty = count === 0 && !selected;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-meta font-medium transition-colors",
        selected
          ? "bg-brand text-brand-on"
          : "bg-surface-hover text-ink-muted hover:bg-surface-active hover:text-ink",
        empty && "opacity-50"
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "font-mono text-micro tabular-nums",
            selected ? "text-brand-on/80" : "text-ink-faint"
          )}
        >
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}
