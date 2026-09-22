import { describe, expect, it } from "vitest";

import {
  ANNUAL_INCOME_ROWS,
  BALANCE_ROWS,
  CASHFLOW_ROWS,
  DEFAULT_HEADER_RATIOS,
  INCOME_ROWS,
  PAGE_SECTIONS,
  RATIO_ROWS,
  allRowKeys,
  isBanded,
} from "@/lib/fundamentals/rows";

/**
 * The row keys the API computes (sensybull-api services/fundamentals/rows.py
 * INCOME_ROWS / BALANCE_ROWS / CASHFLOW_ROWS / RATIO_ROWS and the breakdown
 * maps). If a key is renamed there, this list and rows.ts change together.
 */
const API_INCOME = [
  "sales", "expenses", "operating_profit", "opm_pct", "other_income", "interest",
  "depreciation", "profit_before_tax", "tax_pct", "net_profit", "eps", "dividend_payout_pct",
];
const API_EXPENSE_BREAKDOWN = ["cost_of_revenue_pct", "sga_pct", "rnd_pct", "other_opex_pct"];
const API_BALANCE = [
  "fixed_assets", "investments", "other_assets", "total_assets", "borrowings",
  "other_liabilities", "total_liabilities", "equity_capital", "reserves", "total_equity",
];
const API_BALANCE_BREAKDOWN = {
  fixed_assets: ["ppe_net", "goodwill", "intangibles"],
  other_assets: ["cash", "receivables", "inventory", "other_current_assets", "other_noncurrent_assets"],
  borrowings: ["short_term_debt", "long_term_debt", "capital_leases"],
  other_liabilities: ["payables", "deferred_revenue", "other_current_liabilities", "minority_interest"],
};
const API_CASHFLOW = [
  "cash_from_operating", "cash_from_investing", "cash_from_financing", "net_cash_flow", "free_cash_flow",
];
const API_CASHFLOW_BREAKDOWN = {
  cash_from_operating: ["net_income", "depreciation_amortization", "stock_based_compensation"],
  cash_from_investing: ["capex", "acquisitions"],
  cash_from_financing: ["debt_issued", "debt_repaid", "buybacks", "dividends_paid"],
};
const API_RATIOS = [
  "debtor_days", "inventory_days", "days_payable", "cash_conversion_cycle",
  "working_capital_days", "roce_pct",
];

describe("row specs mirror the API's row keys", () => {
  it("income statement", () => {
    expect(INCOME_ROWS.map((r) => r.key)).toEqual(API_INCOME.filter((k) => k !== "dividend_payout_pct"));
    expect(ANNUAL_INCOME_ROWS.map((r) => r.key)).toEqual(API_INCOME);
    const expenses = INCOME_ROWS.find((r) => r.key === "expenses");
    expect(expenses?.children?.map((c) => c.key)).toEqual(API_EXPENSE_BREAKDOWN);
  });

  it("balance sheet, assets first", () => {
    expect(BALANCE_ROWS.map((r) => r.key)).toEqual(API_BALANCE);
    expect(BALANCE_ROWS[0].key).toBe("fixed_assets");
    for (const [parent, children] of Object.entries(API_BALANCE_BREAKDOWN)) {
      const spec = BALANCE_ROWS.find((r) => r.key === parent);
      expect(spec?.children?.map((c) => c.key)).toEqual(children);
    }
  });

  it("cash flow and ratios", () => {
    expect(CASHFLOW_ROWS.map((r) => r.key)).toEqual(API_CASHFLOW);
    for (const [parent, children] of Object.entries(API_CASHFLOW_BREAKDOWN)) {
      const spec = CASHFLOW_ROWS.find((r) => r.key === parent);
      expect(spec?.children?.map((c) => c.key)).toEqual(children);
    }
    expect(RATIO_ROWS.map((r) => r.key)).toEqual(API_RATIOS);
  });

  it("has no duplicate keys within a table", () => {
    for (const specs of [ANNUAL_INCOME_ROWS, BALANCE_ROWS, CASHFLOW_ROWS, RATIO_ROWS]) {
      const keys = allRowKeys(specs);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("prints every ratio the API computes, in whole rows of three", () => {
    const keys = DEFAULT_HEADER_RATIOS.map((r) => r.key);
    // The grid is three columns; a partial last row leaves a hole in it.
    expect(keys.length % 3).toBe(0);
    expect(new Set(keys).size).toBe(keys.length);
    // These were computed by the API and never rendered before.
    for (const key of ["pb", "ev", "ev_ebitda", "debt_to_equity", "interest_coverage",
                       "opm_ttm", "eps_ttm", "fcf_ttm", "revenue_ttm", "net_income_ttm",
                       "sales_cagr_3y", "profit_cagr_3y"]) {
      expect(keys).toContain(key);
    }
    expect(keys).toContain("shares_outstanding");
    expect(keys).not.toContain("face_value");
  });

  it("has one income section, not a Quarters section and a P&L section", () => {
    const ids = PAGE_SECTIONS.map((s) => s.id);
    expect(ids).toContain("income");
    expect(ids).not.toContain("quarters");
    expect(ids).not.toContain("profit-loss");
    // Growth is annual by definition, so it has its own home.
    expect(ids).toContain("growth");
  });
});

describe("column banding", () => {
  it("counts from the newest column so adding a period never reshades", () => {
    // Newest (last) column clear, the one before it banded.
    expect(isBanded(11, 12)).toBe(false);
    expect(isBanded(10, 12)).toBe(true);
    // One more period arrives: the same period keeps the same shade.
    expect(isBanded(12, 13)).toBe(false);
    expect(isBanded(11, 13)).toBe(true);
  });

  it("never bands two neighbours the same", () => {
    for (let i = 1; i < 20; i++) {
      expect(isBanded(i, 20)).not.toBe(isBanded(i - 1, 20));
    }
  });
});
