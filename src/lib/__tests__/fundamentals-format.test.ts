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
} from "@/lib/fundamentals/format";

describe("formatAmount", () => {
  it("renders statement amounts in $ Mn as integers with separators", () => {
    expect(formatAmount(391_035_000_000, "mn")).toBe("391,035");
    expect(formatAmount(-794_000_000, "mn")).toBe("-794");
    expect(formatAmount(0, "mn")).toBe("0");
  });

  it("keeps one decimal below 10 in the unit so small figures survive", () => {
    expect(formatAmount(2_400_000, "mn")).toBe("2.4");
    expect(formatAmount(9_960_000, "mn")).toBe("10.0");
    expect(formatAmount(-120_000, "mn")).toBe("-0.1");
    expect(formatAmount(40_000, "mn")).toBe("0");
  });

  it("renders $ Bn with two decimals", () => {
    expect(formatAmount(391_035_000_000, "bn")).toBe("391.04");
    expect(formatAmount(2_400_000, "bn")).toBe("0");
  });

  it("marks a figure the company does not report", () => {
    expect(formatAmount(null, "mn")).toBe("—");
    expect(formatAmount(undefined, "bn")).toBe("—");
    expect(formatAmount(Number.NaN, "mn")).toBe("—");
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
