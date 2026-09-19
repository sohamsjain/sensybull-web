/**
 * Row specs for the financial tables: order, label, how each row is
 * formatted, and which breakdown rows sit under it.
 *
 * Mirrors sensybull-api `services/fundamentals/rows.py`, which owns the
 * arithmetic. This file owns presentation only — a row key here must exist
 * there, and the API's JSON key order is not the display order (Flask
 * sorts keys), so order lives here. US balance sheets read Assets →
 * Liabilities → Equity, the way a 10-K prints them.
 */

export type RowFormat = "amount" | "percent" | "days" | "per_share";

export interface RowSpec {
  key: string;
  label: string;
  format: RowFormat;
  /** Rendered bold with a rule above: a subtotal or total. */
  emphasis?: boolean;
  /** Breakdown rows under this one (revealed by the "+" control). */
  children?: RowSpec[];
  /** Shorter label for narrow screens. */
  short?: string;
}

const expenseBreakdown: RowSpec[] = [
  { key: "cost_of_revenue_pct", label: "Cost of revenue %", format: "percent" },
  { key: "sga_pct", label: "SG&A %", format: "percent" },
  { key: "rnd_pct", label: "R&D %", format: "percent" },
  { key: "other_opex_pct", label: "Other operating %", format: "percent" },
];

/** Quarterly results and the annual P&L share these rows. */
export const INCOME_ROWS: RowSpec[] = [
  { key: "sales", label: "Sales", format: "amount", emphasis: true },
  { key: "expenses", label: "Expenses", format: "amount", children: expenseBreakdown },
  { key: "operating_profit", label: "Operating Profit", format: "amount", emphasis: true },
  { key: "opm_pct", label: "OPM %", format: "percent" },
  { key: "other_income", label: "Other Income", format: "amount" },
  { key: "interest", label: "Interest", format: "amount" },
  { key: "depreciation", label: "Depreciation", format: "amount" },
  { key: "profit_before_tax", label: "Profit before tax", format: "amount", emphasis: true },
  { key: "tax_pct", label: "Tax %", format: "percent" },
  { key: "net_profit", label: "Net Profit", format: "amount", emphasis: true },
  { key: "eps", label: "EPS in $", format: "per_share", short: "EPS" },
];

export const ANNUAL_INCOME_ROWS: RowSpec[] = [
  ...INCOME_ROWS,
  { key: "dividend_payout_pct", label: "Dividend Payout %", format: "percent" },
];

export const BALANCE_ROWS: RowSpec[] = [
  {
    key: "fixed_assets",
    label: "Fixed Assets",
    format: "amount",
    children: [
      { key: "ppe_net", label: "Property, plant & equipment", format: "amount" },
      { key: "goodwill", label: "Goodwill", format: "amount" },
      { key: "intangibles", label: "Intangibles", format: "amount" },
    ],
  },
  { key: "investments", label: "Investments", format: "amount" },
  {
    key: "other_assets",
    label: "Other Assets",
    format: "amount",
    children: [
      { key: "cash", label: "Cash & equivalents", format: "amount" },
      { key: "receivables", label: "Receivables", format: "amount" },
      { key: "inventory", label: "Inventory", format: "amount" },
      { key: "other_current_assets", label: "Other current assets", format: "amount" },
      { key: "other_noncurrent_assets", label: "Other non-current assets", format: "amount" },
    ],
  },
  { key: "total_assets", label: "Total Assets", format: "amount", emphasis: true },
  {
    key: "borrowings",
    label: "Borrowings",
    format: "amount",
    children: [
      { key: "short_term_debt", label: "Short-term debt", format: "amount" },
      { key: "long_term_debt", label: "Long-term debt", format: "amount" },
      { key: "capital_leases", label: "Lease obligations", format: "amount" },
    ],
  },
  {
    key: "other_liabilities",
    label: "Other Liabilities",
    format: "amount",
    children: [
      { key: "payables", label: "Accounts payable", format: "amount" },
      { key: "deferred_revenue", label: "Deferred revenue", format: "amount" },
      { key: "other_current_liabilities", label: "Other current liabilities", format: "amount" },
      { key: "minority_interest", label: "Minority interest", format: "amount" },
    ],
  },
  { key: "total_liabilities", label: "Total Liabilities", format: "amount", emphasis: true },
  { key: "equity_capital", label: "Equity Capital", format: "amount" },
  { key: "reserves", label: "Reserves", format: "amount" },
  { key: "total_equity", label: "Total Equity", format: "amount", emphasis: true },
];

