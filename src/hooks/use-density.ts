"use client";

import { useSyncExternalStore } from "react";
import { createLocalPref } from "@/lib/local-pref";

export type Density = "compact" | "comfortable";

const store = createLocalPref("feed-density", "compact");

/** Feed card density: compact collapses summaries/deal terms behind a click. */
export function useDensity(): [Density, (d: Density) => void] {
  const raw = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  const density: Density = raw === "comfortable" ? "comfortable" : "compact";
  return [density, store.set];
}
