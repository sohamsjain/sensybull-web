"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useChats } from "@/hooks/use-chats";
import { useCompanyEvents } from "@/hooks/use-company-events";
import { ChatList } from "@/components/chat/chat-list";
import { ChatConversation } from "@/components/chat/chat-conversation";
import { Button } from "@/components/ui/button";

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const {
    chats,
    totalUnread,
    loading,
    connected,
    markRead,
    setMuted,
    addCompany,
    removeCompany,
  } = useChats(activeCompanyId);

  const activeChat = chats.find((c) => c.company.id === activeCompanyId) || null;
  const { events, loading: eventsLoading, hasMore, loadEarlier } =
    useCompanyEvents(activeCompanyId);

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
            <Button className="bg-blue-600 hover:bg-blue-500">Sign in to start</Button>
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs px-6">
              <p className="text-slate-300 text-sm font-medium mb-1">
                Select a company
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Its full filing history opens as a conversation. Every
                briefing links back to the original document on SEC EDGAR.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
