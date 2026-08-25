import type { Bar } from "@/types/api";
import type { FilingEvent } from "@/types/events";

/**
 * Which filings earn a mark on the price chart, and where the mark goes.
 *
 * Plotting every filing turns the chart into a picket fence — most 8-Ks
 * move nothing. A mark only earns its place when the market actually
 * repriced the stock on the news, so an event is plotted when the session
 * it landed in moved more than a fraction of a *normal week's* range
 * (ATR on weekly bars). The arrow then sits on the side the stock left:
 * below the candle when it rose, above it when it fell.
 */

/** A session's move must cover this much of a normal week's range to plot. */
export const ATR_MULTIPLE = 0.75;
/** …and clear this, so a sleepy stock's noise doesn't qualify on ATR alone. */
export const MIN_MOVE_PCT = 1.5;
/** ATR periods. 14 is the standard; short histories use what they have. */
const ATR_PERIOD = 14;
const MIN_TRUE_RANGES = 6;
/** A day's range is ~√5 of a week's — the fallback when weeks are scarce. */
const DAILY_TO_WEEKLY = Math.sqrt(5);

export type MoveDirection = "up" | "down";

/** One arrow on the chart: a session, its move, and the filings behind it. */
export interface EventMarker {
  /** Stable across re-renders — the tooltip looks markers up by this. */
  id: string;
  /** Bar time in seconds (lightweight-charts UTCTimestamp). */
  barTime: number;
  direction: MoveDirection;
  /** Signed % move of the session that first traded the news. */
  movePct: number;
  /** |move| ÷ weekly ATR — how big the day was against a normal week. */
  atrRatio: number;
  /** Price to anchor the arrow to: already clear of the candle's high/low. */
  price: number;
  /** Newest first, as the rest of the product orders filings. */
  events: FilingEvent[];
}

interface Ohlc {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Bar timestamp in seconds, the unit lightweight-charts wants. */
export function barTime(bar: Bar): number {
  return Math.floor(Date.parse(bar.t) / 1000);
}

/**
 * Market-hours calendar. Bar timestamps and filing times are both UTC, but
 * "which session did this land in" is an Eastern-time question — a filing at
 * 21:00 UTC is after the close, and the market's first chance to react is
 * tomorrow.
 */
const EASTERN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
});

function easternParts(ms: number): { date: string; hour: number } {
  const parts = EASTERN.formatToParts(new Date(ms));
  const at = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  // Some runtimes render midnight as hour 24 under hour12: false.
  return {
    date: `${at("year")}-${at("month")}-${at("day")}`,
    hour: Number(at("hour")) % 24,
  };
}

function nextDay(date: string): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

/** The Eastern trading date a bar belongs to. */
export function sessionDate(bar: Bar): string {
  return easternParts(Date.parse(bar.t)).date;
}

/**
 * The first session that could have traded on news published at `at`.
 * Anything from 16:00 ET onward belongs to the next session.
 */
export function reactionDate(at: string): string | null {
  const ms = Date.parse(at);
  if (Number.isNaN(ms)) return null;
  const { date, hour } = easternParts(ms);
  return hour >= 16 ? nextDay(date) : date;
}

function trueRanges(bars: Ohlc[]): number[] {
  const ranges: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const prevClose = bars[i - 1].c;
    ranges.push(
      Math.max(
        bars[i].h - bars[i].l,
        Math.abs(bars[i].h - prevClose),
        Math.abs(bars[i].l - prevClose)
      )
    );
  }
  return ranges;
}

/** Mean true range over the last `period` bars; null when there's too little. */
export function atr(bars: Ohlc[], period = ATR_PERIOD, minimum = MIN_TRUE_RANGES): number | null {
  const ranges = trueRanges(bars);
  if (ranges.length < minimum) return null;
  const window = ranges.slice(-period);
  const mean = window.reduce((sum, r) => sum + r, 0) / window.length;
  return mean > 0 ? mean : null;
}

/** Daily bars folded into weeks (Eastern calendar weeks, Monday-anchored). */
export function toWeeklyBars(bars: Bar[]): Ohlc[] {
  const weeks: Ohlc[] = [];
  let key: string | null = null;
  for (const bar of bars) {
    const date = sessionDate(bar);
    const day = new Date(`${date}T00:00:00Z`);
    // Monday of this bar's week, as the grouping key
    const offset = (day.getUTCDay() + 6) % 7;
    day.setUTCDate(day.getUTCDate() - offset);
    const week = day.toISOString().slice(0, 10);

    if (week !== key) {
      key = week;
      weeks.push({ o: bar.o, h: bar.h, l: bar.l, c: bar.c });
      continue;
    }
    const current = weeks[weeks.length - 1];
    current.h = Math.max(current.h, bar.h);
    current.l = Math.min(current.l, bar.l);
    current.c = bar.c;
  }
  return weeks;
}

