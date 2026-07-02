"use client";

import { useFontScale } from "@/hooks/use-font-scale";

/** Cycles the root font size through three steps; rem-based text follows. */
export function FontSizeToggle({ className = "" }: { className?: string }) {
  const { scale, cycle } = useFontScale();

  return (
    <button
      onClick={cycle}
      className={`relative flex items-center justify-center rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
      title={`Font size: ${scale.label} — click to change`}
      aria-label={`Font size: ${scale.label}. Activate to change.`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 18 9.5 5l5.5 13m-9.17-4.5h7.34M17 13l2.5 5m-4.58-1.5h4.16"
        />
      </svg>
      {scale.id !== "md" && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </button>
  );
}
