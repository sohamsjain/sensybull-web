"use client";

import { useState, useEffect } from "react";
import type { Watchlist, CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";

interface WatchlistManagerProps {
  watchlist: Watchlist;
  onClose: () => void;
  onAddCompany: (companyId: string) => Promise<void>;
  onRemoveCompany: (companyId: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onRefresh: () => void;
}

export function WatchlistManager({
  watchlist,
  onClose,
  onAddCompany,
  onRemoveCompany,
  onDelete,
  onRefresh,
}: WatchlistManagerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api<CompanySearchResponse>(
          `/companies/search?q=${encodeURIComponent(query.trim())}&limit=10`
        );
        setResults(data.results || []);
      } catch {}
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const existingIds = new Set(watchlist.companies?.map((c) => c.id));

  const handleAdd = async (companyId: string) => {
    await onAddCompany(companyId);
    onRefresh();
  };

  const handleRemove = async (companyId: string) => {
    await onRemoveCompany(companyId);
    onRefresh();
  };

  return (
    <div className="mt-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-900 dark:text-white font-medium">{watchlist.name}</span>
        <button
          onClick={onClose}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
        >
          x
        </button>
      </div>

      {/* Current companies */}
      {watchlist.companies?.length > 0 && (
        <div className="mb-2 space-y-1">
          {watchlist.companies.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-600 dark:text-slate-300">{c.ticker || c.name}</span>
              <button
                onClick={() => handleRemove(c.id)}
                className="text-red-400/60 hover:text-red-400"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search companies */}
      <input
        type="text"
        placeholder="Search ticker or company..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-500 dark:focus:border-slate-400"
      />
      {results.length > 0 && (
        <div className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
          {results
            .filter((c) => !existingIds.has(c.id))
            .map((c) => (
              <button
                key={c.id}
                onClick={() => handleAdd(c.id)}
                className="w-full text-left px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                {c.ticker} &mdash; {c.name}
              </button>
            ))}
        </div>
      )}
      {searching && (
        <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Searching...</p>
      )}

      <button
        onClick={onDelete}
        className="mt-2 text-red-400/60 hover:text-red-400 text-xs"
      >
        Delete watchlist
      </button>
    </div>
  );
}
