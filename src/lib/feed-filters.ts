/**
 * The feed's filters: one shape for the URL, the API query, saved views,
 * and the live socket.
 *
 * The API applies these in SQL (sensybull-api
 * `app/services/feed_filters.py`), so a page of results is a page of
 * matches. Live socket events arrive unfiltered, so `matchesFeedFilters`
 * applies the same predicates to them — keep the sector list, the cap
 * bucket bounds and the predicate rules in sync with that module.
 */

import type { FilingEvent } from "@/types/events";
import { isImportant } from "@/lib/event-actions";

export type FeedScope = "mine" | "all";
export type CapBucket = "mega" | "large" | "mid" | "small" | "micro";
export type FeedSource = "sec" | "pr";
export type Sentiment = "Positive" | "Negative" | "Mixed" | "Neutral";
export type MoveFilter = "any" | "up" | "down";
export type TimeWindow = "1d" | "7d" | "30d" | "90d";

export interface FeedFilters {
  important: boolean;
  eventTypes: string[];
  sectors: string[];
  caps: CapBucket[];
  source: FeedSource | null;
  sentiments: Sentiment[];
  moved: MoveFilter | null;
  since: TimeWindow | null;
  q: string;
}

export const EMPTY_FILTERS: FeedFilters = {
  important: false,
  eventTypes: [],
  sectors: [],
  caps: [],
  source: null,
  sentiments: [],
  moved: null,
  since: null,
  q: "",
};

/** FMP's sector taxonomy, as the API stores it on each company. */
export const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Communication Services",
  "Industrials",
  "Energy",
  "Basic Materials",
  "Real Estate",
  "Utilities",
] as const;

/** Market-cap buckets, largest first. `min` inclusive, `max` exclusive. */
export const CAP_BUCKETS: {
  key: CapBucket;
  label: string;
  range: string;
  min: number;
  max: number | null;
}[] = [
  { key: "mega", label: "Mega", range: "$200B+", min: 200e9, max: null },
  { key: "large", label: "Large", range: "$10B–200B", min: 10e9, max: 200e9 },
  { key: "mid", label: "Mid", range: "$2B–10B", min: 2e9, max: 10e9 },
  { key: "small", label: "Small", range: "$300M–2B", min: 300e6, max: 2e9 },
  { key: "micro", label: "Micro", range: "Under $300M", min: 0, max: 300e6 },
];

export const SOURCES: { key: FeedSource; label: string }[] = [
  { key: "sec", label: "SEC filings" },
  { key: "pr", label: "Press releases" },
];

export const SENTIMENTS: Sentiment[] = ["Positive", "Negative", "Mixed", "Neutral"];

export const MOVES: { key: MoveFilter; label: string; short: string }[] = [
  { key: "any", label: "Moved the stock", short: "Moved" },
  { key: "up", label: "Moved it up", short: "Moved up" },
  { key: "down", label: "Moved it down", short: "Moved down" },
];

export const WINDOWS: { key: TimeWindow; label: string; days: number }[] = [
  { key: "1d", label: "24h", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

const CAP_KEYS = new Set<string>(CAP_BUCKETS.map((b) => b.key));
const SECTOR_SET = new Set<string>(SECTORS);
const SENTIMENT_SET = new Set<string>(SENTIMENTS);
const MOVE_KEYS = new Set<string>(MOVES.map((m) => m.key));
const WINDOW_KEYS = new Set<string>(WINDOWS.map((w) => w.key));

/** The bucket a market cap (in dollars) falls in; null when unknown. */
export function capBucket(marketCap: number | null | undefined): CapBucket | null {
  if (marketCap == null || !(marketCap > 0)) return null;
  for (const b of CAP_BUCKETS) {
    if (marketCap >= b.min && (b.max === null || marketCap < b.max)) return b.key;
  }
  return null;
}

/** "$1.2T", "$48B", "$730M" — the cap as a reader says it. */
export function formatMarketCap(marketCap: number | null | undefined): string | null {
  if (marketCap == null || !(marketCap > 0)) return null;
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
  ];
  for (const [size, suffix] of units) {
    if (marketCap >= size) {
      const n = marketCap / size;
      return `$${n >= 100 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, "")}${suffix}`;
    }
  }
  return `$${Math.round(marketCap / 1e3)}K`;
}

// ── predicates (live events) ──────────────────────────────────────────

/** True when the event carries any of the given category labels. */
function hasEventType(e: FilingEvent, types: string[]): boolean {
  return types.some(
    (t) => e.event_types?.includes(t) || e.briefing?.primary_event_type === t
  );
}

/** Matches the search box against the ticker, the name, and the headline. */
export function matchesSearch(e: FilingEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    !!e.ticker?.toLowerCase().includes(q) ||
    !!e.company_name?.toLowerCase().includes(q) ||
    !!e.briefing?.headline?.toLowerCase().includes(q)
  );
}

function movedMatches(e: FilingEvent, moved: MoveFilter): boolean {
  return Object.values(e.price_reactions ?? {}).some(
    (r) =>
      r.explosive &&
      r.pct != null &&
      (moved === "any" || (moved === "up" ? r.pct > 0 : r.pct < 0))
  );
}

