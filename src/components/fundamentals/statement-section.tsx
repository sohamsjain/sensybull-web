"use client";

import { useState } from "react";
import type { StatementTable } from "@/types/fundamentals";
import {
  GRANULARITY_OPTIONS,
  type Granularity,
  type RowSpec,
} from "@/lib/fundamentals/rows";
import { AMOUNT_UNIT } from "@/lib/fundamentals/format";
import { FinancialTable } from "@/components/fundamentals/financial-table";
import { SegmentedControl } from "@/components/ui/chip";

export interface StatementView {
  table: StatementTable;
  rows: RowSpec[];
}

/**
 * One statement, at whichever granularity the reader asks for.
 *
 * Quarters and years are the same statement seen through two windows, not
 * two subjects, so they share a heading and a switch rather than sitting in
 * separate sections — which is also why the income statement is one section
 * here and two on screener.
 *
 * The card matters on a wide screen: at this density the page is a wall
 * of figures, and a bordered plane is what tells the reader where one
 * statement ends and the next begins. On a phone it costs more than it
 * gives — a border and its inset padding eat width the table needs — so
 * below `sm` the card drops its chrome and the statement runs edge to
 * edge, separated by the heading alone. The unit is stated once per
 * statement, because it is the same unit for every figure inside it.
 */
export function StatementSection({
  title,
  quarterly,
  annual,
  defaultGranularity = "annual",
  caption,
}: {
  title: string;
  quarterly: StatementView;
  annual: StatementView;
  /** Which window opens first. The income statement leads with quarters. */
  defaultGranularity?: Granularity;
  /** Overrides the unit line, for tables that aren't in dollars. */
  caption?: string;
}) {
  const [granularity, setGranularity] = useState<Granularity>(defaultGranularity);
  const view = granularity === "quarterly" ? quarterly : annual;
  const empty = quarterly.table.periods.length === 0 && annual.table.periods.length === 0;

  return (
    <div className="bg-surface sm:rounded-md sm:border sm:border-line-subtle">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2 pt-3 pb-2 sm:px-3">
        <div className="min-w-0">
          <h2 className="text-title font-medium text-ink">{title}</h2>
          <p className="text-micro text-ink-faint">
            {caption ?? `Figures in ${AMOUNT_UNIT}`}
          </p>
        </div>
        {!empty && (
          <SegmentedControl
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={setGranularity}
            label={`${title} period`}
          />
        )}
      </div>
      <div className="pb-2 sm:pb-3">
        <FinancialTable
          table={view.table}
          rows={view.rows}
          showFiscalPeriod={granularity === "quarterly"}
          banded={granularity === "quarterly"}
        />
      </div>
    </div>
  );
}
