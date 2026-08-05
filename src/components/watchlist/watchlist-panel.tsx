"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { WatchlistEntry, CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { usePinnedCompanies } from "@/hooks/use-pinned-companies";
import { useWatchlistSelection } from "@/hooks/use-watchlist-selection";
import { toast } from "@/components/ui/app-toaster";
import { WatchlistItem } from "./watchlist-item";
import { WatchlistBulkBar } from "./watchlist-bulk-bar";

interface WatchlistPanelProps {
  entries: WatchlistEntry[];
  loading: boolean;
  connected: boolean;
  activeCompanyId: string | null;
  onSelect: (companyId: string) => void;
  onAddCompany: (companyId: string) => Promise<void>;
  onCollapse?: () => void;
  onBulkSetMuted: (companyIds: string[], muted: boolean) => Promise<void>;
  onBulkMarkRead: (companyIds: string[]) => Promise<void>;
  onBulkRemove: (companyIds: string[]) => Promise<void>;
  /** Lets the page stand down its own ↑/↓/Esc handling while selecting. */
  onSelectionModeChange?: (active: boolean) => void;
}

/** Which bulk request is in flight, so the bar can disable itself. */
type BulkAction = "mute" | "read" | "remove";

export function WatchlistPanel({
  entries,
  loading,
  connected,
  activeCompanyId,
  onSelect,
  onAddCompany,
  onCollapse,
  onBulkSetMuted,
  onBulkMarkRead,
  onBulkRemove,
  onSelectionModeChange,
}: WatchlistPanelProps) {
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busy, setBusy] = useState<BulkAction | null>(null);
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

  // ── Multi-select ─────────────────────────────────────────────────
  // Selection lives here rather than on the page: ranges and "select all"
  // are defined by what the filters leave on screen, which only the panel
  // knows. The page just needs to know the mode is on.
  const allIds = useMemo(() => entries.map((c) => c.company.id), [entries]);
  const visibleIds = useMemo(
    () => matchingEntries.map((c) => c.company.id),
    [matchingEntries]
  );
  const selection = useWatchlistSelection(allIds, visibleIds);
  const { active: selecting, exit: exitSelection } = selection;

  useEffect(() => {
    onSelectionModeChange?.(selecting);
  }, [selecting, onSelectionModeChange]);

  // Esc leaves selection mode. Skipped while typing so Esc still just blurs
  // the search box (the page's handler owns that).
  useEffect(() => {
    if (!selecting) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key !== "Escape" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      exitSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selecting, exitSelection]);

  const selectedEntries = useMemo(
    () => entries.filter((c) => selection.selected.has(c.company.id)),
    [entries, selection.selected]
  );
  const allMuted =
    selectedEntries.length > 0 && selectedEntries.every((c) => c.muted);

  /**
   * Run a bulk action, then leave selection mode. Exiting on success keeps
   * the outcome unambiguous — the toast says what happened and the list is
   * back to its reading state, rather than holding a selection whose rows
   * may have just been filtered away (or removed).
   */
  const runBulk = useCallback(
    async (
      action: BulkAction,
      ids: string[],
      run: () => Promise<void>,
      success: string,
      failure: string
    ) => {
      if (ids.length === 0 || busy) return;
      setBusy(action);
      try {
        await run();
        exitSelection();
        toast({ title: success, tone: "success" });
      } catch {
        toast({
          title: failure,
          description: "Nothing was changed. Check your connection and try again.",
        });
      } finally {
        setBusy(null);
      }
    },
    [busy, exitSelection]
  );

  const handleBulkMute = (muted: boolean) => {
    const ids = selection.selectedIds;
    const label = `${ids.length} ${ids.length === 1 ? "company" : "companies"}`;
    runBulk(
      "mute",
      ids,
      () => onBulkSetMuted(ids, muted),
      muted ? `Muted ${label}` : `Unmuted ${label}`,
      muted ? "Couldn't mute" : "Couldn't unmute"
    );
  };

  const handleBulkMarkRead = () => {
    const ids = selection.selectedIds;
    runBulk(
      "read",
      ids,
      () => onBulkMarkRead(ids),
      `Marked ${ids.length} ${ids.length === 1 ? "company" : "companies"} as read`,
      "Couldn't mark as read"
    );
  };

  const handleBulkRemove = () => {
    const ids = selection.selectedIds;
    runBulk(
      "remove",
      ids,
      () => onBulkRemove(ids),
      `Removed ${ids.length} ${ids.length === 1 ? "company" : "companies"}`,
      "Couldn't remove"
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — swaps to a selection toolbar in selection mode */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        {selecting ? (
          <div className="flex items-center justify-between gap-2 mb-2 h-6">
            <span className="text-slate-900 dark:text-white/90 font-medium text-sm">
              {selection.count} selected
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={selection.toggleAll}
                disabled={visibleIds.length === 0}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-40"
              >
                {selection.allVisibleSelected ? "Clear" : "Select all"}
              </button>
              <button
                onClick={exitSelection}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-2 h-6">
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
              {entries.length > 1 && (
                <button
                  onClick={() => selection.enter()}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title="Select several companies to mute or remove together"
                >
                  Select
                </button>
              )}
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
        )}
        <input
          id="watchlist-search"
          type="text"
          placeholder={
            selecting ? "Filter your watchlist..." : "Search or add a company..."
          }
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
                selectable={selecting}
                selected={selection.selected.has(entry.company.id)}
                onSelect={() => onSelect(entry.company.id)}
                onToggleSelect={(extend) =>
                  selection.toggle(entry.company.id, extend)
                }
              />
            ))}

            {/* Companies you can start tracking (adding is off while selecting) */}
            {query && !selecting && (
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

      {selecting && (
        <WatchlistBulkBar
          count={selection.count}
          allMuted={allMuted}
          busy={busy !== null}
          onMute={handleBulkMute}
          onMarkRead={handleBulkMarkRead}
          onRemove={handleBulkRemove}
        />
      )}
    </div>
  );
}
