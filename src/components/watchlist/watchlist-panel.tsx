"use client";

import { useState, useEffect, useMemo } from "react";
import type { WatchlistEntry, CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { usePinnedCompanies } from "@/hooks/use-pinned-companies";
import { WatchlistItem } from "./watchlist-item";

interface WatchlistPanelProps {
  entries: WatchlistEntry[];
  loading: boolean;
  connected: boolean;
  activeCompanyId: string | null;
  onSelect: (companyId: string) => void;
  onAddCompany: (companyId: string) => Promise<void>;
  onCollapse?: () => void;
}

export function WatchlistPanel({
  entries,
  loading,
  connected,
  activeCompanyId,
  onSelect,
  onAddCompany,
  onCollapse,
}: WatchlistPanelProps) {
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { pinned } = usePinnedCompanies();

  // One search box, two scopes: filters your watchlist locally and runs a
  // typeahead over the whole SEC company universe in parallel.
  useEffect(() => {
    const query = filter.trim();
    const timer = setTimeout(
      async () => {
        if (!query) {
          setResults([]);
          setSearching(false);
          return;
        }
        setSearching(true);
        try {
          const data = await api<CompanySearchResponse>(
            `/companies/search?q=${encodeURIComponent(query)}&limit=8`
          );
          setResults(data.results || []);
        } catch {}
        setSearching(false);
      },
      query ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [filter]);

  // Keep the keyboard-selected company visible in the list
  useEffect(() => {
    if (!activeCompanyId) return;
    document
      .querySelector(`[data-company-id="${CSS.escape(activeCompanyId)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeCompanyId]);

  const existingIds = new Set(entries.map((c) => c.company.id));
  const query = filter.trim();
  const totalUnread = entries.reduce((sum, c) => sum + c.unread_count, 0);
  const matchingEntries = useMemo(() => {
    let list = query
      ? entries.filter((c) => {
          const q = query.toLowerCase();
          return (
            c.company.name.toLowerCase().includes(q) ||
            c.company.ticker?.toLowerCase().includes(q)
          );
        })
      : entries;
    if (unreadOnly) list = list.filter((c) => c.unread_count > 0);
    // Pinned companies float to the top, keeping recency order within each group
    return [...list].sort(
      (a, b) =>
        Number(pinned.has(b.company.id)) - Number(pinned.has(a.company.id))
    );
  }, [entries, query, unreadOnly, pinned]);
  const newCompanies = results.filter((r) => !existingIds.has(r.id));

  const handleAdd = async (companyId: string) => {
    setAddingId(companyId);
    try {
      await onAddCompany(companyId);
      setFilter("");
      setResults([]);
      onSelect(companyId);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-900 dark:text-white/90 font-medium text-base flex items-center gap-2">
            Watchlist
            <span
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-slate-300 dark:bg-white/[0.1]"}`}
              title={connected ? "Live — connected to the filing feed" : "Connecting..."}
            />
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUnreadOnly((v) => !v)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                unreadOnly
                  ? "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title={unreadOnly ? "Show all companies" : "Show unread only"}
            >
              Unread{totalUnread > 0 ? ` (${totalUnread})` : ""}
            </button>
            {onCollapse && (
              <button
                onClick={onCollapse}
                className="hidden md:inline-flex p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                title="Hide the watchlist"
                aria-label="Hide the watchlist"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.5 3.5 5 7l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <input
          id="watchlist-search"
          type="text"
          placeholder="Search or add a company..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-slate-100 dark:bg-[#14161c] border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500/40 dark:focus:border-indigo-500/40"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-0 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#14161c]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-[#14161c] rounded w-2/3" />
                  <div className="h-2.5 bg-slate-100 dark:bg-[#14161c] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 && !query ? (
          <div className="px-6 py-10 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
              Track your first company
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
              New filings and press releases from companies you follow arrive
              here in plain English, seconds after they&apos;re published.
              Search above (or press /) to add your first company.
            </p>
          </div>
        ) : (
          <>
            {/* Companies you already follow */}
            {query && matchingEntries.length > 0 && (
              <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
                On your watchlist
              </p>
            )}
            {unreadOnly && matchingEntries.length === 0 && !query && (
              <p className="px-6 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                You&apos;re all caught up — nothing unread.
              </p>
            )}
            {matchingEntries.map((entry) => (
              <WatchlistItem
                key={entry.company.id}
                entry={entry}
                active={entry.company.id === activeCompanyId}
                pinned={pinned.has(entry.company.id)}
                onSelect={() => onSelect(entry.company.id)}
              />
            ))}

            {/* Companies you can start tracking */}
            {query && (
              <>
                <p className="px-3 pt-3 pb-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
                  Companies
                </p>
                {newCompanies.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleAdd(r.id)}
                    disabled={addingId !== null}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-baseline gap-2 min-w-0">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        {r.ticker}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {r.name}
                      </span>
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 shrink-0">
                      {addingId === r.id ? "Adding..." : "+ Track"}
                    </span>
                  </button>
                ))}
                {searching && (
                  <p className="px-3 py-1.5 text-slate-400 dark:text-slate-500 text-xs">Searching…</p>
                )}
                {!searching && newCompanies.length === 0 && (
                  <p className="px-3 py-1.5 text-slate-400 dark:text-slate-600 text-xs">
                    No other SEC-registered companies match &ldquo;{query}&rdquo;
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
