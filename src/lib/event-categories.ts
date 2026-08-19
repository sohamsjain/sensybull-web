/**
 * The simple event categories the reader sees.
 *
 * The backend classifies each filing against a three-tier taxonomy of ~120
 * specific events ("ceo_departure", "covenant_violation") and collapses the
 * answer onto the taxonomy's top tier before publishing. That top tier is
 * this list — one plain category per update, never the tiers behind it.
 * Mirrors services/ingest/taxonomy.py PRIMARY_LABELS and the API's
 * GET /events/types, which is the source of truth at runtime; this copy is
 * the fallback while that request is in flight.
 */
export const EVENT_CATEGORIES = [
  "Leadership & Governance",
  "Financial Results",
  "Strategic Transactions",
  "Capital & Financing",
  "Operations & Strategy",
  "Risk Events",
  "Regulatory & Compliance",
  "Shareholder Activity",
  "Other",
] as const;

/**
 * Labels used before the taxonomy shipped, mapped to the category each one
 * folds into. Historical events keep their original labels forever, so
 * without this every filter chip would show an empty feed until enough new
 * events accumulated. Mirrors services/ingest/taxonomy.py LEGACY_LABELS and
 * the API's LEGACY_EVENT_TYPES in routes/events.py — keep the three in sync.
 */
const LEGACY_CATEGORIES: Record<string, string> = {
  Acquisition: "Strategic Transactions",
  "Material Agreement": "Operations & Strategy",
  Earnings: "Financial Results",
  Bankruptcy: "Risk Events",
  "Debt / Financing": "Capital & Financing",
  Restructuring: "Operations & Strategy",
  "Leadership Change": "Leadership & Governance",
  Delisting: "Regulatory & Compliance",
  Restatement: "Financial Results",
  "Cybersecurity Incident": "Risk Events",
  "Regulatory / Clinical": "Operations & Strategy",
};

/** A stored label as its current category (unchanged if already current). */
export function toCurrentCategory(label: string): string {
  return LEGACY_CATEGORIES[label] ?? label;
}

/**
 * The category to display for an event, or null when there is nothing worth
 * showing ("Other", or an unclassified event). Legacy labels are mapped
 * forward so the feed doesn't mix two vocabularies in one column.
 */
export function eventCategory(
  briefing: { primary_event_type?: string } | null | undefined
): string | null {
  const label = briefing?.primary_event_type;
  if (!label) return null;
  const current = toCurrentCategory(label);
  return current === "Other" ? null : current;
}
