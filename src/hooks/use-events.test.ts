import { describe, it, expect } from "vitest";
import { insertByReceivedOrder, matchesEventType } from "./use-events";
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
