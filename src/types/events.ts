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
   * How the briefing was produced:
   * - "llm": AI-authored narrative (single pass, no mechanical verification
   *   since the July 2026 grounding rollback)
   * - "facts_only": deterministic fields only — the LLM call failed or the
   *   filing had too little text to summarize
   * - "llm_verified" / "structured": historical events from before the
   *   grounding rollback (verified narrative / programmatic Form 4 briefing)
   * Absent on the oldest events.
   */
  mode?: "llm" | "facts_only" | "llm_verified" | "structured";
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
