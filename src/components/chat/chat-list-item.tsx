"use client";

import type { Chat } from "@/types/api";
import { chatTimestamp, fullDateTime } from "@/lib/utils";
import { ChatAvatar } from "./chat-avatar";

function MutedIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0"
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

  return (
    <button
      onClick={onSelect}
      data-company-id={company.id}
      className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors outline-none focus-visible:bg-slate-100/80 dark:focus-visible:bg-[#12121e]/80 ${
        active ? "bg-slate-100 dark:bg-[#12121e]" : "hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
      }`}
    >
      <ChatAvatar
        ticker={company.ticker}
        name={company.name}
      />

      <div className="flex-1 min-w-0 border-b border-slate-200/70 dark:border-white/[0.04] pb-3 -mb-3">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`truncate text-[15px] leading-5 ${
              hasUnread ? "text-slate-900 dark:text-white/90 font-medium" : "text-slate-800 dark:text-slate-200/90"
            }`}
          >
            {company.name}
          </span>
          <span
            className={`text-[11px] whitespace-nowrap shrink-0 tabular-nums ${
              hasUnread && !muted
                ? "text-emerald-400 font-medium"
                : "text-slate-400 dark:text-slate-500"
            }`}
            title={fullDateTime(last_activity_at)}
          >
            {chatTimestamp(last_activity_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span
            className={`truncate text-[13px] leading-5 ${
              hasUnread
                ? "text-slate-700 dark:text-slate-200"
                : last_event
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-400 dark:text-slate-600 italic"
            }`}
          >
            {last_event ? last_event.headline : "No filings yet"}
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {muted && <MutedIcon />}
            {hasUnread && (
              <span
                className={`min-w-[19px] h-[19px] rounded-full flex items-center justify-center text-[11px] font-semibold leading-none px-1.5 ${
                  muted
                    ? "bg-slate-300 dark:bg-white/[0.1] text-slate-700 dark:text-slate-200"
                    : "bg-emerald-500 text-emerald-950"
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
