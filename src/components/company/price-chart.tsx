"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  createChart,
  createSeriesMarkers,
  createTextWatermark,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type MouseEventParams,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Bar } from "@/types/api";
import type { FilingEvent } from "@/types/events";
import { useBars, type BarsLookback } from "@/hooks/use-bars";
import { barTime, eventMarkers, type EventMarker } from "@/lib/chart-signals";
import { chartPalette, type ChartPalette } from "@/lib/chart-theme";
import { Chip, SegmentedControl } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartLegend } from "./chart-legend";
import { ChartMarkerTooltip } from "./chart-marker-tooltip";

const LOOKBACKS: BarsLookback[] = ["1M", "3M", "6M", "1Y"];
const COMPACT_HEIGHT = 220;
/** Pull the next page once this few bars remain off the left edge. */
const LOAD_MARGIN = 12;
/** Volume sits in the bottom fifth of the pane, under the candles. */
const VOLUME_SCALE_MARGINS = { top: 0.86, bottom: 0 };

type MarkerScope = "moves" | "all";

const MARKER_SCOPES: { value: MarkerScope; label: string }[] = [
  { value: "moves", label: "Big moves" },
  { value: "all", label: "All" },
];

function toCandles(bars: Bar[]) {
  return bars.map((bar) => ({
    time: barTime(bar) as UTCTimestamp,
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
  }));
}

function toVolume(bars: Bar[], palette: ChartPalette) {
  return bars.map((bar) => ({
    time: barTime(bar) as UTCTimestamp,
    value: bar.v,
    color: bar.c >= bar.o ? palette.volumeUp : palette.volumeDown,
  }));
}

function toSeriesMarkers(
  markers: EventMarker[],
  palette: ChartPalette
): SeriesMarker<UTCTimestamp>[] {
  return markers.map((marker) => ({
    id: marker.id,
    time: marker.barTime as UTCTimestamp,
    // The arrow points at the candle from the side the stock left, and the
    // price already carries the gap that keeps it clear of the wick.
    position: marker.direction === "up" ? "atPriceBottom" : "atPriceTop",
    price: marker.price,
    shape: marker.direction === "up" ? "arrowUp" : "arrowDown",
    color: marker.direction === "up" ? palette.up : palette.down,
    size: 1.4,
  }));
}

/**
 * Daily candlestick chart with the filings that actually moved the stock.
 *
 * Only sessions that outran a fraction of the weekly ATR get an arrow (see
 * `lib/chart-signals`), so a mark means something happened; hovering one
 * reads the headline behind the move, and clicking pins it. Panning past
 * the left edge pulls the next year of history in.
 */
