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
  const [adding, setAdding] = useState(false);
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // In add mode the same input searches all SEC companies (typeahead)
  useEffect(() => {
    const query = adding ? filter.trim() : "";
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
            `/companies/search?q=${encodeURIComponent(query)}&limit=10`
          );
          setResults(data.results || []);
        } catch {}
        setSearching(false);
      },
      query ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [adding, filter]);

  const existingIds = new Set(chats.map((c) => c.company.id));
  const visible = filter.trim()
    ? chats.filter((c) => {
        const q = filter.trim().toLowerCase();
        return (
          c.company.name.toLowerCase().includes(q) ||
          c.company.ticker?.toLowerCase().includes(q)
        );
      })
    : chats;

  const handleAdd = async (companyId: string) => {
    setAdding(false);
    setFilter("");
    setResults([]);
    await onAddCompany(companyId);
    onSelect(companyId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            Chats
            <span
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-slate-600"}`}
              title={connected ? "Live — connected to the filing feed" : "Connecting..."}
            />
          </h2>
          <button
            onClick={() => {
              setAdding((a) => !a);
              setFilter("");
              setResults([]);
            }}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              adding
                ? "bg-slate-700 text-slate-300"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {adding ? "Cancel" : "+ Add"}
          </button>
        </div>
        <input
          type="text"
          placeholder={adding ? "Search any ticker or company..." : "Search your chats..."}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          autoFocus={adding}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-slate-500"
        />
      </div>

      {/* Add-company results */}
      {adding && (
        <div className="px-3 pb-2 shrink-0">
          {searching && <p className="text-slate-500 text-xs py-1">Searching...</p>}
          {results
            .filter((r) => !existingIds.has(r.id))
            .map((r) => (
              <button
                key={r.id}
                onClick={() => handleAdd(r.id)}
                className="w-full text-left px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded flex items-baseline gap-2"
              >
                <span className="font-mono font-semibold text-slate-200">
                  {r.ticker}
                </span>
                <span className="text-xs text-slate-500 truncate">{r.name}</span>
              </button>
            ))}
          {!searching && filter.trim() && results.length === 0 && (
            <p className="text-slate-500 text-xs py-1">
              No SEC-registered companies match &ldquo;{filter.trim()}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-0 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-11 h-11 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-slate-300 text-sm font-medium mb-1">
              Track your first company
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Each company gets its own chat. New SEC filings arrive as
              messages — decoded into plain English, seconds after they hit
              EDGAR.
            </p>
            <button
              onClick={() => setAdding(true)}
              className="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
            >
              + Add a company
            </button>
          </div>
        ) : visible.length === 0 && !adding ? (
          <p className="px-6 py-8 text-center text-slate-500 text-xs">
            No chats match &ldquo;{filter.trim()}&rdquo;
          </p>
        ) : (
          visible.map((chat) => (
            <ChatListItem
              key={chat.company.id}
              chat={chat}
              active={chat.company.id === activeCompanyId}
              onSelect={() => onSelect(chat.company.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
