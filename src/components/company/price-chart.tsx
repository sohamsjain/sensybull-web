"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  createSeriesMarkers,
  CandlestickSeries,
  ColorType,
  type IChartApi,
  type SeriesMarker,
  type UTCTimestamp,
} from "lightweight-charts";
import type { FilingEvent } from "@/types/events";
import { useBars, type BarsLookback } from "@/hooks/use-bars";

const LOOKBACKS: BarsLookback[] = ["1M", "3M", "6M", "1Y"];

const UP = "#10b981"; // emerald-500 — matches the sentiment convention
const DOWN = "#ef4444"; // red-500

function markerColor(event: FilingEvent): string {
  const sentiment = event.briefing?.sentiment;
  if (sentiment === "Positive") return UP;
  if (sentiment === "Negative") return DOWN;
  return "#94a3b8"; // slate-400
}

/**
 * Daily candlestick chart with the company's filing events pinned to the
 * bars they landed on — lookback context for how price moved around news.
 */
export function PriceChart({
  companyId,
  events,
  fill = false,
}: {
  companyId: string;
  events: FilingEvent[];
  /** Size to the parent container (pannable/zoomable) instead of a fixed 220px strip. */
  fill?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [lookback, setLookback] = useState<BarsLookback>("3M");
  const { bars, state } = useBars(companyId, lookback);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || state !== "ready" || bars.length === 0) return;

    const dark = document.documentElement.classList.contains("dark");
    const chart = createChart(container, {
      width: container.clientWidth,
      height: fill ? container.clientHeight : 220,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: dark ? "#64748b" : "#94a3b8",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: dark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.05)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: false },
      // A full-pane chart is worth exploring; the compact strip stays static
      handleScroll: fill,
      handleScale: fill,
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
    });

    const seriesData = bars.map((b) => ({
      time: (Date.parse(b.t) / 1000) as UTCTimestamp,
      open: b.o,
      high: b.h,
      low: b.l,
      close: b.c,
    }));
    series.setData(seriesData);

    // Pin each filing to the last bar at/before its filing time
    const barTimes = seriesData.map((b) => b.time as number);
    const markers: SeriesMarker<UTCTimestamp>[] = [];
    for (const event of events) {
      const at = event.filing_date || event.received_at;
      if (!at) continue;
      const eventTime = Date.parse(at) / 1000;
      let barTime: number | null = null;
      for (const t of barTimes) {
        if (t <= eventTime) barTime = t;
        else break;
      }
      if (barTime == null) continue;
      markers.push({
        time: barTime as UTCTimestamp,
        position: "aboveBar",
        shape: "arrowDown",
        color: markerColor(event),
        text:
          event.briefing?.significance === "High"
            ? event.briefing?.primary_event_type ?? ""
            : "",
      });
    }
    markers.sort((a, b) => (a.time as number) - (b.time as number));
    createSeriesMarkers(series, markers);
    chart.timeScale().fitContent();

    const resize = new ResizeObserver(() => {
      chart.applyOptions(
        fill
          ? { width: container.clientWidth, height: container.clientHeight }
          : { width: container.clientWidth }
      );
    });
    resize.observe(container);

    return () => {
      resize.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [bars, events, state, fill]);

  return (
    <div className={fill ? "flex flex-col h-full min-h-0" : undefined}>
      <div className="flex items-center gap-1 mb-2 shrink-0">
        {LOOKBACKS.map((lb) => (
          <button
            key={lb}
            onClick={() => setLookback(lb)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              lookback === lb
                ? "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {lb}
          </button>
        ))}
      </div>

      {state === "loading" ? (
        <div
          className={`rounded-lg bg-slate-100 dark:bg-white/[0.04] animate-pulse ${
            fill ? "flex-1 min-h-0" : "h-[220px]"
          }`}
        />
      ) : state === "unavailable" ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed py-4">
          No price data available for this company — it may trade OTC or
          outside US exchanges.
        </p>
      ) : (
        <div
          ref={containerRef}
          className={fill ? "flex-1 min-h-0 w-full" : "w-full"}
        />
      )}
    </div>
  );
}
