/**
 * One quote from the source document, proving a claim in the briefing.
 *
 * The quote is verbatim source text: ingest matches the model's citation
 * against the filing and stores the span it matched, not what the model
 * typed (services/ingest/evidence.py). `url` opens that document scrolled
 * to the passage with it highlighted, using a browser text fragment —
 * `highlighted` is false when no unambiguous fragment could be built, or
 * on a browser without text-fragment support the link still opens the
 * right document at the top.
 */
export interface Evidence {
  /** Verbatim text from the filing, whitespace-normalized. */
  quote: string;
  /** The briefing label this quote supports; "" when unattributed. */
  event_type: string;
  /** Where in the filing it sits: "Item 5.02", "EX-99.1", "the filing". */
  source: string;
  /** The document the quote came from — not the EDGAR index page. */
  doc_url: string;
  /** doc_url plus a text fragment when one exists; "" if unlinkable. */
  url: string;
  /** Whether `url` scrolls to and highlights the quote. */
  highlighted: boolean;
}

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
  /**
   * Verified supporting quotes. Absent on facts_only briefings and on
   * every event stored before evidence shipped — read it through
   * `evidenceEntries()` in `src/lib/evidence.ts`.
   */
  evidence?: Evidence[];
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
  /** SEC form type ("8-K", "8-K/A", historical forms) or "PR" (press release) */
  signal_type: string;
  /** "edgar" for SEC filings, wire name ("globenewswire", "prnewswire", …)
   *  for press releases. Absent on cached payloads from before PRs shipped. */
  source?: string;
  /** Wire-reported issuing organization (press releases only). */
  issuer_name?: string | null;
  /** Set on a PR event once its follow-up SEC filing arrives (backfill) —
   *  render a "Read the filing" link alongside the press-release link. */
  filing_url?: string | null;
  related_accession_number?: string | null;
  ticker: string | null;
  company_name: string;
  company_id: string | null;
  cik: string;
  filing_date: string | null;
  /** Source-document link: EDGAR index URL for filings, article URL for PRs */
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
