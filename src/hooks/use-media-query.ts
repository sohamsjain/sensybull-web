"use client";

import { useSyncExternalStore } from "react";

/**
 * Does the viewport match `query` right now? False during server render
 * and the first client render, so markup never depends on it — use it for
 * behaviour (what a shortcut does, whether to fetch), and CSS breakpoints
 * for what shows.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** The width at which the feed's filters sit beside it (Tailwind `lg`). */
export const FILTER_RAILS_QUERY = "(min-width: 1024px)";