export function PriceChart({
  companyId,
  ticker = null,
  events,
  fill = false,
}: {
  companyId: string;
  /** Printed in the legend and behind the candles. */
  ticker?: string | null;
  events: FilingEvent[];
  /** Size to the parent container (pannable/zoomable) instead of a fixed strip. */
  fill?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const renderedRef = useRef({ key: "", count: 0 });
  /** Nothing auto-loads until the reader has actually moved the chart. */
  const pannedRef = useRef(false);

  const { resolvedTheme } = useTheme();
  const palette = useMemo(() => chartPalette(resolvedTheme), [resolvedTheme]);

  const [lookback, setLookback] = useState<BarsLookback>("3M");
  const [scope, setScope] = useState<MarkerScope>("moves");
  const { bars, state, loadOlder, loadingOlder } = useBars(companyId, lookback);

  // Bumped whenever the chart object is rebuilt, so the data effects refill it
  const [epoch, setEpoch] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<Bar | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [pinnedMarker, setPinnedMarker] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  const markers = useMemo(
    () => eventMarkers(events, bars, { all: scope === "all" }),
    [events, bars, scope]
  );
  const markersById = useMemo(
    () => new Map(markers.map((marker) => [marker.id, marker])),
    [markers]
  );
  const barsByTime = useMemo(
    () => new Map(bars.map((bar) => [barTime(bar), bar])),
    [bars]
  );

  // The pan handler is registered once; the callback it calls is not stable
  const loadOlderRef = useRef(loadOlder);
  useEffect(() => {
    loadOlderRef.current = loadOlder;
  }, [loadOlder]);

  // ---- Chart lifecycle ----------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const height = () => (fill ? container.clientHeight : COMPACT_HEIGHT);
    const chart = createChart(container, {
      width: container.clientWidth,
      height: height(),
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
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: fill ? 0.22 : 0.16 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: palette.crosshair, style: LineStyle.Dotted },
        horzLine: { color: palette.crosshair, style: LineStyle.Dotted },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        rightOffset: fill ? 6 : 2,
        minBarSpacing: 1,
      },
      // A full-pane chart is worth exploring; the compact strip stays static
      handleScroll: fill,
      handleScale: fill,
    });
    chartRef.current = chart;

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: palette.up,
      downColor: palette.down,
      borderUpColor: palette.up,
      borderDownColor: palette.down,
      wickUpColor: palette.up,
      wickDownColor: palette.down,
      priceLineStyle: LineStyle.Dotted,
      priceLineColor: palette.neutral,
      priceLineWidth: 1,
    });
    candlesRef.current = candles;

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    volume.priceScale().applyOptions({ scaleMargins: VOLUME_SCALE_MARGINS });
    volumeRef.current = volume;

    markersRef.current = createSeriesMarkers(candles, [], { zOrder: "top" });

    if (fill && ticker) {
      createTextWatermark(chart.panes()[0], {
        horzAlign: "center",
        vertAlign: "center",
        lines: [
          {
            text: ticker,
            color: palette.watermark,
            fontSize: 56,
            fontStyle: "bold",
          },
        ],
      });
    }

    const markPanned = () => {
      pannedRef.current = true;
    };
    container.addEventListener("wheel", markPanned, { passive: true });
    container.addEventListener("pointerdown", markPanned);

    const resize = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth, height: height() });
      setSize({ width: container.clientWidth, height: height() });
    });
    resize.observe(container);
    setSize({ width: container.clientWidth, height: height() });
    setEpoch((value) => value + 1);

    return () => {
      resize.disconnect();
      container.removeEventListener("wheel", markPanned);
      container.removeEventListener("pointerdown", markPanned);
      chart.remove();
      chartRef.current = null;
      candlesRef.current = null;
      volumeRef.current = null;
      markersRef.current = null;
      renderedRef.current = { key: "", count: 0 };
      pannedRef.current = false;
    };
    // A theme switch rebuilds the chart rather than re-colouring every
    // piece of it; `ticker` only changes with the company, which remounts
    // this pane anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill, palette]);

  // ---- Data ---------------------------------------------------------------
  useEffect(() => {
    const chart = chartRef.current;
    const candles = candlesRef.current;
    const volume = volumeRef.current;
    if (!chart || !candles || !volume || bars.length === 0) return;

    const key = `${companyId}:${lookback}`;
    const rendered = renderedRef.current;
    const fresh = rendered.key !== key;
    const range = fresh ? null : chart.timeScale().getVisibleLogicalRange();

    candles.setData(toCandles(bars));
    volume.setData(toVolume(bars, palette));

    if (fresh) {
      chart.timeScale().fitContent();
    } else if (range) {
      // Prepending history shifts every logical index; hold the view still
      // so loading older bars doesn't yank the chart out from under the eye.
      const shift = bars.length - rendered.count;
      if (shift !== 0) {
        chart.timeScale().setVisibleLogicalRange({
          from: range.from + shift,
          to: range.to + shift,
        });
      }
    }
    renderedRef.current = { key, count: bars.length };
  }, [bars, companyId, lookback, palette, epoch]);

  useEffect(() => {
    markersRef.current?.setMarkers(toSeriesMarkers(markers, palette));
  }, [markers, palette, epoch]);

  // ---- Auto-load history on pan ------------------------------------------
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !fill) return;
    const onRangeChange = () => {
      if (!pannedRef.current) return;
      const range = chart.timeScale().getVisibleLogicalRange();
      if (range && range.from < LOAD_MARGIN) loadOlderRef.current();
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRangeChange);
    return () =>
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRangeChange);
  }, [fill, epoch]);

  // ---- Crosshair: legend + marker card ------------------------------------
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const markerAt = (param: MouseEventParams) => {
      const id = param.hoveredInfo?.objectId ?? param.hoveredObjectId;
      return typeof id === "string" && markersById.has(id) ? id : null;
    };

    const onMove = (param: MouseEventParams) => {
      if (!param.point || param.time === undefined) {
        setHoveredBar(null);
        setHoveredMarker(null);
        return;
      }
      setPointer({ x: param.point.x, y: param.point.y });
      setHoveredBar(barsByTime.get(param.time as number) ?? null);
      setHoveredMarker(markerAt(param));
    };

    const onClick = (param: MouseEventParams) => {
      if (param.point) setPointer({ x: param.point.x, y: param.point.y });
      setPinnedMarker(markerAt(param));
    };

    chart.subscribeCrosshairMove(onMove);
    chart.subscribeClick(onClick);
    return () => {
      chart.unsubscribeCrosshairMove(onMove);
      chart.unsubscribeClick(onClick);
    };
  }, [barsByTime, markersById, epoch]);

  const resetZoom = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  // Switching company or scope can retire the marker a card is open on;
  // resolve against the current set rather than trusting the held id.
  const pinned = pinnedMarker && markersById.has(pinnedMarker) ? pinnedMarker : null;
  const hovered = hoveredMarker && markersById.has(hoveredMarker) ? hoveredMarker : null;
  const activeMarker = markersById.get(pinned ?? hovered ?? "");

  // An arrow is wider than the candle it hangs off, so the crosshair can be
  // on a neighbour while the card describes the marked session. The readout
  // follows the card — the two must not disagree about which day this is.
  const legendBar =
    (activeMarker && barsByTime.get(activeMarker.barTime)) ??
    hoveredBar ??
    bars[bars.length - 1] ??
    null;
  const previousClose = useMemo(() => {
    if (!legendBar) return null;
    const index = bars.indexOf(legendBar);
    return index > 0 ? bars[index - 1].c : null;
  }, [bars, legendBar]);

  return (
    <div className={fill ? "flex h-full min-h-0 flex-col" : undefined}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5">
        <div className="flex items-center gap-1">
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

        <div className="ml-auto flex items-center gap-2">
          {fill && (
            <Chip variant="quiet" onClick={resetZoom} title="Fit all loaded bars">
              Reset
            </Chip>
          )}
          <SegmentedControl
            label="Which updates to mark"
            options={MARKER_SCOPES}
            value={scope}
            onChange={setScope}
          />
        </div>
      </div>

      <div
        className={fill ? "relative min-h-0 w-full flex-1" : "relative w-full"}
        style={fill ? undefined : { height: COMPACT_HEIGHT }}
      >
        <div ref={containerRef} className="absolute inset-0" />

        {state === "ready" && (
          <>
            <ChartLegend
              bar={legendBar}
              previousClose={previousClose}
              ticker={ticker}
              compact={!fill}
            />
            {activeMarker && size.width > 0 && (
              <ChartMarkerTooltip
                marker={activeMarker}
                point={pointer}
                size={size}
                pinned={!!pinned}
                onClose={() => setPinnedMarker(null)}
              />
            )}
            {loadingOlder && (
              <span className="pointer-events-none absolute top-2 right-2 z-10 rounded-sm bg-surface-hover px-1.5 py-0.5 text-micro text-ink-faint">
                Loading history…
              </span>
            )}
            {fill && markers.length === 0 && events.length > 0 && scope === "moves" && (
              <span className="pointer-events-none absolute right-2 bottom-1 left-2 z-10 text-center text-micro text-ink-dim">
                No update moved this stock more than a normal week&apos;s range
              </span>
            )}
          </>
        )}

        {state === "loading" && (
          <Skeleton className="absolute inset-0 h-full w-full" />
        )}
        {state === "unavailable" && (
          <p className="absolute inset-0 flex items-center px-1 text-meta leading-relaxed text-ink-faint">
            No price data available for this company — it may trade OTC or
            outside US exchanges.
          </p>
        )}
      </div>
    </div>
  );
}
