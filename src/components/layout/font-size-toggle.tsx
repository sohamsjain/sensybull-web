"use client";

import { useEffect, useSyncExternalStore } from "react";

const SCALES = [
  { id: "md", px: "16px", label: "Default" },
  { id: "lg", px: "17.5px", label: "Large" },
  { id: "xl", px: "19px", label: "Extra large" },
] as const;

type ScaleId = (typeof SCALES)[number]["id"];

const STORAGE_KEY = "font-scale";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): ScaleId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return SCALES.some((s) => s.id === stored) ? (stored as ScaleId) : "md";
}

function setStored(id: ScaleId) {
  localStorage.setItem(STORAGE_KEY, id);
  listeners.forEach((cb) => cb());
}

/** Cycles the root font size through three steps; rem-based text follows. */
export function FontSizeToggle({ className = "" }: { className?: string }) {
  const scale = useSyncExternalStore(subscribe, getSnapshot, () => "md");
  const current = SCALES.find((s) => s.id === scale) ?? SCALES[0];

  useEffect(() => {
    document.documentElement.style.fontSize = current.px;
  }, [current]);

  const cycle = () => {
    const idx = SCALES.findIndex((s) => s.id === scale);
    setStored(SCALES[(idx + 1) % SCALES.length].id);
  };

  return (
    <button
      onClick={cycle}
      className={`relative flex items-center justify-center rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
      title={`Font size: ${current.label} — click to change`}
      aria-label={`Font size: ${current.label}. Activate to change.`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 18 9.5 5l5.5 13m-9.17-4.5h7.34M17 13l2.5 5m-4.58-1.5h4.16"
        />
      </svg>
      {scale !== "md" && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </button>
  );
}
