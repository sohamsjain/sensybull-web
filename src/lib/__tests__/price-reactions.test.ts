import { describe, it, expect } from "vitest";
import type { PriceReactions } from "@/types/events";
import { reactionSlots } from "../price-reactions";

const point = (pct: number) => ({
  pct,
  price: 100 + pct,
  measured_at: "2026-06-03T13:30:00Z",
  explosive: false,
});

const intervalsOf = (reactions: PriceReactions, intervals?: string[] | null) =>
  reactionSlots(reactions, intervals).map((s) => s.interval);

describe("reactionSlots", () => {
  it("follows the API's interval list when it's there", () => {
    expect(intervalsOf({ "5m": point(1) }, ["5m", "15m"])).toEqual(["5m", "15m"]);
    expect(intervalsOf({}, ["open", "1d", "1w"])).toEqual(["open", "1d", "1w"]);
  });

  it("labels the opening print as At open", () => {
    const [open] = reactionSlots({ open: point(8) }, ["open", "1d", "1w"]);
    expect(open.label).toBe("At open");
    expect(open.description).toBe("At the next open");
    expect(open.point?.pct).toBe(8);
  });

  it("keeps the interval as the label everywhere else", () => {
    const [first] = reactionSlots({ "5m": point(1) }, ["5m"]);
    expect(first.label).toBe("5m");
    expect(first.description).toBe("5m after filing");
  });

  describe("payloads without the interval list", () => {
    it("reads an open reaction as the off-hours set", () => {
      expect(intervalsOf({ open: point(2) })).toEqual(["open", "1d", "1w"]);
    });

    it("falls back to the six classic slots", () => {
      expect(intervalsOf({ "5m": point(1) })).toEqual(["5m", "15m", "30m", "1h", "1d", "1w"]);
      expect(intervalsOf({ "5m": point(1) }, [])).toHaveLength(6);
    });
  });
});
