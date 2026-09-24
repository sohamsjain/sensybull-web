"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedView } from "@/types/api";
import { api, ApiError } from "@/lib/api-client";
import { filtersToView, type FeedFilters, type FeedScope } from "@/lib/feed-filters";

const NO_VIEWS: FeedView[] = [];

/**
 * The reader's saved feed views (`/feed/views`). Signed-in only — pass
 * `enabled = false` for guests and the hook stays empty without asking.
 *
 * Mutations throw on failure (with the API's message for a 400/409, e.g. a
 * duplicate name) so the caller can put it in a toast; the list is only
 * changed once the server has agreed.
 */
export function useFeedViews(enabled: boolean) {
  const [views, setViews] = useState<FeedView[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    api<{ views: FeedView[] }>("/feed/views")
      .then((data) => {
        if (!cancelled) setViews(data.views || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const create = useCallback(
    async (name: string, scope: FeedScope, filters: FeedFilters) => {
      const data = await api<{ view: FeedView }>("/feed/views", {
        method: "POST",
        body: JSON.stringify({ name, filters: filtersToView(scope, filters) }),
      });
      setViews((prev) => [...prev, data.view]);
      return data.view;
    },
    []
  );

  const update = useCallback(
    async (id: string, scope: FeedScope, filters: FeedFilters) => {
      const data = await api<{ view: FeedView }>(`/feed/views/${id}`, {
        method: "PUT",
        body: JSON.stringify({ filters: filtersToView(scope, filters) }),
      });
      setViews((prev) => prev.map((v) => (v.id === id ? data.view : v)));
      return data.view;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await api(`/feed/views/${id}`, { method: "DELETE" });
    setViews((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // A guest (or a reader who just signed out) has no views, whatever the
  // last account left in state
  return {
    views: enabled ? views : NO_VIEWS,
    loaded: enabled && loaded,
    create,
    update,
    remove,
  };
}

/** The API's own words for a rejected view (duplicate name, limit), else a
 *  generic line — never a raw status code. */
export function viewErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isOffline) return "Check your connection and try again.";
    if (err.status === 400 || err.status === 409) return err.message;
  }
  return "Something went wrong. Try again.";
}
