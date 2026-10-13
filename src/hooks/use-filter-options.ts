"use client";

import { useEffect, useState } from "react";
import type { FeedFilterOptions } from "@/types/api";
import type { SectorIndustries } from "@/lib/feed-filters";
import { publicApi } from "@/lib/api-client";

/** Fallback while GET /events/filters loads (mirrors the API's canonical list). */
const DEFAULT_EVENT_TYPES = [
  "Acquisition",
  "Material Agreement",
  "Earnings",
  "Bankruptcy",
  "Debt / Financing",
  "Restructuring",
  "Leadership Change",
  "Delisting",
  "Restatement",
  "Cybersecurity Incident",
  "Regulatory / Clinical",
];

export interface FilterOptions {
  /** Canonical event-type labels, minus "Other". */
  eventTypes: string[];
  /** Sector → industry tree; empty until it loads (or if it can't). */
  industries: SectorIndustries[];
  /** Display name for an industry key. */
  industryLabel: (key: string) => string | undefined;
}

// One fetch per session, shared by both rails, the mobile sheet and the
// toolbar's pills — the list changes when the company universe syncs,
// not while someone reads the feed.
let cached: Promise<FeedFilterOptions> | null = null;

function load(): Promise<FeedFilterOptions> {
  if (!cached) {
    cached = publicApi<FeedFilterOptions>("/events/filters").catch((err) => {
      cached = null; // let the next mount try again
      throw err;
    });
  }
  return cached;
}

function build(data: FeedFilterOptions | null): FilterOptions {
  const tree = data?.industry ?? [];
  const labels = new Map(tree.flatMap((n) => n.industries.map((i) => [i.key, i.label] as const)));
  return {
    eventTypes: data?.event_type?.length ? data.event_type : DEFAULT_EVENT_TYPES,
    industries: tree,
    industryLabel: (key) => labels.get(key),
  };
}

/**
 * The feed's filter options (GET /events/filters, public). Until it loads
 * — or if it fails — event types fall back to the built-in list and the
 * industry tree is empty, so sectors still work on their own.
 */
export function useFilterOptions(): FilterOptions {
  const [options, setOptions] = useState<FilterOptions>(() => build(null));
  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setOptions(build(data));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return options;
}
