"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { StatementTable, RowValues } from "@/types/fundamentals";
import { isBanded, type RowSpec } from "@/lib/fundamentals/rows";
import {
  formatAmount,
  formatDays,
  formatPercent,
  formatPerShare,
} from "@/lib/fundamentals/format";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Periods flagged by the API's reconciliation checks, with the note shown. */
const QUALITY_NOTES: Record<string, string> = {
  pbt_reconcile_fail:
    "Some rows in this period are derived differently: the reported line items do not reconcile to profit before tax, which usually means a financial-company layout.",
  missing_statement: "One of the three statements is missing for this period.",
  no_ebitda: "Operating profit is derived from operating income plus depreciation.",
};

function formatCell(value: number | null, format: RowSpec["format"]) {
  switch (format) {
    case "amount":
      return formatAmount(value);
    case "percent":
      return formatPercent(value);
    case "days":
      return formatDays(value);
    case "per_share":
      return formatPerShare(value);
  }
}

function childValues(
  table: StatementTable,
  parentKey: string,
  childKey: string
): RowValues | undefined {
  const bd = table.breakdown;
  if (!bd) return undefined;
  const nested = bd[parentKey];
  if (nested && !Array.isArray(nested)) {
    return (nested as Record<string, RowValues>)[childKey];
  }
  const flat = bd[childKey];
  return Array.isArray(flat) ? (flat as RowValues) : undefined;
}

/**
 * One statement table: periods across, rows down, newest period on the
 * right and scrolled into view, sticky row labels, every figure in one
 * unit as a whole number.
 *
 * The reading aids are deliberately layered so they never compete —
 * banding separates the *columns*, a rule above a subtotal separates the
 * *blocks*, and hover marks where the pointer is. There is no row
 * striping: with banded columns it reads as a checkerboard and the eye
 * loses the line it was following.
 */
