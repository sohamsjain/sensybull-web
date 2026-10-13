"use client";

import { useState } from "react";

import type { FeedFacets } from "@/types/api";
import {
  CAP_BUCKETS,
  MOVES,
  SECTORS,
  SENTIMENTS,
  SOURCES,
  WINDOWS,
  sectorState,
  toggle,
  toggleIndustry,
  toggleSector,
  type FeedFilters,
  type SectorIndustries,
} from "@/lib/feed-filters";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/ui/icons";

/**
 * The feed's filters, in two halves that each answer one question:
 *
 * - `UpdateFilters` — *what kind of news*: how recent, what happened, where
 *   it came from, how it reads. The left rail.
 * - `CompanyFilters` — *to what kind of company, and did the stock care*:
 *   sector → industry, market cap, price reaction. The right rail.
 *
 * On a wide screen the halves flank the feed; below `lg` they stack in one
 * bottom sheet (`FilterPanel`). Changes apply as they're made. Each option
 * carries the count it would return with every other filter held, so a
 * dead end is visible before it's clicked; zero-count options dim but stay
 * clickable (a live event can still arrive). Priority isn't here: the
 * All / Important switch above the feed is always on screen.
 */

interface SectionProps {
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
  /** Per-option counts; null while loading or when the API couldn't say. */
  facets: FeedFacets | null;
}

export function UpdateFilters({
  filters,
  onChange,
  facets,
  eventTypes,
}: SectionProps & {
  /** Canonical event-type labels (GET /events/filters, minus "Other"). */
  eventTypes: string[];
}) {
  const set = (patch: Partial<FeedFilters>) => onChange({ ...filters, ...patch });

  return (
    <>
      <FilterGroup title="Time">
        <OptionChip selected={!filters.since} onClick={() => set({ since: null })}>
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
        title="What happened"
        onClear={filters.eventTypes.length ? () => set({ eventTypes: [] }) : undefined}
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

      <FilterGroup title="Source">
        <OptionChip selected={!filters.source} onClick={() => set({ source: null })}>
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
        onClear={filters.sentiments.length ? () => set({ sentiments: [] }) : undefined}
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
    </>
  );
}

export function CompanyFilters({
  filters,
  onChange,
  facets,
  industries,
}: SectionProps & {
  /** Sector → industry tree; empty until it loads, and sectors still work. */
  industries: SectorIndustries[];
}) {
  const set = (patch: Partial<FeedFilters>) => onChange({ ...filters, ...patch });
  const classified = filters.sectors.length > 0 || filters.industries.length > 0;

  return (
    <>
      <FilterGroup
        title="Sector & industry"
        hint="Tick a whole sector, or open it to pick single industries"
        onClear={classified ? () => set({ sectors: [], industries: [] }) : undefined}
        list
      >
        {SECTORS.map((s) => (
          <SectorRow
            key={s}
            sector={s}
            node={industries.find((n) => n.sector === s)}
            filters={filters}
            onChange={onChange}
            facets={facets}
          />
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

      <FilterGroup
        title="Price reaction"
        hint="A move of at least twice the stock's typical daily range, measured after the update"
      >
        <OptionChip selected={!filters.moved} onClick={() => set({ moved: null })}>
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
    </>
  );
}

/**
 * One sector: its chip ticks the whole sector; the disclosure beside it
 * opens the sector's industries. A sector with some industries ticked
 * opens by itself and its chip shows the partial state, so a narrowed
 * sector never reads as "off".
 */
function SectorRow({
  sector,
  node,
  filters,
  onChange,
  facets,
}: {
  sector: string;
  node: SectorIndustries | undefined;
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
  facets: FeedFacets | null;
}) {
  const state: "all" | "some" | "none" = node
    ? sectorState(filters, node)
    : filters.sectors.includes(sector)
      ? "all"
      : "none";
  // null until the reader opens or closes it: then a partly-ticked sector
  // is open, everything else closed
  const [open, setOpen] = useState<boolean | null>(null);
  const expanded = open ?? state === "some";
  const count = facets ? (facets.sector[sector] ?? 0) : undefined;

  const toggleWhole = () =>
    onChange(
      node
        ? toggleSector(filters, node)
        : { ...filters, sectors: toggle(filters.sectors, sector) }
    );

  return (
    <li>
      <div className="flex items-center gap-1">
        <OptionChip
          selected={state === "all"}
          partial={state === "some"}
          count={count}
          onClick={toggleWhole}
          className="min-w-0 flex-1 justify-between"
        >
          <span className="truncate">{sector}</span>
        </OptionChip>
        {node && node.industries.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(!expanded)}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Hide" : "Show"} ${sector} industries`}
            title={`${node.industries.length} industries`}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <ChevronDownIcon
              className={cn("size-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        )}
      </div>
      {node && expanded && (
        <div className="mt-1.5 mb-2.5 ml-2 flex flex-wrap gap-1.5 border-l border-line-subtle pl-2.5">
          {node.industries.map((i) => (
            <OptionChip
              key={i.key}
              size="sm"
              selected={state === "all" || filters.industries.includes(i.key)}
              count={facets ? (facets.industry?.[i.key] ?? 0) : undefined}
              onClick={() => onChange(toggleIndustry(filters, node, i.key))}
            >
              {i.label}
            </OptionChip>
          ))}
        </div>
      )}
    </li>
  );
}

export function FilterGroup({
  title,
  hint,
  onClear,
  list = false,
  children,
}: {
  title: string;
  hint?: string;
  onClear?: () => void;
  /** Children are `li` rows stacked full-width, not wrapping chips. */
  list?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex min-h-7 items-center justify-between gap-3">
        <h3 className="eyebrow">{title}</h3>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="-mr-2 inline-flex min-h-7 items-center rounded-xs px-2 text-micro font-medium text-brand-ink hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      {hint && <p className="-mt-1 mb-2 text-micro text-ink-faint">{hint}</p>}
      {list ? (
        <ul className="flex flex-col gap-1">{children}</ul>
      ) : (
        <div className="flex flex-wrap gap-1.5">{children}</div>
      )}
    </section>
  );
}

/**
 * A filter option. Same look as `Chip` (solid accent when selected) with a
 * trailing count; zero dims the option rather than disabling it. `partial`
 * is a sector with only some industries on: accent-tinted, not solid.
 */
function OptionChip({
  selected,
  partial = false,
  count,
  size = "md",
  onClick,
  className,
  children,
}: {
  selected: boolean;
  partial?: boolean;
  count?: number;
  size?: "sm" | "md";
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const empty = count === 0 && !selected && !partial;
  return (
    <button
      type="button"
      aria-pressed={partial ? "mixed" : selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm text-left font-medium transition-colors",
        size === "md" ? "min-h-8 px-2.5 py-1.5 text-meta" : "min-h-7 px-2 py-1 text-micro",
        selected
          ? "bg-brand text-brand-on"
          : partial
            ? "bg-brand-soft text-brand-ink hover:bg-surface-active"
            : "bg-surface-hover text-ink-muted hover:bg-surface-active hover:text-ink",
        empty && "opacity-50",
        className
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "shrink-0 text-micro tabular-nums",
            selected ? "text-brand-on/80" : "text-ink-faint"
          )}
        >
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}
