import { describe, it, expect } from "vitest";
import type { Bar } from "@/types/api";
import type { FilingEvent } from "@/types/events";
import {
  atr,
  eventMarkers,
  reactionDate,
  sessionDate,
  toWeeklyBars,
  weeklyAtr,
} from "../chart-signals";

/** Daily bars from 2026-06-01, one per calendar day, flat range unless told. */
function bars(
  count: number,
  price = 100,
  options: { range?: number; from?: string } = {}
): Bar[] {
  const range = options.range ?? 2;
  const start = new Date(`${options.from ?? "2026-06-01"}T04:00:00Z`);
  const out: Bar[] = [];
  for (let i = 0; i < count; i++) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    out.push({
      t: day.toISOString(),
      o: price,
      h: price + range / 2,
      l: price - range / 2,
      c: price,
      v: 1_000_000,
    });
  }
  return out;
}

function filing(at: string, overrides: Partial<FilingEvent> = {}): FilingEvent {
  return {
    id: `e-${at}`,
    edgar_id: `edgar-${at}`,
    signal_type: "8-K",
    ticker: "AAPL",
    company_name: "Apple Inc.",
    company_id: "c1",
    cik: "0000320193",
    filing_date: at,
    edgar_url: null,
    accession_number: null,
    max_tier: 1,
    items: [],
    exhibits: [],
    briefing: null,
    event_types: [],
    catalysts: [],
    received_at: at,
    ...overrides,
  } as FilingEvent;
}

describe("sessionDate", () => {
  it("reads a bar's Eastern trading date", () => {
    // Alpaca stamps a daily bar at 04:00Z — midnight in New York
    expect(sessionDate(bars(1, 100, { from: "2026-06-01" })[0])).toBe("2026-06-01");
  });
});

describe("reactionDate", () => {
  it("keeps a filing made during the session on that session", () => {
    expect(reactionDate("2026-06-01T14:30:00Z")).toBe("2026-06-01"); // 10:30 ET
  });

  it("pushes an after-the-close filing to the next session", () => {
    expect(reactionDate("2026-06-01T21:05:00Z")).toBe("2026-06-02"); // 17:05 ET
  });

  it("treats the close itself as after hours", () => {
    expect(reactionDate("2026-06-01T20:00:00Z")).toBe("2026-06-02"); // 16:00 ET
  });

  it("returns null for an unparseable timestamp", () => {
    expect(reactionDate("whenever")).toBeNull();
  });
});

describe("atr", () => {
  it("averages the true ranges", () => {
    expect(atr(bars(20, 100, { range: 2 }))).toBeCloseTo(2, 6);
  });

  it("returns null when there is too little history", () => {
    expect(atr(bars(3))).toBeNull();
  });
});

describe("toWeeklyBars", () => {
  it("folds daily bars into calendar weeks", () => {
    // 2026-06-01 is a Monday, so 10 days spans two weeks
    const weekly = toWeeklyBars(bars(10, 100, { from: "2026-06-01" }));
    expect(weekly).toHaveLength(2);
  });

  it("takes the week's extremes and its last close", () => {
    const daily = bars(3, 100, { from: "2026-06-01" });
    daily[1].h = 120;
    daily[2].l = 80;
    daily[2].c = 90;
    const [week] = toWeeklyBars(daily);
    expect(week).toMatchObject({ o: 100, h: 120, l: 80, c: 90 });
  });
});

describe("weeklyAtr", () => {
  it("uses real weekly bars once enough weeks are loaded", () => {
    // A year of flat 2-wide days: each week's range is also 2
    expect(weeklyAtr(bars(200, 100, { range: 2 }))).toBeCloseTo(2, 6);
  });

  it("scales the daily ATR when the window is too short for weeks", () => {
    const short = bars(20, 100, { range: 2 });
    expect(weeklyAtr(short)).toBeCloseTo(2 * Math.sqrt(5), 6);
  });

  it("is null when there is no usable history", () => {
    expect(weeklyAtr(bars(2))).toBeNull();
  });
});

describe("eventMarkers", () => {
  /** A year of quiet bars with one session that gaps by `move`. */
  function withMove(move: number, at = 40) {
    const series = bars(200, 100, { range: 2 });
    for (let i = at; i < series.length; i++) {
      series[i] = { ...series[i], o: 100 + move, c: 100 + move };
      series[i].h = series[i].o + 1;
      series[i].l = series[i].o - 1;
    }
    return series;
  }

  it("skips a filing the market shrugged off", () => {
    const series = withMove(0.5);
    const markers = eventMarkers(
      [filing(`${series[40].t}`)],
      series
    );
    expect(markers).toHaveLength(0);
  });

  it("plots a filing whose session outran a normal week", () => {
    const series = withMove(6);
    const markers = eventMarkers([filing(series[40].t)], series);
    expect(markers).toHaveLength(1);
    expect(markers[0].movePct).toBeCloseTo(6, 4);
  });

  it("hangs the arrow under the candle when the stock rose", () => {
    const series = withMove(6);
    const [marker] = eventMarkers([filing(series[40].t)], series);
    expect(marker.direction).toBe("up");
    expect(marker.price).toBeLessThan(series[40].l);
  });

  it("hangs it over the candle when the stock fell", () => {
    const series = withMove(-6);
    const [marker] = eventMarkers([filing(series[40].t)], series);
    expect(marker.direction).toBe("down");
    expect(marker.price).toBeGreaterThan(series[40].h);
  });

  it("plots everything when asked", () => {
    const series = withMove(0.5);
    const markers = eventMarkers([filing(series[40].t)], series, { all: true });
    expect(markers).toHaveLength(1);
  });

  it("keeps an event the backend measured as explosive", () => {
    const series = withMove(0.5);
    const markers = eventMarkers(
      [filing(series[40].t, { explosive: true })],
      series
    );
    expect(markers).toHaveLength(1);
  });

  it("shares one arrow between filings that landed on the same session", () => {
    const series = withMove(6);
    const day = series[40].t.slice(0, 10);
    const markers = eventMarkers(
      [filing(`${day}T13:00:00Z`), filing(`${day}T15:30:00Z`)],
      series
    );
    expect(markers).toHaveLength(1);
    expect(markers[0].events).toHaveLength(2);
  });

  it("moves an after-hours filing onto the session that traded it", () => {
    const series = withMove(6);
    const evening = `${series[39].t.slice(0, 10)}T22:00:00Z`;
    const [marker] = eventMarkers([filing(evening)], series);
    expect(marker.barTime).toBe(Math.floor(Date.parse(series[40].t) / 1000));
  });

  it("plots everything when the history is too short to judge", () => {
    const series = bars(3, 100, { range: 2 });
    const markers = eventMarkers([filing(series[1].t)], series);
    expect(markers).toHaveLength(1);
  });

  it("drops a filing from before the loaded window", () => {
    const series = bars(20, 100, { from: "2026-06-01" });
    // Even asked for everything, it must not land on the first bar it sees
    const markers = eventMarkers([filing("2025-01-05T14:00:00Z")], series, {
      all: true,
    });
    expect(markers).toHaveLength(0);
  });

  it("drops a filing made after the last loaded bar", () => {
    const series = bars(20, 100, { from: "2026-06-01" });
    const markers = eventMarkers([filing("2027-01-05T14:00:00Z")], series, {
      all: true,
    });
    expect(markers).toHaveLength(0);
  });
});