export const CASHFLOW_ROWS: RowSpec[] = [
  {
    key: "cash_from_operating",
    label: "Cash from Operating Activity",
    short: "Operating",
    format: "amount",
    children: [
      { key: "net_income", label: "Net income", format: "amount" },
      { key: "depreciation_amortization", label: "Depreciation & amortization", format: "amount" },
      { key: "stock_based_compensation", label: "Stock-based compensation", format: "amount" },
    ],
  },
  {
    key: "cash_from_investing",
    label: "Cash from Investing Activity",
    short: "Investing",
    format: "amount",
    children: [
      { key: "capex", label: "Capital expenditure", format: "amount" },
      { key: "acquisitions", label: "Acquisitions", format: "amount" },
    ],
  },
  {
    key: "cash_from_financing",
    label: "Cash from Financing Activity",
    short: "Financing",
    format: "amount",
    children: [
      { key: "debt_issued", label: "Net debt issued", format: "amount" },
      { key: "debt_repaid", label: "Debt repaid", format: "amount" },
      { key: "buybacks", label: "Share buybacks", format: "amount" },
      { key: "dividends_paid", label: "Dividends paid", format: "amount" },
    ],
  },
  { key: "net_cash_flow", label: "Net Cash Flow", format: "amount", emphasis: true },
  { key: "free_cash_flow", label: "Free Cash Flow", format: "amount" },
];

export const RATIO_ROWS: RowSpec[] = [
  { key: "debtor_days", label: "Debtor Days", format: "days" },
  { key: "inventory_days", label: "Inventory Days", format: "days" },
  { key: "days_payable", label: "Days Payable", format: "days" },
  { key: "cash_conversion_cycle", label: "Cash Conversion Cycle", format: "days" },
  { key: "working_capital_days", label: "Working Capital Days", format: "days" },
  { key: "roce_pct", label: "ROCE %", format: "percent" },
];

/** The nine header ratios, in grid order. */
export type HeaderRatioKey =
  | "market_cap"
  | "price"
  | "high_low"
  | "pe_ttm"
  | "book_value_ps"
  | "dividend_yield"
  | "roce"
  | "roe"
  | "shares_outstanding"
  | "pb"
  | "ev"
  | "ev_ebitda"
  | "debt_to_equity"
  | "interest_coverage"
  | "opm_ttm"
  | "eps_ttm"
  | "fcf_ttm"
  | "sales_cagr_3y"
  | "profit_cagr_3y";

export interface HeaderRatioSpec {
  key: HeaderRatioKey;
  label: string;
  /** What the number means, for the title attribute. */
  hint: string;
}

export const DEFAULT_HEADER_RATIOS: HeaderRatioSpec[] = [
  { key: "market_cap", label: "Market Cap", hint: "Shares outstanding × last price" },
  { key: "price", label: "Current Price", hint: "Last trade, refreshed every minute while the page is open" },
  { key: "high_low", label: "High / Low", hint: "52-week high and low close" },
  { key: "pe_ttm", label: "Stock P/E", hint: "Price ÷ diluted EPS over the trailing four quarters" },
  { key: "book_value_ps", label: "Book Value", hint: "Shareholders' equity ÷ shares outstanding, per share" },
  { key: "dividend_yield", label: "Dividend Yield", hint: "Dividends per share over the last 12 months ÷ price" },
  { key: "roce", label: "ROCE", hint: "EBIT ÷ (total assets − current liabilities), latest fiscal year" },
  { key: "roe", label: "ROE", hint: "Net income ÷ average shareholders' equity, latest fiscal year" },
  { key: "shares_outstanding", label: "Shares Outstanding", hint: "From the latest SEC cover page" },
];

/** Growth grids under the P&L, each read left → right oldest window first. */
export const GROWTH_GRIDS: {
  key: "sales" | "profit" | "price" | "roe";
  title: string;
  windows: { key: string; label: string }[];
}[] = [
  {
    key: "sales",
    title: "Compounded Sales Growth",
    windows: [
      { key: "10y", label: "10 Years" },
      { key: "5y", label: "5 Years" },
      { key: "3y", label: "3 Years" },
      { key: "ttm", label: "TTM" },
    ],
  },
  {
    key: "profit",
    title: "Compounded Profit Growth",
    windows: [
      { key: "10y", label: "10 Years" },
      { key: "5y", label: "5 Years" },
      { key: "3y", label: "3 Years" },
      { key: "ttm", label: "TTM" },
    ],
  },
  {
    key: "price",
    title: "Stock Price CAGR",
    windows: [
      { key: "10y", label: "10 Years" },
      { key: "5y", label: "5 Years" },
      { key: "3y", label: "3 Years" },
      { key: "1y", label: "1 Year" },
    ],
  },
  {
    key: "roe",
    title: "Return on Equity",
    windows: [
      { key: "10y", label: "10 Years" },
      { key: "5y", label: "5 Years" },
      { key: "3y", label: "3 Years" },
      { key: "last", label: "Last Year" },
    ],
  },
];

/** Sections of the page, in order, for the sticky sub-nav. */
export const PAGE_SECTIONS: { id: string; label: string }[] = [
  { id: "analysis", label: "Analysis" },
  { id: "quarters", label: "Quarters" },
  { id: "profit-loss", label: "Profit & Loss" },
  { id: "balance-sheet", label: "Balance Sheet" },
  { id: "cash-flow", label: "Cash Flow" },
  { id: "ratios", label: "Ratios" },
  { id: "documents", label: "Documents" },
];

/** Every row key the tables read, for the contract test against the API. */
export function allRowKeys(specs: RowSpec[]): string[] {
  return specs.flatMap((s) => [s.key, ...(s.children ?? []).map((c) => c.key)]);
}
