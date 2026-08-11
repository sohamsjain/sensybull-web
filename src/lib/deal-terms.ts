import { formatDealValue } from "@/lib/utils";

/**
 * Presentation rules for the briefing's `deal_terms` block.
 *
 * The API normalizes deal terms as it stores them, but events persisted
 * before that landed still carry the model's raw casing ("definitive
 * agreement signed", "stock", "spac merger"), so the same rules are applied
 * again at render time. Both readers of a deal-terms map — the Deal Terms
 * panel and the copy-for-AI prompt — go through here so they agree.
 *
 * Mirrors sensybull-api `services/api/app/utils/deal_terms.py` — keep the
 * two in sync.
 */

// Canonical display order so the same deal renders identically everywhere,
// regardless of the key order the briefing JSON arrived in.
const KEY_PRIORITY = [
  "deal_value",
  "deal_type",
  "price_per_share",
  "consideration_type",
  "counterparty",
  "share_count",
  "deal_status",
];

// Words that stay lowercase inside a title-cased value (never at the edges).
const SMALL_WORDS = new Set(
  ("a an and as at but by for from in into nor of on onto or per the to up " +
    "via vs with").split(" ")
);

// Past this many words a value is prose, not a label: title casing it would
// read as a headline. Deal statuses ("definitive agreement signed") and deal
// types ("stock-for-stock merger") sit well under the limit.
const TITLE_CASE_WORD_LIMIT = 6;

const EDGE_PUNCT = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

/** A stringified container that leaked through ingest — never reformat it. */
const MALFORMED = /[{}[\]]/;

export type DealTermEntry = {
  key: string;
  label: string;
  value: string;
};

/**
 * Display-ready, canonically ordered entries for a deal-terms map.
 * Keys are normalized first, so a legacy "Deal Value" sorts and labels the
 * same as a stored "deal_value".
 */
export function dealTermEntries(
  terms: Record<string, string> | null | undefined
): DealTermEntry[] {
  if (!terms) return [];
  const seen = new Set<string>();
  const entries: DealTermEntry[] = [];

  for (const [rawKey, rawValue] of Object.entries(terms)) {
    const key = normalizeTermKey(rawKey);
    if (!key || seen.has(key) || rawValue == null || rawValue === "") continue;
    const value = formatDealTermValue(String(rawValue));
    if (!value) continue;
    seen.add(key);
    entries.push({ key, label: dealTermLabel(key), value });
  }

  return entries.sort((a, b) => {
    const ra = keyRank(a.key);
    const rb = keyRank(b.key);
    return ra !== rb ? ra - rb : a.key.localeCompare(b.key);
  });
}

function keyRank(key: string): number {
  const i = KEY_PRIORITY.indexOf(key);
  return i === -1 ? KEY_PRIORITY.length : i;
}

/** Canonicalize a deal-term key to snake_case: "Deal Value" → "deal_value". */
export function normalizeTermKey(key: string): string {
  return key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^0-9a-zA-Z]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

/** Human label for a deal-term key: "price_per_share" → "Price per Share". */
export function dealTermLabel(key: string): string {
  return titleCaseTerm(normalizeTermKey(key).replace(/_/g, " "));
}

/** Title-case a value and add thousands separators to bare digit runs. */
export function formatDealTermValue(value: string): string {
  if (MALFORMED.test(value)) return value;
  return formatDealValue(titleCaseTerm(value));
}

/** True for values that read as figures and earn the heavier weight. */
export function isFinancialValue(value: string): boolean {
  return /^\$|%/.test(value.trim());
}

/**
 * Title case that leaves figures ("$2.5B", "45%", "Q4 2026") and anything
 * already carrying a capital ("SPAC", "Inc.") exactly as written. Values
 * long enough to be prose get sentence case instead — "Definitive Agreement
 * Signed" reads right, "The Board Approved The Transaction" does not.
 */
export function titleCaseTerm(value: string): string {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length > TITLE_CASE_WORD_LIMIT) {
    return [caseWord(words[0], true), ...words.slice(1)].join(" ");
  }
  const last = words.length - 1;
  return words
    .map((word, i) => caseWord(word, i === 0 || i === last))
    .join(" ");
}

/**
 * Case one whitespace-delimited word, compound segments included. Only the
 * first segment of a compound inherits the word's edge position: in
 * "stock-for-stock" the inner "for" is a small word wherever the word itself
 * sits, so it stays lowercase.
 */
function caseWord(word: string, edge: boolean): string {
  return word
    .split(/([-/])/)
    .map((part, i) =>
      part === "-" || part === "/" ? part : caseSegment(part, edge && i === 0)
    )
    .join("");
}

/**
 * Capitalize a single word segment, or return it untouched: when it carries
 * a digit (a figure, not a word), already has a capital of its own (an
 * acronym, a ticker, a proper name, "Inc."), or is a small word away from
 * the value's edges.
 */
function caseSegment(segment: string, edge: boolean): string {
  if (!segment) return segment;
  if (/\d/.test(segment)) return segment;
  if (/\p{Lu}/u.test(segment)) return segment;
  if (!edge && SMALL_WORDS.has(segment.replace(EDGE_PUNCT, "").toLowerCase())) {
    return segment;
  }
  const i = segment.search(/\p{L}/u);
  if (i === -1) return segment;
  return segment.slice(0, i) + segment[i].toUpperCase() + segment.slice(i + 1);
}
