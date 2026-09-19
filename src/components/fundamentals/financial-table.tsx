"use client";

import { useMemo, useState } from "react";
import type { StatementTable, RowValues } from "@/types/fundamentals";
import type { RowSpec } from "@/lib/fundamentals/rows";
import {
  formatAmount,
  formatDays,
  formatPercent,
  formatPerShare,
  type Units,
} from "@/lib/fundamentals/format";
import { useUnits } from "@/lib/fundamentals/units";
import { Chip } from "@/components/ui/chip";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Periods flagged by the API's reconciliation checks, with the note shown. */
const QUALITY_NOTES: Record<string, string> = {
  pbt_reconcile_fail:
    "Some rows in this period are derived differently: the reported line items do not reconcile to profit before tax, which usually means a financial-company layout.",
  missing_statement: "One of the three statements is missing for this period.",
  no_ebitda: "Operating profit is derived from operating income plus depreciation.",
};

function formatCell(value: number | null, format: RowSpec["format"], units: Units) {
  switch (format) {
    case "amount":
      return formatAmount(value, units);
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
 * One screener-style statement table: periods across, rows down, newest
 * period on the right, sticky row labels, tabular numbers. Rows with a
 * breakdown expand in place. The unit toggle is shared across every table
 * on the page and remembered for the reader.
 */
export function FinancialTable({
  table,
  rows,
  defaultColumns,
  caption,
  showFiscalPeriod = false,
}: {
  table: StatementTable;
  rows: RowSpec[];
  /** How many of the newest periods to show before "show all". */
  defaultColumns: number;
  /** Text under the table header, e.g. "Figures in $ Mn". */
  caption?: string;
  /** Show "Q3 FY25" under each period label (quarters). */
  showFiscalPeriod?: boolean;
}) {
  const [units, setUnits] = useUnits();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);

  const total = table.periods.length;
  const visibleStart = showAll ? 0 : Math.max(0, total - defaultColumns);
  const periods = table.periods.slice(visibleStart);
  const hasAmounts = rows.some((r) => r.format === "amount");

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

  const renderRow = (spec: RowSpec, depth: 0 | 1, values: RowValues | undefined) => {
    const isOpen = expanded.has(spec.key);
    const expandable = depth === 0 && !!spec.children?.length;
    return (
      <tr
        key={`${depth}-${spec.key}`}
        className={cn(
          "border-b border-line-subtle last:border-0",
          depth === 0 && "hover:bg-surface-hover/60",
          depth === 1 && "bg-canvas-sunken/60",
          spec.emphasis && "font-semibold"
        )}
      >
        <th
          scope="row"
          className={cn(
            "sticky left-0 z-[1] whitespace-nowrap bg-canvas py-1.5 pr-3 text-left font-medium",
            depth === 0 ? "pl-0 text-ink" : "pl-5 text-ink-faint font-normal",
            spec.emphasis && "border-t border-line text-ink",
            depth === 1 && "bg-canvas"
          )}
        >
          {expandable ? (
            <button
              type="button"
              onClick={() => toggle(spec.key)}
              aria-expanded={isOpen}
              className="group/row inline-flex h-7 items-center gap-1 rounded-sm pr-1 -ml-1 pl-1 text-left transition-colors hover:text-brand-ink"
            >
              {isOpen ? (
                <ChevronDownIcon className="size-3.5 text-ink-faint transition-colors group-hover/row:text-brand-ink" />
              ) : (
                <ChevronRightIcon className="size-3.5 text-ink-faint transition-colors group-hover/row:text-brand-ink" />
              )}
              <span className={cn(spec.short && "hidden sm:inline")}>{spec.label}</span>
              {spec.short && <span className="sm:hidden">{spec.short}</span>}
            </button>
          ) : (
            <span className="inline-flex h-7 items-center">
              <span className={cn(spec.short && "hidden sm:inline")}>{spec.label}</span>
              {spec.short && <span className="sm:hidden">{spec.short}</span>}
            </span>
          )}
        </th>
        {periods.map((p, i) => {
          const value = values ? values[visibleStart + i] ?? null : null;
          const text = formatCell(value, spec.format, units);
          return (
            <td
              key={p.key}
              className={cn(
                "whitespace-nowrap px-2 py-1.5 text-right font-mono tabular-nums",
                depth === 0 ? "text-ink" : "text-ink-muted",
                spec.emphasis && "border-t border-line",
                p.key === "ttm" && "bg-brand-soft/40",
                value != null && value < 0 && "text-ink"
              )}
            >
              {text}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-micro text-ink-faint">
          {caption ?? (hasAmounts ? `Figures in ${units === "bn" ? "$ Bn" : "$ Mn"}` : "")}
          {total > defaultColumns && (
            <>
              {caption || hasAmounts ? " · " : ""}
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="text-brand-ink underline-offset-2 hover:underline"
              >
                {showAll
                  ? `Show latest ${defaultColumns}`
                  : `Show all ${total}`}
              </button>
            </>
          )}
        </p>
        {hasAmounts && (
          <div className="flex gap-1" role="group" aria-label="Units">
            <Chip
              selected={units === "mn"}
              onClick={() => setUnits("mn")}
              className="h-7 px-2 py-0 text-micro"
            >
              $ Mn
            </Chip>
            <Chip
              selected={units === "bn"}
              onClick={() => setUnits("bn")}
              className="h-7 px-2 py-0 text-micro"
            >
              $ Bn
            </Chip>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-meta">
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="sticky left-0 z-[1] bg-canvas py-1.5 pr-3 text-left"
                aria-label="Line item"
              />
              {periods.map((p) => (
                <th
                  key={p.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-2 py-1.5 text-right font-medium text-ink-muted",
                    p.key === "ttm" && "bg-brand-soft/40 text-brand-ink"
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
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.flatMap((spec) => {
              const out = [renderRow(spec, 0, table.rows[spec.key])];
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
