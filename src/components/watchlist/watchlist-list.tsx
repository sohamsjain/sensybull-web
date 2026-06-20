"use client";

import type { Watchlist } from "@/types/api";

interface WatchlistListProps {
  watchlists: Watchlist[];
  selected: Watchlist | null;
  onSelect: (wl: Watchlist | null) => void;
}

export function WatchlistList({
  watchlists,
  selected,
  onSelect,
}: WatchlistListProps) {
  return (
    <div>
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${
          !selected
            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        All Events
      </button>
      {watchlists.map((wl) => (
        <button
          key={wl.id}
          onClick={() => onSelect(wl)}
          className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${
            selected?.id === wl.id
              ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {wl.name}
          {wl.companies?.length > 0 && (
            <span className="text-slate-400 dark:text-slate-600 text-xs ml-1">
              ({wl.companies.length})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
