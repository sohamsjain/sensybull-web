export interface Briefing {
  headline: string;
  summary: string;
  primary_event_type: string;
  significance: "High" | "Medium" | "Low";
  sentiment: "Positive" | "Negative" | "Neutral" | "Mixed";
  investor_takeaway: string;
  catalysts: Catalyst[];
  deal_terms: Record<string, string>;
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

/** Deterministic financials snapshot used by an analysis playbook. */
export interface FundamentalsSnapshot {
  as_of?: string | null;
  metrics?: Record<string, number | null>;
  missing?: string[];
}

/** Second-order, company-specific analysis attached to a filing. */
export interface EventAnalysis {
  status: string;
  metrics: {
    playbook?: string;
    ratios?: Record<string, number | null>;
    lines?: string[];
    snapshot?: FundamentalsSnapshot;
  };
  insight: {
    insight: string;
    bull_points: string[];
    bear_points: string[];
    confidence: "low" | "medium" | "high";
    caveats: string[];
  };
  fundamentals_as_of: string | null;
  thesis_revision_id: string | null;
}

export type AnalysisStatus = "pending" | "done" | "failed" | "skipped";

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
  items: FilingItem[];
  exhibits: Exhibit[];
  briefing: Briefing | null;
  event_types: string[];
  catalysts: Catalyst[];
  analysis_status?: AnalysisStatus;
  analysis?: EventAnalysis | null;
  received_at: string;
}

/** One entry in a company's append-only, evolving investment thesis. */
export interface ThesisRevision {
  id: string;
  version: number;
  narrative: string;
  change_summary: string | null;
  points: {
    bull?: string[];
    bear?: string[];
    uncertainties?: string[];
  };
  as_of: string | null;
  filing_event_id: string | null;
  created_at: string | null;
}

export interface CompanyThesis {
  company_id: string;
  ticker: string | null;
  name: string;
  current: ThesisRevision | null;
  revisions: ThesisRevision[];
}
