"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { StatementTable, RowValues } from "@/types/fundamentals";
import { fiscalYearStarts, type RowSpec } from "@/lib/fundamentals/rows";
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
 * Rows stripe and, on a quarterly table, the first quarter of each fiscal
 * year bands. The two cross into a grid, which is the intent: the stripe
 * carries the eye along a row, the band says where one year stops and the
 * next starts, and a cell knows both at once.
 *
 * The row background has to stay opaque — the frozen label column inherits
 * it, and anything translucent lets the figures scroll through underneath.
 * So the stripe is a solid tint on the row and the band is a translucent
 * tint on the cell, which is also what makes their intersection darker
 * than either alone.
 *
 * The frozen column carries no edge, and the part-column it cuts in half
 * is left cropped. Covering it costs a whole column of width, and a
 * reader scrolling a table already knows the row continues.
 */
export function FinancialTable({
  table,
  rows,
  showFiscalPeriod = false,
  banded = false,
}: {
  table: StatementTable;
  rows: RowSpec[];
  /** Show "Q3 FY25" under each period label (quarters). */
  showFiscalPeriod?: boolean;
  /** Band the first quarter of each fiscal year. Quarterly tables only. */
  banded?: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const scroller = useRef<HTMLDivElement>(null);
  // Whether the view is still following the newest period. True until the
  // reader scrolls away from the right edge, true again if they come back.
  const pinnedRight = useRef(true);

  const periods = table.periods;
  const total = periods.length;

  const bands = useMemo(
    () => (banded ? fiscalYearStarts(periods) : periods.map(() => false)),
    [banded, periods]
  );

  const pinRight = useCallback(() => {
    const el = scroller.current;
    if (!el || !pinnedRight.current) return;
    el.scrollLeft = el.scrollWidth; // clamps to the maximum
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
      <p className="px-4 py-6 text-body text-ink-faint">
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
    striped: boolean,
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
          // Opaque, always: the frozen label cell inherits this.
          striped ? "bg-stripe" : "bg-surface",
          depth === 1 && "bg-canvas-sunken"
        )}
      >
        <th
          scope="row"
          className={cn(
            "sticky left-0 z-[2] max-w-44 bg-inherit py-0.5 pr-3 text-left sm:max-w-none",
            depth === 0 ? "pl-4 text-ink" : "pl-7 font-normal text-ink-muted",
            // A total earns weight and a rule; everything else stays
            // regular, so the totals are the only thing that stands out.
            spec.emphasis ? "font-semibold" : "font-normal",
            rule && "border-t-2 border-line-strong"
          )}
        >
          {expandable ? (
            <button
              type="button"
              onClick={() => toggle(spec.key)}
              aria-expanded={isOpen}
              className="group/toggle -my-0.5 flex min-h-7 items-center gap-1.5 py-0.5 pr-1 text-left transition-colors hover:text-brand-ink"
            >
              {label}
              {/* Beside the label, not aligned down the column: it belongs
                  to the row it opens, and a control parked at a far edge
                  reads as belonging to the table instead. */}
              {isOpen ? (
                <MinusIcon className="size-3.5 shrink-0 text-brand-ink" />
              ) : (
                <PlusIcon className="size-3.5 shrink-0 text-brand-ink" />
              )}
            </button>
          ) : (
            <span className="flex min-h-7 items-center">{label}</span>
          )}
        </th>
        {periods.map((p, i) => {
          const value = values ? values[i] ?? null : null;
          const isTtm = p.key === "ttm";
          return (
            <td
              key={p.key}
              className={cn(
                "whitespace-nowrap px-2 py-0.5 text-right tabular-nums last:pr-4",
                depth === 0 ? "text-ink" : "text-ink-muted",
                rule && "border-t-2 border-line-strong",
                // Translucent, so it darkens the stripe underneath it
                // rather than replacing it.
                bands[i] && !isTtm && "bg-band",
                isTtm && "bg-brand-soft"
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
        {/* Separated borders, not collapsed, so every cell draws its own
            rule and a row's rule can't be swallowed by a neighbour's.
            The first row skips its top rule so it doesn't double the
            header's. Zero spacing looks the same as a collapsed table. */}
        <table className="w-full border-separate border-spacing-0 text-body">
          <thead>
            <tr className="bg-surface">
              <th
                scope="col"
                className="sticky left-0 z-[2] border-b border-line bg-inherit py-1 pr-3 pl-4 text-left"
                aria-label="Line item"
              />
              {periods.map((p, i) => {
                const isTtm = p.key === "ttm";
                return (
                  <th
                    key={p.key}
                    scope="col"
                    className={cn(
                      "border-b border-line px-2 py-1 text-right font-medium whitespace-nowrap text-ink-muted last:pr-4",
                      bands[i] && !isTtm && "bg-band",
                      isTtm && "bg-brand-soft text-brand-ink"
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
            {(() => {
              // Striping counts rendered rows, not row specs, so an
              // expanded breakdown doesn't break the alternation below it.
              let printed = 0;
              return rows.flatMap((spec, index) => {
                const out = [
                  renderRow(spec, 0, table.rows[spec.key], printed++ % 2 === 1, index === 0),
                ];
                if (expanded.has(spec.key) && spec.children) {
                  for (const child of spec.children) {
                    out.push(
                      renderRow(
                        child,
                        1,
                        childValues(table, spec.key, child.key),
                        printed++ % 2 === 1
                      )
                    );
                  }
                }
                return out;
              });
            })()}
          </tbody>
        </table>
      </div>

      {flaggedNotes.length > 0 && (
        <ul className="mt-2 space-y-0.5 px-4 text-micro text-ink-faint">
          {flaggedNotes.map((note) => (
            <li key={note}>* {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
