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
import { isImportant } from "@/lib/event-actions";
import { chartPalette, type ChartPalette } from "@/lib/chart-theme";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";

const LOOKBACKS: BarsLookback[] = ["1M", "3M", "6M", "1Y"];

function markerColor(event: FilingEvent, palette: ChartPalette): string {
  const sentiment = event.briefing?.sentiment;
  if (sentiment === "Positive") return palette.up;
  if (sentiment === "Negative") return palette.down;
  return palette.neutral;
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

    const palette = chartPalette();
    const chart = createChart(container, {
      width: container.clientWidth,
      height: fill ? container.clientHeight : 220,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: palette.text,
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: palette.grid },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: false },
      // A full-pane chart is worth exploring; the compact strip stays static
      handleScroll: fill,
      handleScale: fill,
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: palette.up,
      downColor: palette.down,
      borderUpColor: palette.up,
      borderDownColor: palette.down,
      wickUpColor: palette.up,
      wickDownColor: palette.down,
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
        color: markerColor(event, palette),
        text: isImportant(event)
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
    <div className={fill ? "flex h-full min-h-0 flex-col" : undefined}>
      <div className="mb-2 flex shrink-0 items-center gap-1">
        {LOOKBACKS.map((lb) => (
          <Chip
            key={lb}
            variant="quiet"
            selected={lookback === lb}
            onClick={() => setLookback(lb)}
            className="font-mono"
          >
            {lb}
          </Chip>
        ))}
      </div>

      {state === "loading" ? (
        <Skeleton
          className={fill ? "min-h-0 flex-1" : "h-[220px]"}
        />
      ) : state === "unavailable" ? (
        <p className="py-4 text-meta leading-relaxed text-ink-faint">
          No price data available for this company — it may trade OTC or
          outside US exchanges.
        </p>
      ) : (
        <div
          ref={containerRef}
          className={fill ? "min-h-0 w-full flex-1" : "w-full"}
        />
      )}
    </div>
  );
}
