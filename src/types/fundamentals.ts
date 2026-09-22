/**
 * Shapes served by `GET /fundamentals/<symbol>` and `/documents`
 * (sensybull-api `services/fundamentals/payload.py`). See API_CHANGES.md
 * 2026-09-18 for the contract and the column-oriented table convention.
 */

export type FundamentalsStatus = "ready" | "building" | "unavailable" | "empty";

export interface FundamentalsCompany {
  id: string;
  ticker: string;
  name: string;
  cik: string | null;
  exchange: string | null;
  industry: string | null;
  sector: string | null;
  description: string | null;
  website: string | null;
  ceo: string | null;
  employees: number | null;
  ipo_date: string | null;
  is_adr: boolean;
  fiscal_year_end_month: number | null;
}

export interface FundamentalsRatios {
  market_cap: number | null;
  price: number | null;
  high_52w: number | null;
  low_52w: number | null;
  pe_ttm: number | null;
  book_value_ps: number | null;
  dividend_yield: number | null;
  roce: number | null;
  roe: number | null;
  shares_outstanding: number | null;
  pb: number | null;
  ev: number | null;
  ev_ebitda: number | null;
  debt_to_equity: number | null;
  interest_coverage: number | null;
  opm_ttm: number | null;
  eps_ttm: number | null;
  revenue_ttm: number | null;
  net_income_ttm: number | null;
  fcf_ttm: number | null;
  dividends_ttm_ps: number | null;
  sales_cagr_3y: number | null;
  profit_cagr_3y: number | null;
  /** True when no four consecutive quarters exist and the latest FY stood in. */
  ttm_is_fy?: boolean;
}

/** A growth grid: percentage per window, null when the history is too short. */
export type GrowthGrid = Record<string, number | null>;

export interface FundamentalsGrowth {
  sales?: GrowthGrid;
  profit?: GrowthGrid;
  price?: GrowthGrid;
  roe?: GrowthGrid;
}

export interface FundamentalsAnalysis {
  pros: string[];
  cons: string[];
  key_points: string[];
}

export interface PeriodMeta {
  /** ISO period end, or "ttm" for the synthetic trailing column. */
  key: string;
  /** "Sep 2025", "TTM" */
  label: string;
  fiscal_year: number | null;
  fiscal_period: string | null;
  quality_flags: string[];
}

/** One value per period, oldest → newest. */
export type RowValues = (number | null)[];

export interface StatementTable {
  periods: PeriodMeta[];
  rows: Record<string, RowValues>;
  /**
   * Expandable detail. Flat for the income statement (each key is a
   * percentage row under Expenses); nested parent → child → values for the
   * balance sheet and cash flow.
   */
  breakdown?: Record<string, RowValues | Record<string, RowValues>>;
}

export interface StatementSet {
  income: StatementTable;
  balance: StatementTable;
  cashflow: StatementTable;
  ratios: StatementTable;
}

export interface FundamentalsPayload {
  status: FundamentalsStatus;
  company: FundamentalsCompany;
  as_of: {
    latest_annual_end: string | null;
    latest_quarter_end: string | null;
    last_synced_at: string | null;
    price_updated_at: string | null;
  };
  ratios: Partial<FundamentalsRatios>;
  growth: FundamentalsGrowth;
  analysis: FundamentalsAnalysis;
  /**
   * The same four statements at both granularities, so each one can offer
   * a Quarterly/Annual switch in place rather than living in two sections.
   * Only `annual.income` carries a TTM column and a dividend-payout row.
   */
  quarterly: StatementSet;
  annual: StatementSet;
  table_defaults: { annual_years: number; quarters: number };
}

export interface FilingDocument {
  form: string;
  filed: string | null;
  period: string | null;
  description: string | null;
  url: string;
}

export interface FundamentalsDocuments {
  symbol: string;
  cik: string | null;
  edgar_url: string | null;
  filings: {
    annual: FilingDocument[];
    quarterly: FilingDocument[];
    proxy: FilingDocument[];
    recent_8k_count: number;
  };
  filings_error: null | "edgar_unavailable";
  updates: {
    id: string;
    signal_type: string;
    source: string;
    filing_date: string | null;
    headline: string | null;
    important: boolean;
    url: string | null;
    event_types: string[];
  }[];
}
