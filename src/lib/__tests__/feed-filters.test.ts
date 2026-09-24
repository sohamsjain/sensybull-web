import { describe, it, expect } from "vitest";
import type { FilingEvent } from "@/types/events";
import {
  EMPTY_FILTERS,
  PRESETS,
  SECTORS,
  activeFilterCount,
  applyPreset,
  capBucket,
  filterPills,
  filtersFromParams,
  filtersFromView,
  filtersToParams,
  filtersToQuery,
  filtersToView,
  formatMarketCap,
  matchesFeedFilters,
  sameFilters,
  type FeedFilters,
} from "@/lib/feed-filters";

const NOW = Date.parse("2026-09-24T12:00:00Z");

function ev(overrides: Partial<FilingEvent> = {}): FilingEvent {
  return {
    id: "e1",
    edgar_id: "e1",
    signal_type: "8-K",
    ticker: "BIO",
    company_name: "Bio Corp",
    company_id: "c1",
    cik: "1",
    filing_date: "2026-09-24T11:00:00Z",
    edgar_url: null,
    accession_number: null,
    max_tier: 3,
    items: [],
    exhibits: [],
    briefing: {
      headline: "Bio Corp wins FDA approval",
      summary: "",
      primary_event_type: "Regulatory / Clinical",
      significance: "High",
      sentiment: "Positive",
      investor_takeaway: "",
      catalysts: [],
      deal_terms: {},
    },
    event_types: ["Regulatory / Clinical"],
    catalysts: [],
    received_at: "2026-09-24T11:00:00Z",
    market_cap: 800e6,
    sector: "Healthcare",
    ...overrides,
  };
}

const f = (patch: Partial<FeedFilters>): FeedFilters => ({ ...EMPTY_FILTERS, ...patch });

describe("capBucket — mirrors the API's CAP_BUCKETS", () => {
  it.each([
    [null, null],
    [0, null],
    [250e6, "micro"],
    [300e6, "small"],
    [1.99e9, "small"],
    [2e9, "mid"],
    [10e9, "large"],
    [199e9, "large"],
    [200e9, "mega"],
  ])("%s → %s", (cap, bucket) => {
    expect(capBucket(cap)).toBe(bucket);
  });
});

describe("formatMarketCap", () => {
  it("says it the way a reader does", () => {
    expect(formatMarketCap(3.4e12)).toBe("$3.4T");
    expect(formatMarketCap(48e9)).toBe("$48B");
    expect(formatMarketCap(730e6)).toBe("$730M");
    expect(formatMarketCap(2e9)).toBe("$2B");
    expect(formatMarketCap(null)).toBeNull();
  });
});

describe("matchesFeedFilters (live events)", () => {
  it("passes everything with no filters", () => {
    expect(matchesFeedFilters(ev(), EMPTY_FILTERS, NOW)).toBe(true);
  });

  it("important uses the payload flag, then significance", () => {
    expect(matchesFeedFilters(ev(), f({ important: true }), NOW)).toBe(true);
    const medium = ev({ briefing: { ...ev().briefing!, significance: "Medium" } });
    expect(matchesFeedFilters(medium, f({ important: true }), NOW)).toBe(false);
  });

  it("event types match any", () => {
    expect(matchesFeedFilters(ev(), f({ eventTypes: ["Earnings", "Regulatory / Clinical"] }), NOW)).toBe(true);
    expect(matchesFeedFilters(ev(), f({ eventTypes: ["Earnings"] }), NOW)).toBe(false);
  });

  it("sector and cap need the company's classification", () => {
    expect(matchesFeedFilters(ev(), f({ sectors: ["Healthcare"] }), NOW)).toBe(true);
    expect(matchesFeedFilters(ev(), f({ sectors: ["Technology"] }), NOW)).toBe(false);
    expect(matchesFeedFilters(ev({ sector: null }), f({ sectors: ["Healthcare"] }), NOW)).toBe(false);
    expect(matchesFeedFilters(ev(), f({ caps: ["small", "micro"] }), NOW)).toBe(true);
    expect(matchesFeedFilters(ev(), f({ caps: ["mega"] }), NOW)).toBe(false);
    expect(matchesFeedFilters(ev({ market_cap: null }), f({ caps: ["small"] }), NOW)).toBe(false);
  });

  it("source splits press releases from filings", () => {
    expect(matchesFeedFilters(ev(), f({ source: "sec" }), NOW)).toBe(true);
    expect(matchesFeedFilters(ev({ signal_type: "PR" }), f({ source: "sec" }), NOW)).toBe(false);
    expect(matchesFeedFilters(ev({ signal_type: "PR" }), f({ source: "pr" }), NOW)).toBe(true);
  });

  it("sentiment reads the briefing", () => {
    expect(matchesFeedFilters(ev(), f({ sentiments: ["Positive"] }), NOW)).toBe(true);
    expect(matchesFeedFilters(ev(), f({ sentiments: ["Negative"] }), NOW)).toBe(false);
  });

  it("moved needs an explosive reaction in the right direction", () => {
    expect(matchesFeedFilters(ev(), f({ moved: "any" }), NOW)).toBe(false);
    const up = ev({
      price_reactions: { "1d": { pct: 12, price: 10, measured_at: null, explosive: true } },
    });
    expect(matchesFeedFilters(up, f({ moved: "any" }), NOW)).toBe(true);
    expect(matchesFeedFilters(up, f({ moved: "up" }), NOW)).toBe(true);
    expect(matchesFeedFilters(up, f({ moved: "down" }), NOW)).toBe(false);
    const small = ev({
      price_reactions: { "1d": { pct: 1, price: 10, measured_at: null, explosive: false } },
    });
    expect(matchesFeedFilters(small, f({ moved: "any" }), NOW)).toBe(false);
  });

  it("since compares against when the event arrived", () => {
    expect(matchesFeedFilters(ev(), f({ since: "1d" }), NOW)).toBe(true);
    const old = ev({ received_at: "2026-09-20T11:00:00Z" });
    expect(matchesFeedFilters(old, f({ since: "1d" }), NOW)).toBe(false);
    expect(matchesFeedFilters(old, f({ since: "7d" }), NOW)).toBe(true);
  });

  it("search covers ticker, name and headline", () => {
    expect(matchesFeedFilters(ev(), f({ q: "fda" }), NOW)).toBe(true);
    expect(matchesFeedFilters(ev(), f({ q: "merger" }), NOW)).toBe(false);
  });
});

