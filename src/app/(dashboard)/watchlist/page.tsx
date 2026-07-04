"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlistInbox } from "@/hooks/use-watchlist-inbox";
import { useCompanyEvents } from "@/hooks/use-company-events";
import { WatchlistPanel } from "@/components/watchlist/watchlist-panel";
import { Conversation } from "@/components/watchlist/conversation";
import { Button } from "@/components/ui/button";

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 shadow-sm text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:shadow-none dark:text-slate-400 rounded text-[10px] font-mono leading-none">
      {children}
    </kbd>
  );
}

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
  } = useWatchlistInbox(activeCompanyId);

  const activeEntry = entries.find((c) => c.company.id === activeCompanyId) || null;
  const { events, loading: eventsLoading, hasMore, loadEarlier } =
    useCompanyEvents(activeCompanyId, socket);

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
  }, [entries, activeCompanyId, handleSelect]);

  if (!authLoading && !user) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
            Your watchlist, decoded
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
            Follow the companies you care about. New SEC filings arrive in
            plain English — with unread counts, so you never miss the one
            that matters.
          </p>
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-500">Sign in to start</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex min-w-0">
      {/* Watchlist pane: full width on mobile, fixed column on desktop */}
      <div
        className={`${
          activeCompanyId ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 md:border-r md:border-slate-200 dark:md:border-white/[0.06] bg-white dark:bg-transparent flex-col shrink-0`}
      >
        <WatchlistPanel
          entries={entries}
          loading={authLoading || loading}
          connected={connected}
          activeCompanyId={activeCompanyId}
          onSelect={handleSelect}
          onAddCompany={addCompany}
        />
      </div>

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
          <div className="chat-wallpaper flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <p className="text-slate-800 dark:text-slate-200 text-base font-medium mb-1.5">
                Your watchlist
              </p>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Pick a company on the left to see its filing history in plain
                English. Every briefing links back to the original document on
                SEC EDGAR.
              </p>
              <p className="text-slate-500 dark:text-slate-600 text-xs mt-5 flex items-center justify-center gap-2">
                <Key>↑</Key>
                <Key>↓</Key>
                <span>switch companies</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <Key>/</Key>
                <span>search</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <Key>esc</Key>
                <span>close</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
