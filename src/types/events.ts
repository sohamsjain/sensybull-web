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
  received_at: string;
}
