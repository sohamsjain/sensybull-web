"use client";

import type { Bar } from "@/types/api";
import { formatChangePct, formatVolume } from "@/lib/quote";
import { cn } from "@/lib/utils";

function price(value: number): string {
  const decimals = Math.abs(value) >= 1 ? 2 : 4;
  return value.toFixed(decimals);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-ink-dim">{label}</span>{" "}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

/**
 * The readout in the chart's top-left corner: the bar under the cursor, or
 * the latest one when the cursor is elsewhere. A price chart without OHLCV
 * makes you guess at the numbers you came for.
 */
export function ChartLegend({
  bar,
  previousClose,
  ticker,
  compact = false,
}: {
  bar: Bar | null;
  /** Close of the bar before it — the change is measured against this. */
  previousClose: number | null;
  ticker: string | null;
  /** The 220px strip has no room for four labelled prices — close only. */
  compact?: boolean;
}) {
  if (!bar) return null;

  const up = bar.c >= bar.o;
  const changePct =
    previousClose && previousClose > 0
      ? ((bar.c - previousClose) / previousClose) * 100
      : null;
  const date = new Date(bar.t).toLocaleDateString(undefined, {
    year: compact ? undefined : "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-2 left-2 z-10 flex max-w-[calc(100%-1rem)]",
        "flex-wrap items-baseline gap-x-2.5 gap-y-0.5 font-mono text-micro text-ink-muted"
      )}
    >
      {ticker && (
        <span className="font-sans text-meta font-semibold text-ink">
          {ticker}
        </span>
      )}
      <span className="text-ink-faint">{date}</span>
      <span className={cn("flex gap-2.5", up ? "text-success" : "text-danger")}>
        {compact ? (
          <span className="tabular-nums">{price(bar.c)}</span>
        ) : (
          <>
            <Field label="O" value={price(bar.o)} />
            <Field label="H" value={price(bar.h)} />
            <Field label="L" value={price(bar.l)} />
            <Field label="C" value={price(bar.c)} />
          </>
        )}
      </span>
      {changePct !== null && (
        <span
          className={cn(
            "tabular-nums",
            changePct > 0
              ? "text-success"
              : changePct < 0
                ? "text-danger"
                : "text-ink-faint"
          )}
        >
          {formatChangePct(changePct)}
        </span>
      )}
      {compact ? (
        <span className="tabular-nums text-ink-faint">{formatVolume(bar.v)}</span>
      ) : (
        <Field label="V" value={formatVolume(bar.v)} />
      )}
    </div>
  );
}
