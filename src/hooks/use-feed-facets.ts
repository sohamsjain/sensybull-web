"use client";

import { useEffect, useState } from "react";
import type { FeedFacets } from "@/types/api";
import { api } from "@/lib/api-client";
import { filtersToQuery, type FeedFilters, type FeedScope } from "@/lib/feed-filters";

/** Toggling several chips in a row makes one request, not five. */
const DEBOUNCE_MS = 200;

/**
 * Per-option counts for the filter panel (GET /events/facets): each option
 * counted with every other active filter applied, so the panel can say
 * what a click would return before the reader makes it.
 *
 * Only fetched while `enabled` (the panel is open). Counts are an aid, not
 * content: on failure the panel simply shows none, and the last good
 * answer stays up while the next one loads.
 */
export function useFeedFacets(
  scope: FeedScope | null,
  filters: FeedFilters,
  enabled: boolean
): FeedFacets | null {
  const [facets, setFacets] = useState<FeedFacets | null>(null);
  const query = filtersToQuery(filters);
  if (scope) query.set("scope", scope);
  const qs = query.toString();

  useEffect(() => {
    if (!enabled || !scope) return;
    let cancelled = false;
    const t = setTimeout(() => {
      api<FeedFacets>(`/events/facets?${qs}`)
        .then((data) => {
          if (!cancelled) setFacets(data);
        })
        .catch(() => {
          if (!cancelled) setFacets(null);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [enabled, scope, qs]);

  return enabled ? facets : null;
}