/**
 * ATR of a normal week, in price terms.
 *
 * Prefers real weekly bars. A 1M or 3M window doesn't hold enough weeks for
 * that, so it scales the daily ATR by √5 — the usual random-walk relation
 * between a day's range and a week's. Null when even that isn't available,
 * which the caller reads as "don't filter".
 */
export function weeklyAtr(bars: Bar[]): number | null {
  const weekly = atr(toWeeklyBars(bars));
  if (weekly) return weekly;
  const daily = atr(bars, ATR_PERIOD, 8);
  return daily ? daily * DAILY_TO_WEEKLY : null;
}

/** Index of the bar whose session first traded on the event, or -1. */
function reactionIndex(dates: string[], event: FilingEvent): number {
  const at = event.filing_date || event.received_at;
  if (!at) return -1;
  const target = reactionDate(at);
  if (!target) return -1;
  // Older than anything loaded: it belongs to a session off the left edge,
  // not to the first bar we happen to hold.
  if (target < dates[0]) return -1;
  // dates is ascending; find the first session at or after the target
  let low = 0;
  let high = dates.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (dates[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low < dates.length ? low : -1;
}

/**
 * How far the arrow sits from the candle it belongs to.
 *
 * In price terms, not pixels, so the gap survives zooming: about half a
 * day's range, floored at 0.5% so a very quiet stock still gets clearance.
 */
function markerGap(bar: Bar, dailyAtr: number | null): number {
  return Math.max((dailyAtr ?? bar.c * 0.02) * 0.5, bar.c * 0.005);
}

export interface MarkerOptions {
  /** Plot every event instead of only the ones that moved the stock. */
  all?: boolean;
  atrMultiple?: number;
  minMovePct?: number;
}

/**
 * Filings that moved the stock, grouped one marker per session.
 *
 * Several filings can land on the same session — they share a candle, so
 * they share an arrow and the tooltip lists all of them.
 */
export function eventMarkers(
  events: FilingEvent[],
  bars: Bar[],
  { all = false, atrMultiple = ATR_MULTIPLE, minMovePct = MIN_MOVE_PCT }: MarkerOptions = {}
): EventMarker[] {
  if (bars.length === 0 || events.length === 0) return [];

  const dates = bars.map(sessionDate);
  const weekly = weeklyAtr(bars);
  const daily = atr(bars, ATR_PERIOD, 8);
  const gate = weekly === null ? null : weekly * atrMultiple;

  const byBar = new Map<number, EventMarker>();
  for (const event of events) {
    const index = reactionIndex(dates, event);
    if (index < 0) continue;

    const bar = bars[index];
    // The session before it is the baseline; on the oldest loaded bar the
    // open is the best stand-in.
    const baseline = index > 0 ? bars[index - 1].c : bar.o;
    if (!baseline) continue;
    const move = bar.c - baseline;
    const movePct = (move / baseline) * 100;

    // The backend measured this one as explosive against its own ATR — it
    // earns a mark whatever the daily close-to-close says.
    const notable =
      all ||
      event.explosive === true ||
      gate === null ||
      (Math.abs(move) >= gate && Math.abs(movePct) >= minMovePct);
    if (!notable) continue;

    const existing = byBar.get(index);
    if (existing) {
      existing.events.push(event);
      continue;
    }

    const direction: MoveDirection = move >= 0 ? "up" : "down";
    const gap = markerGap(bar, daily);
    byBar.set(index, {
      id: `bar:${barTime(bar)}`,
      barTime: barTime(bar),
      direction,
      movePct,
      atrRatio: weekly ? Math.abs(move) / weekly : 0,
      price: direction === "up" ? bar.l - gap : bar.h + gap,
      events: [event],
    });
  }

  const markers = [...byBar.values()];
  for (const marker of markers) {
    marker.events.sort((a, b) =>
      (b.filing_date || b.received_at || "").localeCompare(
        a.filing_date || a.received_at || ""
      )
    );
  }
  return markers.sort((a, b) => a.barTime - b.barTime);
}