/**
 * Does a live event belong in a list filtered this way? The same rules the
 * API applies in SQL. `now` is injectable for tests.
 */
export function matchesFeedFilters(
  e: FilingEvent,
  f: FeedFilters,
  now: number = Date.now()
): boolean {
  if (f.important && !isImportant(e)) return false;
  if (f.eventTypes.length && !hasEventType(e, f.eventTypes)) return false;
  if (f.sectors.length && !(e.sector && f.sectors.includes(e.sector))) return false;
  if (f.caps.length) {
    const bucket = capBucket(e.market_cap);
    if (!bucket || !f.caps.includes(bucket)) return false;
  }
  if (f.source && (e.signal_type === "PR" ? "pr" : "sec") !== f.source) return false;
  if (f.sentiments.length) {
    const s = e.briefing?.sentiment;
    if (!s || !f.sentiments.includes(s)) return false;
  }
  if (f.moved && !movedMatches(e, f.moved)) return false;
  if (f.since) {
    const days = WINDOWS.find((w) => w.key === f.since)?.days ?? 0;
    const at = Date.parse(e.received_at || e.filing_date || "");
    if (!Number.isNaN(at) && at < now - days * 86_400_000) return false;
  }
  return matchesSearch(e, f.q);
}

// ── serialization ─────────────────────────────────────────────────────

function list(value: string | null | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((v) => v.trim()).filter(Boolean))];
}

/**
 * Read filters from URL params. Unknown values are dropped rather than
 * trusted — a stale shared link shouldn't 400 the whole feed.
 */
export function filtersFromParams(
  params: { get(key: string): string | null },
  knownEventTypes?: string[]
): FeedFilters {
  const types = list(params.get("t"));
  const moved = params.get("m");
  const since = params.get("d");
  const source = params.get("src");
  return {
    important: params.get("f") === "important",
    eventTypes: knownEventTypes
      ? types.filter((t) => knownEventTypes.includes(t))
      : types,
    sectors: list(params.get("sec")).filter((s) => SECTOR_SET.has(s)),
    caps: list(params.get("cap")).filter((c) => CAP_KEYS.has(c)) as CapBucket[],
    source: source === "sec" || source === "pr" ? source : null,
    sentiments: list(params.get("snt")).filter((s) =>
      SENTIMENT_SET.has(s)
    ) as Sentiment[],
    moved: moved && MOVE_KEYS.has(moved) ? (moved as MoveFilter) : null,
    since: since && WINDOW_KEYS.has(since) ? (since as TimeWindow) : null,
    q: params.get("q") ?? "",
  };
}

/** Write filters into URL params (short keys; `f`, `t`, `q` predate this). */
export function filtersToParams(f: FeedFilters, params: URLSearchParams): void {
  if (f.important) params.set("f", "important");
  if (f.eventTypes.length) params.set("t", f.eventTypes.join(","));
  if (f.sectors.length) params.set("sec", f.sectors.join(","));
  if (f.caps.length) params.set("cap", f.caps.join(","));
  if (f.source) params.set("src", f.source);
  if (f.sentiments.length) params.set("snt", f.sentiments.join(","));
  if (f.moved) params.set("m", f.moved);
  if (f.since) params.set("d", f.since);
  if (f.q) params.set("q", f.q);
}

/** The API's query string for these filters (feed and facet endpoints). */
export function filtersToQuery(f: FeedFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.important) p.set("important", "1");
  if (f.eventTypes.length) p.set("event_type", f.eventTypes.join(","));
  if (f.sectors.length) p.set("sector", f.sectors.join(","));
  if (f.caps.length) p.set("cap", f.caps.join(","));
  if (f.source) p.set("source", f.source);
  if (f.sentiments.length) p.set("sentiment", f.sentiments.join(","));
  if (f.moved) p.set("moved", f.moved);
  if (f.since) p.set("since", f.since);
  const q = f.q.trim();
  if (q) p.set("q", q);
  return p;
}

/** A saved view's stored filters (the API's canonical dict) → ours. */
export function filtersFromView(stored: Record<string, unknown>): {
  scope: FeedScope;
  filters: FeedFilters;
} {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const params = new URLSearchParams();
  filtersToParams(
    {
      important: stored.important === true,
      eventTypes: arr(stored.event_type),
      sectors: arr(stored.sector),
      caps: arr(stored.cap) as CapBucket[],
      source: str(stored.source) as FeedSource | null,
      sentiments: arr(stored.sentiment) as Sentiment[],
      moved: str(stored.moved) as MoveFilter | null,
      since: str(stored.since) as TimeWindow | null,
      q: str(stored.q) ?? "",
    },
    params
  );
  return {
    scope: stored.scope === "mine" ? "mine" : "all",
    filters: filtersFromParams(params),
  };
}

