"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { WatchlistEntry, CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { usePinnedCompanies } from "@/hooks/use-pinned-companies";
import { useWatchlistSelection } from "@/hooks/use-watchlist-selection";
import { toast } from "@/components/ui/app-toaster";
import { StatusDot } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { CollapsePaneIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { GroupLabel } from "@/components/ui/section";
import { SearchInput } from "@/components/ui/search-input";
import { SkeletonRows } from "@/components/ui/skeleton";
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
    <div className="flex h-full flex-col">
      {/* Header — swaps to a selection toolbar in selection mode */}
      <div className="shrink-0 px-3 pt-2.5 pb-2">
        <div className="mb-2 flex h-7 items-center justify-between gap-2">
          {selecting ? (
            <>
              <span className="text-label font-medium text-ink">
                {selection.count} selected
              </span>
              <div className="flex items-center gap-1">
                <Chip
                  variant="quiet"
                  onClick={selection.toggleAll}
                  disabled={visibleIds.length === 0}
                >
                  {selection.allVisibleSelected ? "Clear" : "Select all"}
                </Chip>
                <Chip
                  variant="quiet"
                  onClick={exitSelection}
                  className="text-brand-ink hover:text-brand-ink"
                >
                  Done
                </Chip>
              </div>
            </>
          ) : (
            <>
              <h2 className="flex items-center gap-2 text-title font-medium text-ink">
                Watchlist
                <StatusDot
                  live={connected}
                  title={
                    connected
                      ? "Live — connected to the filing feed"
                      : "Connecting…"
                  }
                />
              </h2>
              <div className="flex items-center gap-0.5">
                <Chip
                  variant="quiet"
                  selected={unreadOnly}
                  onClick={() => setUnreadOnly((v) => !v)}
                  title={unreadOnly ? "Show all companies" : "Show unread only"}
                >
                  Unread{totalUnread > 0 ? ` ${totalUnread}` : ""}
                </Chip>
                {entries.length > 1 && (
                  <Chip
                    variant="quiet"
                    onClick={() => selection.enter()}
                    title="Select several companies to mute or remove together"
                  >
                    Select
                  </Chip>
                )}
                {onCollapse && (
                  <IconButton
                    size="sm"
                    onClick={onCollapse}
                    className="hidden md:inline-flex"
                    title="Hide the watchlist"
                    aria-label="Hide the watchlist"
                  >
                    <CollapsePaneIcon />
                  </IconButton>
                )}
              </div>
            </>
          )}
        </div>

        <SearchInput
          id="watchlist-search"
          value={filter}
          onValueChange={setFilter}
          placeholder={
            selecting ? "Filter your watchlist…" : "Search or add a company…"
          }
          hint={<Kbd className="hidden md:inline-flex">/</Kbd>}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonRows />
        ) : entries.length === 0 && !query ? (
          <EmptyState
            title="Track your first company"
            description="New filings and press releases from companies you follow arrive here in plain English, seconds after they're published. Search above to add one."
          />
        ) : (
          <>
            {/* Companies you already follow */}
            {query && matchingEntries.length > 0 && (
              <GroupLabel>On your watchlist</GroupLabel>
            )}
            {unreadOnly && matchingEntries.length === 0 && !query && (
              <EmptyState
                title="You're all caught up"
                description="Nothing unread across the companies you follow."
              />
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
                <GroupLabel>All SEC-registered companies</GroupLabel>
                {newCompanies.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleAdd(r.id)}
                    disabled={addingId !== null}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-hover disabled:opacity-50"
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="font-mono text-label font-semibold text-ink">
                        {r.ticker}
                      </span>
                      <span className="truncate text-meta text-ink-faint">
                        {r.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-micro font-medium text-brand-ink">
                      {addingId === r.id ? "Adding…" : "Track"}
                    </span>
                  </button>
                ))}
                {searching && (
                  <p className="px-3 py-1.5 text-meta text-ink-faint">
                    Searching…
                  </p>
                )}
                {!searching && newCompanies.length === 0 && (
                  <p className="px-3 py-1.5 text-meta text-ink-faint">
                    No other companies match &ldquo;{query}&rdquo;
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
