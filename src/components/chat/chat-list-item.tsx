"use client";

import type { Chat } from "@/types/api";
import { chatTimestamp } from "@/lib/utils";
import { SENTIMENT_CONFIG, type Sentiment } from "@/config/constants";
import { ChatAvatar } from "./chat-avatar";

function MutedIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-slate-500 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label="Muted"
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

export function ChatListItem({
  chat,
  active,
  onSelect,
}: {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
}) {
  const { company, last_event, last_activity_at, unread_count, muted } = chat;
  const hasUnread = unread_count > 0;
  const sentiment = last_event?.sentiment as Sentiment | undefined;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-800 ${
        active ? "bg-slate-800" : "hover:bg-slate-800/60"
      }`}
    >
      <ChatAvatar ticker={company.ticker} name={company.name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`truncate text-sm ${
              hasUnread ? "text-white font-semibold" : "text-slate-200"
            }`}
          >
            {company.name}
          </span>
          <span
            className={`text-[11px] whitespace-nowrap shrink-0 ${
              hasUnread && !muted ? "text-blue-400 font-medium" : "text-slate-500"
            }`}
          >
            {chatTimestamp(last_activity_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span
            className={`truncate text-xs flex items-center gap-1.5 min-w-0 ${
              hasUnread ? "text-slate-300" : "text-slate-500"
            }`}
          >
            {sentiment && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${SENTIMENT_CONFIG[sentiment].color}`}
              />
            )}
            <span className="truncate">
              {last_event ? last_event.headline : "No filings yet"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {muted && <MutedIcon />}
            {hasUnread && (
              <span
                className={`min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold leading-none px-1 ${
                  muted ? "bg-slate-600 text-slate-300" : "bg-blue-500 text-white"
                }`}
              >
                {unread_count > 99 ? "99+" : unread_count}
              </span>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
