"use client";

import { useState, useEffect } from "react";
import type { Chat, CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { ChatListItem } from "./chat-list-item";

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  connected: boolean;
  activeCompanyId: string | null;
  onSelect: (companyId: string) => void;
  onAddCompany: (companyId: string) => Promise<void>;
}

export function ChatList({
  chats,
  loading,
  connected,
  activeCompanyId,
  onSelect,
  onAddCompany,
}: ChatListProps) {
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // One search box, two scopes: filters your chats locally and runs a
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

  // Keep the keyboard-selected chat visible in the list
  useEffect(() => {
    if (!activeCompanyId) return;
    document
      .querySelector(`[data-company-id="${CSS.escape(activeCompanyId)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeCompanyId]);

  const existingIds = new Set(chats.map((c) => c.company.id));
  const query = filter.trim();
  const matchingChats = query
    ? chats.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.company.name.toLowerCase().includes(q) ||
          c.company.ticker?.toLowerCase().includes(q)
        );
      })
    : chats;
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
          <h2 className="text-slate-900 dark:text-white font-semibold text-base flex items-center gap-2">
            Chats
            <span
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-slate-300 dark:bg-slate-600"}`}
              title={connected ? "Live — connected to the filing feed" : "Connecting..."}
            />
          </h2>
        </div>
        <input
          id="chat-search"
          type="text"
          placeholder="Search or add a company..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-400 dark:focus:border-slate-500"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-0 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 && !query ? (
          <div className="px-6 py-10 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
              Track your first company
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
              Each company gets its own chat. New SEC filings arrive as
              messages — decoded into plain English, seconds after they hit
              EDGAR. Search above to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Your chats */}
            {query && matchingChats.length > 0 && (
              <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
                Your chats
              </p>
            )}
            {matchingChats.map((chat) => (
              <ChatListItem
                key={chat.company.id}
                chat={chat}
                active={chat.company.id === activeCompanyId}
                onSelect={() => onSelect(chat.company.id)}
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
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-baseline gap-2 min-w-0">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        {r.ticker}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {r.name}
                      </span>
                    </span>
                    <span className="text-[11px] text-blue-400 shrink-0">
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
