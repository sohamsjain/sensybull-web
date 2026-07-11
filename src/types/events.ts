export interface Briefing {
  headline: string;
  summary: string;
  primary_event_type: string;
  significance: "High" | "Medium" | "Low";
  sentiment: "Positive" | "Negative" | "Neutral" | "Mixed";
  investor_takeaway: string;
  catalysts: Catalyst[];
  deal_terms: Record<string, string>;
  /**
   * Provenance of the briefing content:
   * - "llm_verified": AI narrative that passed grounding checks against the filing text
   * - "facts_only": deterministic fields only — the AI narrative was withheld
   *   because it could not be verified (or there was too little text to summarize)
   * - "structured": built programmatically from structured data (Form 4)
   * Absent on events ingested before verification shipped.
   */
  mode?: "llm_verified" | "facts_only" | "structured";
}

export interface Catalyst {
  event: string;
  date: string | null;
}

export interface FilingItem {
  number: string;
  title: string;
  tier: number;
  category: string;
  text: string;
}

export interface Exhibit {
  type: string;
  description: string;
  url: string;
}

/** One measured price move after a filing (backend PriceReaction row). */
export interface PriceReactionPoint {
  /** % change vs the pre-filing baseline price */
  pct: number | null;
  price: number | null;
  /** When the measurement actually printed — may lag the nominal interval
   *  for after-hours filings (resolves to the next available trade) */
  measured_at: string | null;
  /** |move| >= 2× ATR(14) */
  explosive: boolean;
}

/** Interval keys: "5m" | "15m" | "30m" | "1h" | "1d" | "1w" */
export type PriceReactions = Record<string, PriceReactionPoint>;

export interface FilingEvent {
  id: string;
  edgar_id: string;
  signal_type: string;
  ticker: string | null;
  company_name: string;
  company_id: string | null;
  cik: string;
  filing_date: string | null;
  edgar_url: string | null;
  accession_number: string | null;
  max_tier: 1 | 2 | 3;
  /** True when this is the kind of event that typically moves the stock.
   *  Backs the feed's All/Important toggle. Absent on cached payloads from
   *  before the flag shipped — use isImportant() in lib/event-actions. */
  important?: boolean;
  items: FilingItem[];
  exhibits: Exhibit[];
  briefing: Briefing | null;
  event_types: string[];
  catalysts: Catalyst[];
  received_at: string;
  market_cap?: number | null;
  price_reactions?: PriceReactions;
  explosive?: boolean;
}
