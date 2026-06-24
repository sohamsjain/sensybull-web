"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useChats } from "@/hooks/use-chats";
import { useCompanyEvents } from "@/hooks/use-company-events";
import { ChatList } from "@/components/chat/chat-list";
import { ChatConversation } from "@/components/chat/chat-conversation";
import { Button } from "@/components/ui/button";

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 text-[10px] font-mono leading-none">
      {children}
    </kbd>
  );
}

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const {
    chats,
    totalUnread,
    loading,
    connected,
    socket,
    markRead,
    setMuted,
    addCompany,
    removeCompany,
  } = useChats(activeCompanyId);

  const activeChat = chats.find((c) => c.company.id === activeCompanyId) || null;
  const { events, loading: eventsLoading, hasMore, loadEarlier } =
    useCompanyEvents(activeCompanyId, socket);

  // Unread count in the tab title, messenger-style
  useEffect(() => {
    document.title =
      totalUnread > 0 ? `(${totalUnread}) Sensybull` : "Sensybull";
    return () => {
      document.title = "Sensybull";
    };
  }, [totalUnread]);

  const handleSelect = useCallback(
    (companyId: string) => {
      setActiveCompanyId(companyId);
      markRead(companyId);
    },
    [markRead]
  );

  const handleRemove = useCallback(async () => {
    if (!activeCompanyId) return;
    const id = activeCompanyId;
    setActiveCompanyId(null);
    await removeCompany(id);
  }, [activeCompanyId, removeCompany]);

  // Keyboard: ↑/↓ move between chats, "/" focuses search, Esc closes
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
        document.getElementById("chat-search")?.focus();
        return;
      }
      if (e.key === "Escape") {
        setActiveCompanyId(null);
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (chats.length === 0) return;
      e.preventDefault();
      const idx = chats.findIndex((c) => c.company.id === activeCompanyId);
      const next =
        e.key === "ArrowDown"
          ? chats[idx === -1 ? 0 : Math.min(idx + 1, chats.length - 1)]
          : chats[idx === -1 ? chats.length - 1 : Math.max(idx - 1, 0)];
      if (next && next.company.id !== activeCompanyId) {
        handleSelect(next.company.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chats, activeCompanyId, handleSelect]);

  if (!authLoading && !user) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-white text-lg font-semibold mb-2">
            Your companies, as chats
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Every company you follow gets its own conversation. SEC filings
            arrive as plain-English messages — with unread counts, so you
            never miss the one that matters.
          </p>
          <Link href="/login">
            <Button className="bg-violet-600 hover:bg-violet-500">Sign in to start</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex min-w-0">
      {/* Chat list pane: full width on mobile, fixed column on desktop */}
      <div
        className={`${
          activeCompanyId ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 md:border-r md:border-slate-700 flex-col shrink-0`}
      >
        <ChatList
          chats={chats}
          loading={authLoading || loading}
          connected={connected}
          activeCompanyId={activeCompanyId}
          onSelect={handleSelect}
          onAddCompany={addCompany}
        />
      </div>

      {/* Conversation pane */}
      <div
        className={`${
          activeCompanyId ? "flex" : "hidden md:flex"
        } flex-1 min-w-0`}
      >
        {activeChat ? (
          <div className="flex-1 min-w-0">
            <ChatConversation
              chat={activeChat}
              events={events}
              loading={eventsLoading}
              hasMore={hasMore}
              onLoadEarlier={loadEarlier}
              onBack={() => setActiveCompanyId(null)}
              onToggleMute={() =>
                setMuted(activeChat.company.id, !activeChat.muted)
              }
              onRemove={handleRemove}
            />
          </div>
        ) : (
          <div className="chat-wallpaper flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-2xl">
                📈
              </div>
              <p className="text-slate-200 text-base font-medium mb-1.5">
                Sensybull Chats
              </p>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Pick a company and its filing history opens as a conversation.
                Every briefing links back to the original document on SEC
                EDGAR.
              </p>
              <p className="text-slate-600 text-xs mt-5 flex items-center justify-center gap-2">
                <Key>↑</Key>
                <Key>↓</Key>
                <span>switch chats</span>
                <span className="text-slate-700">·</span>
                <Key>/</Key>
                <span>search</span>
                <span className="text-slate-700">·</span>
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