describe("serialization", () => {
  const full = f({
    important: true,
    eventTypes: ["Acquisition", "Debt / Financing"],
    sectors: ["Healthcare", "Technology"],
    caps: ["small", "micro"],
    source: "pr",
    sentiments: ["Negative"],
    moved: "down",
    since: "7d",
    q: "guidance",
  });

  it("round-trips through the URL", () => {
    const params = new URLSearchParams();
    filtersToParams(full, params);
    expect(filtersFromParams(params)).toEqual(full);
  });

  it("keeps the pre-existing short keys for old shared links", () => {
    const params = new URLSearchParams("f=important&t=Acquisition&q=deal");
    expect(filtersFromParams(params)).toEqual(
      f({ important: true, eventTypes: ["Acquisition"], q: "deal" })
    );
  });

  it("drops unknown values from a URL instead of trusting them", () => {
    const params = new URLSearchParams("sec=Crypto,Energy&cap=huge&m=sideways&d=2y");
    expect(filtersFromParams(params)).toEqual(f({ sectors: ["Energy"] }));
  });

  it("builds the API query the backend reads", () => {
    expect(Object.fromEntries(filtersToQuery(full))).toEqual({
      important: "1",
      event_type: "Acquisition,Debt / Financing",
      sector: "Healthcare,Technology",
      cap: "small,micro",
      source: "pr",
      sentiment: "Negative",
      moved: "down",
      since: "7d",
      q: "guidance",
    });
    expect(filtersToQuery(EMPTY_FILTERS).toString()).toBe("");
  });

  it("round-trips through a saved view", () => {
    const stored = filtersToView("mine", full);
    expect(filtersFromView(stored)).toEqual({ scope: "mine", filters: full });
  });
});

describe("sameFilters", () => {
  it("ignores order within a multi-select", () => {
    expect(
      sameFilters(f({ sectors: ["Energy", "Utilities"] }), f({ sectors: ["Utilities", "Energy"] }))
    ).toBe(true);
    expect(sameFilters(f({ sectors: ["Energy"] }), f({ sectors: ["Utilities"] }))).toBe(false);
  });
});

describe("pills and presets", () => {
  it("one pill per active dimension, each removing only itself", () => {
    const filters = f({ important: true, sectors: ["Energy"], caps: ["mega"] });
    const pills = filterPills(filters);
    expect(pills.map((p) => p.key)).toEqual(["important", "sector", "cap"]);
    const withoutSector = pills.find((p) => p.key === "sector")!.remove(filters);
    expect(withoutSector).toEqual(f({ important: true, caps: ["mega"] }));
    expect(activeFilterCount(filters)).toBe(3);
  });

  it("presets only use values the API accepts, and keep the search", () => {
    for (const preset of PRESETS) {
      const applied = applyPreset(f({ q: "x", sectors: ["Energy"] }), preset.filters);
      expect(applied.q).toBe("x");
      for (const s of applied.sectors) expect(SECTORS).toContain(s);
      expect(activeFilterCount(applied)).toBeGreaterThan(0);
    }
  });
});
