import { describe, it, expect } from "vitest";
import {
  insertByReceivedOrder,
  isFollowed,
  matchesEventType,
  matchesSearch,
  orderKeyFor,
} from "./use-events";
import type { FilingEvent } from "@/types/events";

// Minimal FilingEvent factory — only the fields the ordering logic reads.
function ev(
  edgar_id: string,
  received_at: string,
  filing_date: string | null = received_at
): FilingEvent {
  return {
    id: edgar_id,
    edgar_id,
    signal_type: "8-K",
    ticker: edgar_id,
    company_name: edgar_id,
    company_id: edgar_id,
    cik: "",
    filing_date,
    edgar_url: null,
    accession_number: null,
    max_tier: 1,
    items: [],
    exhibits: [],
    briefing: null,
    event_types: [],
    catalysts: [],
    received_at,
  };
}

const ids = (list: FilingEvent[]) => list.map((e) => e.edgar_id);

describe("insertByReceivedOrder", () => {
  it("places a genuinely new (newest) filing at the top", () => {
    const list = [ev("b", "2026-07-07T10:00:00Z"), ev("a", "2026-07-07T09:00:00Z")];
    const next = insertByReceivedOrder(list, ev("c", "2026-07-07T11:00:00Z"));
    expect(ids(next)).toEqual(["c", "b", "a"]);
  });

  it("does NOT uprank an older replayed watchlist filing to the top", () => {
    const list = [ev("b", "2026-07-07T10:00:00Z"), ev("a", "2026-07-07T08:00:00Z")];
    // A replayed watchlist filing from 09:00 must slot between b and a,
    // not jump to the front of the feed.
    const next = insertByReceivedOrder(list, ev("mid", "2026-07-07T09:00:00Z"));
    expect(ids(next)).toEqual(["b", "mid", "a"]);
  });

  it("appends a filing older than everything loaded", () => {
    const list = [ev("b", "2026-07-07T10:00:00Z"), ev("a", "2026-07-07T09:00:00Z")];
    const next = insertByReceivedOrder(list, ev("old", "2026-07-06T00:00:00Z"));
    expect(ids(next)).toEqual(["b", "a", "old"]);
  });

  it("ignores a duplicate edgar_id (idempotent replay)", () => {
    const list = [ev("b", "2026-07-07T10:00:00Z"), ev("a", "2026-07-07T09:00:00Z")];
    const next = insertByReceivedOrder(list, ev("a", "2026-07-07T09:00:00Z"));
    expect(next).toBe(list);
  });

  it("falls back to filing_date when received_at is empty", () => {
    const list = [ev("b", "2026-07-07T10:00:00Z"), ev("a", "2026-07-07T08:00:00Z")];
    const next = insertByReceivedOrder(list, ev("mid", "", "2026-07-07T09:00:00Z"));
    expect(ids(next)).toEqual(["b", "mid", "a"]);
  });
});

describe("matchesEventType", () => {
  it("matches on the event_types list", () => {
    const e = { ...ev("a", "2026-07-07T10:00:00Z"), event_types: ["Earnings"] };
    expect(matchesEventType(e, "Earnings")).toBe(true);
    expect(matchesEventType(e, "Acquisition")).toBe(false);
  });

  it("falls back to the briefing's primary_event_type", () => {
    const e = {
      ...ev("a", "2026-07-07T10:00:00Z"),
      briefing: {
        headline: "h",
        summary: "",
        primary_event_type: "Acquisition",
        significance: "High" as const,
        sentiment: "Neutral" as const,
        investor_takeaway: "",
        catalysts: [],
        deal_terms: {},
      },
    };
    expect(matchesEventType(e, "Acquisition")).toBe(true);
  });

  it("is false when the event carries no type data", () => {
    expect(matchesEventType(ev("a", "2026-07-07T10:00:00Z"), "Earnings")).toBe(false);
  });
});

describe("orderKeyFor", () => {
  it("orders the public stream by receipt, the watchlist stream by filing date", () => {
    // A press release received today whose SEC filing is dated yesterday.
    const e = ev("a", "2026-07-07T10:00:00Z", "2026-07-06T00:00:00Z");
    expect(orderKeyFor("all")(e)).toBe("2026-07-07T10:00:00Z");
    expect(orderKeyFor("mine")(e)).toBe("2026-07-06T00:00:00Z");
  });

  it("slots a live event into the watchlist stream by filing date", () => {
    const list = [
      ev("b", "2026-07-07T10:00:00Z", "2026-07-07T09:00:00Z"),
      ev("a", "2026-07-07T09:00:00Z", "2026-07-05T09:00:00Z"),
    ];
    // Received now, but filed between the two — belongs in the middle of a
    // filing-date-ordered list, not at the top.
    const next = insertByReceivedOrder(
      list,
      ev("mid", "2026-07-07T11:00:00Z", "2026-07-06T09:00:00Z"),
      orderKeyFor("mine")
    );
    expect(ids(next)).toEqual(["b", "mid", "a"]);
  });
});

describe("isFollowed", () => {
  const e = ev("a", "2026-07-07T10:00:00Z");

  it("keeps events from companies on the watchlist", () => {
    expect(isFollowed(e, new Set(["a"]))).toBe(true);
  });

  it("drops everything else, including before the watchlist has loaded", () => {
    expect(isFollowed(e, new Set(["other"]))).toBe(false);
    expect(isFollowed(e, new Set())).toBe(false);
    expect(isFollowed(e, null)).toBe(false);
  });
});

describe("matchesSearch", () => {
  const e = {
    ...ev("a", "2026-07-07T10:00:00Z"),
    ticker: "MU",
    company_name: "Micron Technology",
    briefing: {
      headline: "Micron raises guidance on HBM demand",
      summary: "",
      primary_event_type: "Earnings",
      significance: "High" as const,
      sentiment: "Positive" as const,
      investor_takeaway: "",
      catalysts: [],
      deal_terms: {},
    },
  };

  it("matches the ticker and the company name, case-insensitively", () => {
    expect(matchesSearch(e, "mu")).toBe(true);
    expect(matchesSearch(e, "micron")).toBe(true);
  });

  it("also matches words in the headline", () => {
    expect(matchesSearch(e, "guidance")).toBe(true);
    expect(matchesSearch(e, "bankruptcy")).toBe(false);
  });

  it("keeps everything when the box is empty", () => {
    expect(matchesSearch(e, "")).toBe(true);
    expect(matchesSearch(e, "   ")).toBe(true);
  });
});
