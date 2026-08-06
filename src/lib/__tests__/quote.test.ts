import { describe, it, expect } from "vitest";
import type { Quote } from "@/types/api";
import {
  formatChange,
  formatChangePct,
  formatQuotePrice,
  quoteTooltip,
} from "../quote";

function quote(overrides: Partial<Quote> = {}): Quote {
  return {
    ticker: "AAPL",
    price: 214.32,
    prev_close: 216.18,
    change: -1.86,
    change_pct: -0.86,
    as_of: "2026-08-06T18:22:03Z",
    stale: false,
    ...overrides,
  };
}

describe("formatQuotePrice", () => {
  it("uses two decimals for ordinary prices", () => {
    expect(formatQuotePrice(214.3)).toBe("$214.30");
    expect(formatQuotePrice(1)).toBe("$1.00");
  });

  it("uses four decimals below a dollar so the move stays visible", () => {
    expect(formatQuotePrice(0.0312)).toBe("$0.0312");
  });

  it("adds thousands separators", () => {
    expect(formatQuotePrice(1234.5)).toBe("$1,234.50");
  });
});

describe("formatChangePct", () => {
  it("signs gains and losses", () => {
    expect(formatChangePct(1.24)).toBe("+1.24%");
    expect(formatChangePct(-0.86)).toBe("-0.86%");
    expect(formatChangePct(0)).toBe("0.00%");
  });

  it("drops a decimal on double-digit moves", () => {
    expect(formatChangePct(12.345)).toBe("+12.3%");
    expect(formatChangePct(-42.5)).toBe("-42.5%");
  });
});

describe("formatChange", () => {
  it("signs the dollar move", () => {
    expect(formatChange(1.86)).toBe("+1.86");
    expect(formatChange(-1.86)).toBe("-1.86");
  });

  it("keeps precision on sub-dollar moves", () => {
    expect(formatChange(-0.0125)).toBe("-0.0125");
  });
});

describe("quoteTooltip", () => {
  it("describes the price, the move, and the previous close", () => {
    const text = quoteTooltip(quote());
    expect(text).toContain("AAPL $214.32");
    expect(text).toContain("-1.86 (-0.86%) today");
    expect(text).toContain("prev close $216.18");
  });

  it("flags a stale price instead of dating it", () => {
    const text = quoteTooltip(
      quote({ stale: true, change: null, change_pct: null, prev_close: null })
    );
    expect(text).toContain("last synced price");
    expect(text).not.toContain("today");
  });

  it("omits the move when there is no previous session", () => {
    const text = quoteTooltip(
      quote({ change: null, change_pct: null, prev_close: null })
    );
    expect(text).not.toContain("today");
    expect(text).toContain("AAPL $214.32");
  });
});
