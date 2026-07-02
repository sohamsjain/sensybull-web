"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createLocalPref } from "@/lib/local-pref";

export const FONT_SCALES = [
  { id: "md", px: "16px", label: "Default" },
  { id: "lg", px: "17.5px", label: "Large" },
  { id: "xl", px: "19px", label: "Extra large" },
] as const;

export type FontScaleId = (typeof FONT_SCALES)[number]["id"];

const store = createLocalPref("font-scale", "md");

/** Root font size preference; rem-based text follows the chosen step. */
export function useFontScale() {
  const raw = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  const current =
    FONT_SCALES.find((s) => s.id === raw) ?? FONT_SCALES[0];

  useEffect(() => {
    document.documentElement.style.fontSize = current.px;
  }, [current]);

  const cycle = () => {
    const idx = FONT_SCALES.findIndex((s) => s.id === current.id);
    store.set(FONT_SCALES[(idx + 1) % FONT_SCALES.length].id);
  };

  return { scale: current, cycle };
}
