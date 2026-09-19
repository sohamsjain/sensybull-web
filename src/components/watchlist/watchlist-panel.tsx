"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { WatchlistEntry, CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { displayCompanyName } from "@/lib/company-name";
import { usePinnedCompanies } from "@/hooks/use-pinned-companies";
import { useQuotes } from "@/hooks/use-quotes";
import { useWatchlistSelection } from "@/hooks/use-watchlist-selection";
import { toast } from "@/components/ui/app-toaster";
import { StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import {
  CloseIcon,
  CompaniesIcon,
  MarkReadIcon,
  MoreIcon,
  MutedIcon,
  RemoveIcon,
} from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { GroupLabel } from "@/components/ui/section";
import { SearchInput } from "@/components/ui/search-input";
import { SkeletonRows } from "@/components/ui/skeleton";
import { WatchlistItem } from "./watchlist-item";

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

/** Which bulk request is in flight, so the menus can disable themselves. */
type BulkAction = "mute" | "read" | "remove";

const companiesLabel = (n: number) => `${n} ${n === 1 ? "company" : "companies"}`;

/**
 * The watchlist column, laid out the way a chat list is: a title with one
 * overflow menu, the search box, then All / Unread under it. Multi-select
 * is entered from the menu; the header then becomes "N selected" with its
 * own menu of things to do to them, and ✕ leaves.
 */
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
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { pinned } = usePinnedCompanies();

  // One request for the whole list's prices, refreshed on a 60s poll
  const quotes = useQuotes(
    useMemo(() => entries.map((c) => c.company.id), [entries])
  );

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

  // Leaving selection mode also drops a pending remove confirmation
  // (adjust-during-render, so it never flashes for a frame)
  if (!selecting && confirmRemove) setConfirmRemove(false);

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
          tone: "danger",
        });
      } finally {
        setBusy(null);
      }
    },
    [busy, exitSelection]
  );

  const handleBulkMute = (muted: boolean) => {
    const ids = selection.selectedIds;
    const label = companiesLabel(ids.length);
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
      `Marked ${companiesLabel(ids.length)} as read`,
      "Couldn't mark as read"
    );
  };

  /** Every company with something unread, without entering selection. */
  const handleMarkAllRead = () => {
    const ids = entries.filter((c) => c.unread_count > 0).map((c) => c.company.id);
    runBulk(
      "read",
      ids,
      () => onBulkMarkRead(ids),
      "Marked everything as read",
      "Couldn't mark as read"
    );
  };

  const handleBulkRemove = () => {
    const ids = selection.selectedIds;
    setConfirmRemove(false);
    runBulk(
      "remove",
      ids,
      () => onBulkRemove(ids),
      `Removed ${companiesLabel(ids.length)}`,
      "Couldn't remove"
    );
  };

  const nothingSelected = selection.count === 0 || busy !== null;

  return (
    <div className="flex h-full flex-col">
      {/* Header — swaps to the selection bar in selection mode */}
      <div className="shrink-0 px-3 pt-2.5 pb-2">
        <div className="mb-2 flex h-9 items-center gap-1">
          {selecting ? (
            <>
              <IconButton
                size="md"
                onClick={exitSelection}
                title="Leave selection"
                aria-label="Leave selection"
              >
                <CloseIcon />
              </IconButton>
              <span className="ml-1 flex-1 text-label font-medium text-ink">
                {selection.count} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <IconButton
                      size="md"
                      title="Actions for the selected companies"
                      aria-label="Actions for the selected companies"
                    />
                  }
                >
                  <MoreIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuItem
                    onClick={selection.toggleAll}
                    disabled={visibleIds.length === 0}
                  >
                    {selection.allVisibleSelected ? "Clear selection" : "Select all"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={nothingSelected}
                    onClick={handleBulkMarkRead}
                  >
                    <MarkReadIcon />
                    Mark as read
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={nothingSelected}
                    onClick={() => handleBulkMute(!allMuted)}
                  >
                    <MutedIcon />
                    {allMuted ? "Unmute notifications" : "Mute notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={nothingSelected}
                    onClick={() => setConfirmRemove(true)}
                  >
                    <RemoveIcon />
                    Remove from watchlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <h2 className="flex flex-1 items-center gap-2 text-title font-semibold text-ink">
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <IconButton
                      size="md"
                      title="Watchlist options"
                      aria-label="Watchlist options"
                    />
                  }
                >
                  <MoreIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  <DropdownMenuItem
                    disabled={entries.length === 0}
                    onClick={() => selection.enter()}
                  >
                    Select companies
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={totalUnread === 0 || busy !== null}
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                  {onCollapse && (
                    <>
                      <DropdownMenuSeparator className="hidden md:block" />
                      <DropdownMenuItem
                        className="hidden md:flex"
                        onClick={onCollapse}
                      >
                        Hide the list
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <SearchInput
          id="watchlist-search"
          value={filter}
          onValueChange={setFilter}
          placeholder={
            selecting ? "Filter these companies…" : "Search or add a company…"
          }
          hint={<Kbd className="hidden md:inline-flex">/</Kbd>}
        />

        {/* Under the search, like a chat list: everything, or only unread */}
        <div
          role="tablist"
          aria-label="Show all companies or only unread"
          className="mt-2 flex items-center gap-1.5"
        >
          <Chip
            role="tab"
            aria-selected={!unreadOnly}
            selected={!unreadOnly}
            onClick={() => setUnreadOnly(false)}
          >
            All
          </Chip>
          <Chip
            role="tab"
            aria-selected={unreadOnly}
            selected={unreadOnly}
            onClick={() => setUnreadOnly(true)}
          >
            Unread{totalUnread > 0 ? ` ${totalUnread}` : ""}
          </Chip>
        </div>
      </div>

      {/* Remove confirms inline, like the single-company confirm in the
          conversation header — a dialog is heavier than the decision. */}
      {selecting && confirmRemove && (
        <div className="shrink-0 border-y border-line-subtle bg-canvas-sunken px-3 py-2">
          <p className="mb-1.5 text-meta text-ink-muted">
            Stop following {companiesLabel(selection.count)}?
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant="destructive"
              disabled={busy !== null}
              onClick={handleBulkRemove}
            >
              Remove
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setConfirmRemove(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonRows />
        ) : entries.length === 0 && !query ? (
          /* The full first-run explanation lives in the pane beside this
             one; here the search box directly above is the whole answer. */
          <EmptyState
            icon={CompaniesIcon}
            title="No companies yet"
            description="Search above to follow your first one."
          />
        ) : (
          <>
            {/* Companies you already follow */}
            {query && matchingEntries.length > 0 && (
              <GroupLabel>Already following</GroupLabel>
            )}
            {unreadOnly && matchingEntries.length === 0 && !query && (
              <EmptyState
                icon={MarkReadIcon}
                title="You're all caught up"
                description="Nothing unread across the companies you follow. Switch back to All to see them."
              />
            )}
            {matchingEntries.map((entry) => (
              <WatchlistItem
                key={entry.company.id}
                entry={entry}
                active={entry.company.id === activeCompanyId}
                quote={quotes[entry.company.id]}
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
                    <span className="truncate text-label text-ink">
                      {displayCompanyName(r.name)}
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
    </div>
  );
}
