"use client";

import { useState, useRef, useLayoutEffect, useMemo } from "react";
import type { Chat } from "@/types/api";
import type { FilingEvent } from "@/types/events";
import { dayLabel, formatCatalystDate } from "@/lib/utils";
import { usePinnedChats } from "@/hooks/use-pinned-chats";
import { ChatAvatar } from "./chat-avatar";
import { ChatMessage } from "./chat-message";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ChatConversationProps {
  chat: Chat;
  events: FilingEvent[]; // newest first
  loading: boolean;
  hasMore: boolean;
  onLoadEarlier: () => void;
  onBack: () => void;
  onToggleMute: () => void;
  onRemove: () => void;
}

function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function MutedBellIcon() {
  return (
    <svg
      className="w-4 h-4 text-amber-400/80 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label="Alerts muted"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.143 17.082a24 24 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.3-5.542m3.155 6.852a3 3 0 005.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 003.536-1.003A8.967 8.967 0 0118 9.75V9A6 6 0 006.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

export function ChatConversation({
  chat,
  events,
  loading,
  hasMore,
  onLoadEarlier,
  onBack,
  onToggleMute,
  onRemove,
}: ChatConversationProps) {
  const { company, muted } = chat;
  const { pinned, togglePin } = usePinnedChats();
  const isPinned = pinned.has(company.id);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingEarlierRef = useRef(false);
  const prevHeightRef = useRef(0);
  const newestIdRef = useRef<string | null>(null);
  const companyIdRef = useRef(company.id);

  // Chronological for display: oldest at top, newest at bottom
  const ordered = useMemo(() => [...events].reverse(), [events]);

  // Upcoming catalysts across loaded events, pinned at the top
  const pinnedCatalysts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen = new Set<string>();
    const upcoming: { event: string; date: string }[] = [];
    for (const e of events) {
      for (const c of e.catalysts || []) {
        if (!c.date || c.date < today) continue;
        const key = `${c.date}:${c.event}`;
        if (seen.has(key)) continue;
        seen.add(key);
        upcoming.push({ event: c.event, date: c.date });
      }
    }
    return upcoming.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  }, [events]);

  // Scroll handling: bottom on open/new message, preserve position on load-earlier
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Switching companies invalidates any in-flight load-earlier scroll
    // adjustment; always land at the bottom of the new conversation.
    if (companyIdRef.current !== company.id) {
      companyIdRef.current = company.id;
      loadingEarlierRef.current = false;
      newestIdRef.current = null;
    }
    if (loadingEarlierRef.current) {
      el.scrollTop += el.scrollHeight - prevHeightRef.current;
      loadingEarlierRef.current = false;
      return;
    }
    const newestId = events[0]?.id ?? null;
    if (newestId !== newestIdRef.current) {
      newestIdRef.current = newestId;
      el.scrollTop = el.scrollHeight;
    }
  }, [events, company.id]);

  const handleLoadEarlier = () => {
    const el = scrollRef.current;
    if (el) {
      loadingEarlierRef.current = true;
      prevHeightRef.current = el.scrollHeight;
    }
    onLoadEarlier();
  };

  const edgarCompanyUrl = company.cik
    ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}&type=8-K&dateb=&owner=include&count=40`
    : null;

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a12] shrink-0">
        <button
          onClick={onBack}
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0"
          aria-label="Back to chats"
        >
          <BackIcon />
        </button>
        <ChatAvatar
          ticker={company.ticker}
          name={company.name}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="text-slate-900 dark:text-white/90 text-sm font-medium truncate leading-tight">
            {company.name}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs truncate">
            {company.ticker && (
              <span className="font-mono">{company.ticker}</span>
            )}
            {edgarCompanyUrl && (
              <>
                {company.ticker && " · "}
                <a
                  href={edgarCompanyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2"
                >
                  SEC filing history
                </a>
              </>
            )}
          </p>
        </div>
        {muted && <MutedBellIcon />}
        {confirmRemove ? (
          <span className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              Remove from watchlist?
            </span>
            <button
              onClick={() => {
                setConfirmRemove(false);
                onRemove();
              }}
              className="text-red-400 hover:text-red-300 font-medium"
            >
              Remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1.5 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Conversation options"
            >
              <MoreIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => togglePin(company.id)}>
                {isPinned ? "Unpin chat" : "Pin chat"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleMute}>
                {muted ? "Unmute alerts" : "Mute alerts"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmRemove(true)}
              >
                Remove from watchlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Pinned upcoming catalysts */}
      {pinnedCatalysts.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-100/80 dark:bg-[#12121e]/80 border-b border-slate-200 dark:border-white/[0.06] shrink-0">
          {pinnedCatalysts.map((c, i) => (
            <p key={i} className="text-xs text-slate-600 dark:text-slate-300 truncate">
              <span className="mr-1.5" aria-hidden="true">📌</span>
              <span className="text-violet-600 dark:text-violet-300 font-medium">
                {formatCatalystDate(c.date)}
              </span>
              {" — "}
              {c.event}
            </p>
          ))}
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="chat-wallpaper flex-1 overflow-y-auto px-4 py-3 space-y-2"
      >
        {hasMore && (
          <div className="text-center">
            <button
              onClick={handleLoadEarlier}
              disabled={loading}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white ring-1 ring-slate-200/80 dark:ring-0 dark:bg-[#12121e] px-3 py-1 rounded-full disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load earlier filings"}
            </button>
          </div>
        )}

        {loading && events.length === 0 ? (
          <div className="space-y-3 animate-pulse pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="max-w-[75%] h-24 bg-slate-200/70 dark:bg-[#12121e] rounded-lg" />
            ))}
          </div>
        ) : ordered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-xs">
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
                No filings yet
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
                The moment {company.name} files with the SEC, the decoded
                briefing lands here — usually within minutes of hitting EDGAR.
              </p>
            </div>
          </div>
        ) : (
          ordered.map((event, i) => {
            const ts = event.received_at || event.filing_date || "";
            const prevTs = i > 0
              ? ordered[i - 1].received_at || ordered[i - 1].filing_date || ""
              : null;
            const showDay =
              !prevTs || (ts && dayLabel(ts) !== dayLabel(prevTs));
            return (
              <div key={event.id}>
                {showDay && ts && (
                  <div className="flex justify-center my-3">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/95 ring-1 ring-slate-200/80 dark:ring-0 dark:bg-[#12121e]/90 px-3 py-1 rounded-md shadow-sm shadow-slate-300/30 dark:shadow-black/20">
                      {dayLabel(ts)}
                    </span>
                  </div>
                )}
                <ChatMessage event={event} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