/** Ours → the dict a saved view stores (the API re-validates it). */
export function filtersToView(
  scope: FeedScope,
  f: FeedFilters
): Record<string, unknown> {
  const out: Record<string, unknown> = { scope };
  if (f.important) out.important = true;
  if (f.eventTypes.length) out.event_type = f.eventTypes;
  if (f.sectors.length) out.sector = f.sectors;
  if (f.caps.length) out.cap = f.caps;
  if (f.source) out.source = f.source;
  if (f.sentiments.length) out.sentiment = f.sentiments;
  if (f.moved) out.moved = f.moved;
  if (f.since) out.since = f.since;
  if (f.q.trim()) out.q = f.q.trim();
  return out;
}

/** Two filter sets select the same updates (order-insensitive). */
export function sameFilters(a: FeedFilters, b: FeedFilters): boolean {
  const key = (f: FeedFilters) => {
    const p = filtersToQuery({
      ...f,
      eventTypes: [...f.eventTypes].sort(),
      sectors: [...f.sectors].sort(),
      caps: [...f.caps].sort(),
      sentiments: [...f.sentiments].sort(),
    });
    p.sort();
    return p.toString();
  };
  return key(a) === key(b);
}

/** How many filter dimensions are narrowing the feed (search excluded). */
export function activeFilterCount(f: FeedFilters): number {
  return (
    (f.important ? 1 : 0) +
    (f.eventTypes.length ? 1 : 0) +
    (f.sectors.length ? 1 : 0) +
    (f.caps.length ? 1 : 0) +
    (f.source ? 1 : 0) +
    (f.sentiments.length ? 1 : 0) +
    (f.moved ? 1 : 0) +
    (f.since ? 1 : 0)
  );
}

export function hasAnyFilter(f: FeedFilters): boolean {
  return activeFilterCount(f) > 0 || f.q.trim() !== "";
}

/** One removable pill per active filter, for the toolbar summary. */
export interface FilterPill {
  key: string;
  label: string;
  remove: (f: FeedFilters) => FeedFilters;
}

function joined(values: string[], max = 2): string {
  return values.length <= max
    ? values.join(", ")
    : `${values.slice(0, max).join(", ")} +${values.length - max}`;
}

export function filterPills(f: FeedFilters): FilterPill[] {
  const pills: FilterPill[] = [];
  if (f.important)
    pills.push({ key: "important", label: "Important", remove: (x) => ({ ...x, important: false }) });
  if (f.since)
    pills.push({
      key: "since",
      label: `Last ${WINDOWS.find((w) => w.key === f.since)?.label}`,
      remove: (x) => ({ ...x, since: null }),
    });
  if (f.moved)
    pills.push({
      key: "moved",
      label: MOVES.find((m) => m.key === f.moved)!.short,
      remove: (x) => ({ ...x, moved: null }),
    });
  if (f.eventTypes.length)
    pills.push({ key: "type", label: joined(f.eventTypes), remove: (x) => ({ ...x, eventTypes: [] }) });
  if (f.sectors.length)
    pills.push({ key: "sector", label: joined(f.sectors), remove: (x) => ({ ...x, sectors: [] }) });
  if (f.caps.length) {
    const labels = CAP_BUCKETS.filter((b) => f.caps.includes(b.key)).map((b) => b.label);
    pills.push({
      key: "cap",
      label: `${joined(labels, 3)} cap`,
      remove: (x) => ({ ...x, caps: [] }),
    });
  }
  if (f.source)
    pills.push({
      key: "source",
      label: SOURCES.find((s) => s.key === f.source)!.label,
      remove: (x) => ({ ...x, source: null }),
    });
  if (f.sentiments.length)
    pills.push({
      key: "sentiment",
      label: `${joined(f.sentiments)} tone`,
      remove: (x) => ({ ...x, sentiments: [] }),
    });
  return pills;
}

/** Toggle a value in a multi-select list. */
export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

/**
 * One-click starting points shown when no filter is on. Each is an
 * ordinary filter set — once applied it reads back as normal pills, so a
 * preset teaches the panel rather than hiding it.
 */
export const PRESETS: { key: string; label: string; filters: Partial<FeedFilters> }[] = [
  { key: "movers", label: "Moved the stock", filters: { moved: "any" } },
  {
    key: "deals",
    label: "Deals",
    filters: { eventTypes: ["Acquisition", "Material Agreement"] },
  },
  {
    key: "clinical",
    label: "Biotech readouts",
    filters: { sectors: ["Healthcare"], eventTypes: ["Regulatory / Clinical"] },
  },
  {
    key: "smallcaps",
    label: "Small caps",
    filters: { caps: ["small", "micro"] },
  },
  {
    key: "distress",
    label: "Distress",
    filters: { eventTypes: ["Bankruptcy", "Delisting", "Restatement", "Restructuring"] },
  },
  {
    key: "leadership",
    label: "CEO & CFO changes",
    filters: { eventTypes: ["Leadership Change"], caps: ["mega", "large", "mid"] },
  },
];

export function applyPreset(f: FeedFilters, preset: Partial<FeedFilters>): FeedFilters {
  return { ...EMPTY_FILTERS, q: f.q, ...preset };
}
