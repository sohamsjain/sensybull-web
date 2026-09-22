import { describe, expect, it } from "vitest";

import {
  formatAmount,
  formatCompactDollars,
  formatDays,
  formatFilingDate,
  formatGrowth,
  formatMultiple,
  formatPercent,
  formatPerShare,
  formatPrice,
  formatShares,
  statCompactDollars,
  statMultiple,
  statPercent,
  statPerShare,
  statShares,
} from "@/lib/fundamentals/format";

describe("formatAmount", () => {
  it("renders every statement amount in $ Mn as a whole number", () => {
    expect(formatAmount(391_035_000_000)).toBe("391,035");
    expect(formatAmount(-794_000_000)).toBe("-794");
    expect(formatAmount(0)).toBe("0");
  });

  it("keeps the column scannable: no mixed precision inside one table", () => {
    // A column that reads "8" / "12" / "140" can be scanned; one that
    // reads "8.4" / "12" / "140" cannot, which is the whole point of
    // fixing the unit for the page.
    expect(formatAmount(2_400_000)).toBe("2");
    expect(formatAmount(9_960_000)).toBe("10");
    expect(formatAmount(12_000_000)).toBe("12");
  });

  it("rounds a sub-million figure to zero rather than printing -0", () => {
    expect(formatAmount(-120_000)).toBe("0");
    expect(formatAmount(40_000)).toBe("0");
  });

  it("marks a figure the company does not report", () => {
    expect(formatAmount(null)).toBe("—");
    expect(formatAmount(undefined)).toBe("—");
    expect(formatAmount(Number.NaN)).toBe("—");
  });
});

describe("percentages, days, multiples", () => {
  it("formats whole percents by default", () => {
    expect(formatPercent(34.44)).toBe("34%");
    expect(formatPercent(-3.2)).toBe("-3%");
    expect(formatPercent(0.42, 2)).toBe("0.42%");
    expect(formatPercent(null)).toBe("—");
    expect(formatGrowth(12.7)).toBe("13%");
  });

  it("formats days as integers and multiples with one decimal", () => {
    expect(formatDays(61.8)).toBe("62");
    expect(formatDays(-45.2)).toBe("-45");
    expect(formatMultiple(32.24)).toBe("32.2");
    expect(formatMultiple(null)).toBe("—");
  });

  it("formats per-share and prices", () => {
    expect(formatPerShare(6.08)).toBe("6.08");
    expect(formatPerShare(-0.5)).toBe("-0.50");
    expect(formatPrice(240.5)).toBe("$240.50");
    expect(formatPrice(0.4321)).toBe("$0.4321");
  });
});

describe("header figures", () => {
  it("compacts dollars for the header, never the tables", () => {
    expect(formatCompactDollars(3.56e12)).toBe("$3.56T");
    expect(formatCompactDollars(45.2e9)).toBe("$45.2B");
    expect(formatCompactDollars(820e6)).toBe("$820M");
    expect(formatCompactDollars(-1.5e9)).toBe("-$1.5B");
    expect(formatCompactDollars(null)).toBe("—");
  });

  it("compacts share counts", () => {
    expect(formatShares(14_800_000_000)).toBe("14.8B");
    expect(formatShares(312_000_000)).toBe("312M");
    expect(formatShares(950_000)).toBe("950,000");
  });

  it("prints filing dates in UTC so they never shift a day", () => {
    expect(formatFilingDate("2025-10-31")).toBe("Oct 31, 2025");
    expect(formatFilingDate("2025-10-31T18:01:14Z")).toBe("Oct 31, 2025");
    expect(formatFilingDate(null)).toBe("—");
  });
});

describe("header stats keep the unit apart from the figure", () => {
  it("splits a compact dollar figure so the suffix can be dimmed", () => {
    expect(statCompactDollars(3.56e12)).toEqual({ value: "$3.56", unit: "T" });
    expect(statCompactDollars(45.2e9)).toEqual({ value: "$45.2", unit: "B" });
    expect(statCompactDollars(-1.5e9)).toEqual({ value: "-$1.5", unit: "B" });
    // Under a million there is no suffix to split off.
    expect(statCompactDollars(820_000)).toEqual({ value: "$820,000" });
    expect(statCompactDollars(null)).toEqual({ value: "—" });
  });

  it("splits percents and share counts, and leaves multiples bare", () => {
    expect(statPercent(10.34)).toEqual({ value: "10.3", unit: "%" });
    expect(statPercent(0.482, 2)).toEqual({ value: "0.48", unit: "%" });
    expect(statShares(14_800_000_000)).toEqual({ value: "14.8", unit: "B" });
    expect(statMultiple(22.47)).toEqual({ value: "22.5" });
    expect(statPerShare(6.084)).toEqual({ value: "$6.08" });
    expect(statMultiple(null)).toEqual({ value: "—" });
  });

  // The compact formatters keep working for callers that want one string.
  it("still joins the pair for the metadata description", () => {
    expect(formatCompactDollars(3.56e12)).toBe("$3.56T");
    expect(formatShares(312_000_000)).toBe("312M");
  });
});
