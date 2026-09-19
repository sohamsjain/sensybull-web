"use client";

import { useSyncExternalStore } from "react";
import { createLocalPref } from "@/lib/local-pref";
import type { Units } from "./format";

/** The reader's unit choice, shared by every table on every company page. */
const unitsPref = createLocalPref("fundamentals-units", "mn");

export function useUnits(): [Units, (units: Units) => void] {
  const value = useSyncExternalStore(
    unitsPref.subscribe,
    unitsPref.get,
    unitsPref.getServer
  );
  return [value === "bn" ? "bn" : "mn", (units) => unitsPref.set(units)];
}