export function FinancialTable({
  table,
  rows,
  showFiscalPeriod = false,
}: {
  table: StatementTable;
  rows: RowSpec[];
  /** Show "Q3 FY25" under each period label (quarters). */
  showFiscalPeriod?: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  // Whether the view is still following the newest period. True until the
  // reader scrolls away from the right edge, true again if they come back.
  const pinnedRight = useRef(true);

  const periods = table.periods;
  const total = periods.length;

  const pinRight = useCallback(() => {
    const el = scroller.current;
    if (!el || !pinnedRight.current) return;
    el.scrollLeft = el.scrollWidth; // clamps to the maximum
    setScrolled(el.scrollLeft > 0);
  }, []);

  // The newest period is the one worth reading, and it is at the far
  // right — land there rather than making the reader drag.
  //
  // One measurement isn't enough: on hydration the table is often still
  // at its unstyled width, and a scroll set while nothing overflows yet
  // silently clamps back to zero. Watching the table's size instead
  // re-pins whenever layout settles, a font lands, the window resizes, or
  // the reader flips the statement between quarters and years.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    pinnedRight.current = true;
    pinRight();
    const observer = new ResizeObserver(pinRight);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [pinRight, table, rows]);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    // A fraction of a pixel of rounding shouldn't count as scrolling away.
    pinnedRight.current = Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 1;
    setScrolled(el.scrollLeft > 0);
  }, []);

  // One delegated listener instead of a pair on every cell: at 40 columns
  // the per-cell version is thousands of handlers.
  const onPointerMove = useCallback((e: React.MouseEvent<HTMLTableElement>) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-col]");
    const col = cell?.dataset.col;
    setHoverCol(col == null ? null : Number(col));
  }, []);

  const flaggedNotes = useMemo(() => {
    const notes = new Map<string, string>();
    for (const p of periods) {
      for (const flag of p.quality_flags || []) {
        const note = QUALITY_NOTES[flag];
        if (note) notes.set(flag, note);
      }
    }
    return [...notes.values()];
  }, [periods]);

  const flaggedKeys = useMemo(
    () => new Set(periods.filter((p) => p.quality_flags?.length).map((p) => p.key)),
    [periods]
  );

  if (total === 0) {
    return (
      <p className="py-6 text-label text-ink-faint">
        No reported figures for this table.
      </p>
    );
  }

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const renderRow = (
    spec: RowSpec,
    depth: 0 | 1,
    values: RowValues | undefined,
    isFirst = false
  ) => {
    const isOpen = expanded.has(spec.key);
    // A rule above the first row would double the header's own.
    const rule = spec.emphasis && !isFirst;
    const expandable = depth === 0 && !!spec.children?.length;
    const label = (
      <>
        <span className={cn("truncate", spec.short && "hidden sm:inline")}>{spec.label}</span>
        {spec.short && <span className="truncate sm:hidden">{spec.short}</span>}
      </>
    );
    return (
      <tr
        key={`${depth}-${spec.key}`}
        className={cn(
          // A concrete background on the row is what lets the sticky label
          // cell inherit it — with a transparent row the label column
          // stops dead at its own edge and slices every band and hover.
          "group/row bg-surface",
          depth === 1 && "bg-canvas-sunken",
          "hover:bg-surface-hover"
        )}
      >
        <th
          scope="row"
          className={cn(
            "sticky left-0 z-[2] max-w-44 bg-inherit py-1 pr-3 text-left sm:max-w-none",
            depth === 0 ? "pl-0 text-ink" : "pl-4 font-normal text-ink-muted",
            // A total earns weight and a rule; everything else stays
            // regular, so the totals are the only thing that stands out.
            spec.emphasis ? "font-semibold" : "font-normal",
            rule && "border-t border-line",
            scrolled && "border-r border-line shadow-sticky-column"
          )}
        >
          {expandable ? (
            <button
              type="button"
              onClick={() => toggle(spec.key)}
              aria-expanded={isOpen}
              className="group/toggle -my-1 flex min-h-7 w-full items-center justify-between gap-2 py-1 pr-1 text-left transition-colors hover:text-brand-ink"
            >
              {label}
              {/* The control sits on the right so every label in the
                  column starts at the same x, expandable or not. */}
              {isOpen ? (
                <MinusIcon className="size-3 shrink-0 text-ink-faint transition-colors group-hover/toggle:text-brand-ink" />
              ) : (
                <PlusIcon className="size-3 shrink-0 text-ink-faint transition-colors group-hover/toggle:text-brand-ink" />
              )}
            </button>
          ) : (
            <span className="flex min-h-6 items-center">{label}</span>
          )}
        </th>
        {periods.map((p, i) => {
          const value = values ? values[i] ?? null : null;
          const isTtm = p.key === "ttm";
          return (
            <td
              key={p.key}
              data-col={i}
              className={cn(
                "whitespace-nowrap px-2.5 py-1 text-right tabular-nums",
                depth === 0 ? "text-ink" : "text-ink-muted",
                rule && "border-t border-line",
                // Banding, then the TTM accent, then hover — each one
                // allowed to win over the last.
                isBanded(i, total) && !isTtm && "bg-canvas-sunken/70",
                isTtm && "bg-brand-soft/40",
                hoverCol === i && "bg-surface-active",
                "group-hover/row:bg-transparent"
              )}
            >
              {formatCell(value, spec.format)}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="w-full overflow-x-auto overscroll-x-contain"
      >
        {/* Separated borders, not collapsed: under the collapsing model a
            cell's box-shadow is not painted, which is how the frozen
            column ends up with no edge at all. Zero spacing looks the
            same as a collapsed table. */}
        <table
          className="w-full border-separate border-spacing-0 text-meta"
          onMouseMove={onPointerMove}
          onMouseLeave={() => setHoverCol(null)}
        >
          <thead>
            <tr className="bg-surface">
              <th
                scope="col"
                className={cn(
                  "sticky left-0 z-[2] bg-inherit py-1.5 pr-3 text-left",
                  scrolled && "border-r border-line shadow-sticky-column"
                )}
                aria-label="Line item"
              />
              {periods.map((p, i) => {
                const isTtm = p.key === "ttm";
                return (
                  <th
                    key={p.key}
                    scope="col"
                    data-col={i}
                    className={cn(
                      "whitespace-nowrap border-b border-line px-2.5 py-1.5 text-right font-medium text-ink-muted",
                      isBanded(i, total) && !isTtm && "bg-canvas-sunken/70",
                      isTtm && "bg-brand-soft/40 text-brand-ink",
                      hoverCol === i && "bg-surface-active text-ink"
                    )}
                    title={
                      flaggedKeys.has(p.key)
                        ? "Some rows in this period are derived differently"
                        : undefined
                    }
                  >
                    <span className="block">
                      {p.label}
                      {flaggedKeys.has(p.key) && (
                        <span className="text-ink-faint" aria-hidden>
                          {" "}
                          *
                        </span>
                      )}
                    </span>
                    {showFiscalPeriod && p.fiscal_period && p.fiscal_year && (
                      <span className="block text-micro font-normal text-ink-faint">
                        {p.fiscal_period} FY{String(p.fiscal_year).slice(-2)}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.flatMap((spec, index) => {
              const out = [renderRow(spec, 0, table.rows[spec.key], index === 0)];
              if (expanded.has(spec.key) && spec.children) {
                for (const child of spec.children) {
                  out.push(renderRow(child, 1, childValues(table, spec.key, child.key)));
                }
              }
              return out;
            })}
          </tbody>
        </table>
      </div>

      {flaggedNotes.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-micro text-ink-faint">
          {flaggedNotes.map((note) => (
            <li key={note}>* {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
