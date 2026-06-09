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
            ? "bg-slate-700 text-white"
            : "text-slate-400 hover:bg-slate-800"
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
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          {wl.name}
          {wl.companies?.length > 0 && (
            <span className="text-slate-600 text-xs ml-1">
              ({wl.companies.length})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
