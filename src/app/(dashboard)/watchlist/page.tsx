"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlistInbox } from "@/hooks/use-watchlist-inbox";
import { useCompanyEvents } from "@/hooks/use-company-events";
import { usePaneWidth } from "@/hooks/use-pane-width";
import { WatchlistPanel } from "@/components/watchlist/watchlist-panel";
import { Conversation } from "@/components/watchlist/conversation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpandPaneIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  // Deep link: /watchlist?c=<companyId> opens that company once entries load.
  // Tracked via searchParams so in-app navigations (command palette, company
  // sheet) work even when the page is already mounted.
  const deepLinkId = useSearchParams().get("c");
  const [consumedDeepLink, setConsumedDeepLink] = useState<string | null>(
    null
  );

  // Multi-select lives in the panel; the page only tracks whether it's on, so
  // its own ↑/↓/Esc shortcuts stand down while the user is picking companies.
  const [selecting, setSelecting] = useState(false);

  const {
    entries,
    totalUnread,
    loading,
    connected,
    socket,
    markRead,
    setMuted,
    addCompany,
    removeCompany,
    bulkMarkRead,
    bulkSetMuted,
    bulkRemove,
  } = useWatchlistInbox(activeCompanyId);

  const activeEntry = entries.find((c) => c.company.id === activeCompanyId) || null;
  const { events, loading: eventsLoading, hasMore, loadEarlier } =
    useCompanyEvents(activeCompanyId, socket);
  const pane = usePaneWidth();

  // Unread count in the tab title
  useEffect(() => {
    document.title =
      totalUnread > 0 ? `(${totalUnread}) Sensybull` : "Sensybull";
    return () => {
      document.title = "Sensybull";
    };
  }, [totalUnread]);

  const handleSelect = useCallback((companyId: string) => {
    setActiveCompanyId(companyId);
  }, []);

  // Consume the deep link during render once the watchlist is available
  if (
    deepLinkId &&
    deepLinkId !== consumedDeepLink &&
    entries.some((c) => c.company.id === deepLinkId)
  ) {
    setConsumedDeepLink(deepLinkId);
    setActiveCompanyId(deepLinkId);
  }

  // Opening a company marks its history read, however it was opened
  useEffect(() => {
    if (activeCompanyId) markRead(activeCompanyId);
  }, [activeCompanyId, markRead]);

  const handleRemove = useCallback(async () => {
    if (!activeCompanyId) return;
    const id = activeCompanyId;
    setActiveCompanyId(null);
    await removeCompany(id);
  }, [activeCompanyId, removeCompany]);

  // Close the open company first if a bulk remove includes it — on mobile the
  // panel is hidden while a company is open, so an id pointing at nothing
  // would strand the user on an empty pane.
  const handleBulkRemove = useCallback(
    async (companyIds: string[]) => {
      if (activeCompanyId && companyIds.includes(activeCompanyId)) {
        setActiveCompanyId(null);
      }
      await bulkRemove(companyIds);
    },
    [activeCompanyId, bulkRemove]
  );

  // Keyboard: ↑/↓ move between companies, "/" focuses search, Esc closes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (typing) {
        if (e.key === "Escape") (target as HTMLInputElement).blur();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("watchlist-search")?.focus();
        return;
      }
      // While selecting, Esc and the arrows belong to the panel: Esc leaves
      // selection mode, and moving the open company would be a non sequitur.
      if (selecting) return;
      if (e.key === "Escape") {
        setActiveCompanyId(null);
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (entries.length === 0) return;
      e.preventDefault();
      const idx = entries.findIndex((c) => c.company.id === activeCompanyId);
      const next =
        e.key === "ArrowDown"
          ? entries[idx === -1 ? 0 : Math.min(idx + 1, entries.length - 1)]
          : entries[idx === -1 ? entries.length - 1 : Math.max(idx - 1, 0)];
      if (next && next.company.id !== activeCompanyId) {
        handleSelect(next.company.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [entries, activeCompanyId, handleSelect, selecting]);

  if (!authLoading && !user) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <EmptyState
          title="Your watchlist, decoded"
          description="Follow the companies you care about. New filings and press releases arrive in plain English — with unread counts, so you never miss the one that matters."
          action={
            <Link href="/login">
              <Button>Sign in to start</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full flex min-w-0">
      {/* Watchlist pane: full width on mobile, resizable column on desktop */}
      <div
        className={`${
          activeCompanyId ? "hidden md:flex" : "flex"
        } ${pane.collapsed ? "md:!hidden" : ""} w-full shrink-0 flex-col border-r border-line-subtle md:w-[var(--pane-w)]`}
        style={{ "--pane-w": `${pane.width}px` } as React.CSSProperties}
      >
        <WatchlistPanel
          entries={entries}
          loading={authLoading || loading}
          connected={connected}
          activeCompanyId={activeCompanyId}
          onSelect={handleSelect}
          onAddCompany={addCompany}
          onCollapse={pane.collapse}
          onBulkSetMuted={bulkSetMuted}
          onBulkMarkRead={bulkMarkRead}
          onBulkRemove={handleBulkRemove}
          onSelectionModeChange={setSelecting}
        />
      </div>

      {/* Drag handle: resize, double-click to reset, drag closed to collapse */}
      {!pane.collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          title="Drag to resize · double-click to reset"
          className="group hidden w-1.5 shrink-0 cursor-col-resize touch-none items-stretch justify-center md:flex"
          {...pane.handleProps}
        >
          <div className="w-px bg-transparent transition-colors group-hover:bg-brand/50" />
        </div>
      )}

      {/* Reopen chevron when the pane is hidden */}
      {pane.collapsed && (
        <button
          onClick={pane.expand}
          className="hidden w-7 shrink-0 items-center justify-center border-r border-line-subtle text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink md:flex"
          title="Show the watchlist"
          aria-label="Show the watchlist"
        >
          <ExpandPaneIcon className="size-4" />
        </button>
      )}

      {/* Company history pane */}
      <div
        className={`${
          activeCompanyId ? "flex" : "hidden md:flex"
        } flex-1 min-w-0`}
      >
        {activeEntry ? (
          <div className="flex-1 min-w-0">
            <Conversation
              entry={activeEntry}
              events={events}
              loading={eventsLoading}
              hasMore={hasMore}
              onLoadEarlier={loadEarlier}
              onBack={() => setActiveCompanyId(null)}
              onToggleMute={() =>
                setMuted(activeEntry.company.id, !activeEntry.muted)
              }
              onRemove={handleRemove}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-canvas-sunken">
            <div className="max-w-sm px-6 text-center">
              <p className="text-title font-medium text-ink">Your watchlist</p>
              <p className="mt-1.5 text-label leading-relaxed text-ink-faint">
                Pick a company to read its filing history in plain English.
                Every briefing links back to the original document on SEC
                EDGAR, and the chart view shows how the stock moved around
                each filing.
              </p>
              <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-micro text-ink-faint">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>switch companies</span>
                <span className="text-ink-dim">·</span>
                <Kbd>/</Kbd>
                <span>search</span>
                <span className="text-ink-dim">·</span>
                <Kbd>esc</Kbd>
                <span>close</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
