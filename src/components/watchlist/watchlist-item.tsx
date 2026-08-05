"use client";

import type { WatchlistEntry } from "@/types/api";
import { listTimestamp, fullDateTime } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";

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

function CheckIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2 4.8 8.5 9.5 3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Selection box. Visual only — the whole row is the hit target. */
function SelectionBox({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-[18px] h-[18px] rounded shrink-0 flex items-center justify-center border transition-colors ${
        selected
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "border-slate-300 dark:border-white/[0.2] text-transparent"
      }`}
    >
      <CheckIcon />
    </span>
  );
}

function PinIcon() {
  return (
    <svg
      className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-label="Pinned"
    >
      <path d="M9.5 1.5 14.5 6.5l-1.2 1.2-.7-.23-2.5 2.5.35 2.83-1.2 1.2-3-3L3 14.25 1.75 13l3.25-3.25-3-3 1.2-1.2 2.83.35 2.5-2.5-.23-.7L9.5 1.5Z" />
    </svg>
  );
}

export function WatchlistItem({
  entry,
  active,
  pinned = false,
  selectable = false,
  selected = false,
  onSelect,
  onToggleSelect,
}: {
  entry: WatchlistEntry;
  active: boolean;
  pinned?: boolean;
  /** Selection mode: show a checkbox and toggle instead of opening. */
  selectable?: boolean;
  selected?: boolean;
  onSelect: () => void;
  /** `extend` is the shift key — select the range from the last click. */
  onToggleSelect?: (extend: boolean) => void;
}) {
  const { company, last_event, last_activity_at, unread_count, muted } = entry;
  const hasUnread = unread_count > 0;

  // In selection mode the row is a checkbox, not a link to the company —
  // one hit target, so there's no half-pressed state to reason about.
  const checkboxProps = selectable
    ? ({ role: "checkbox", "aria-checked": selected } as const)
    : {};

  return (
    <button
      onClick={(e) =>
        selectable ? onToggleSelect?.(e.shiftKey) : onSelect()
      }
      data-company-id={company.id}
      {...checkboxProps}
      className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors outline-none border-l-2 focus-visible:bg-slate-100/80 dark:focus-visible:bg-[#14161c]/80 ${
        selected
          ? "border-l-indigo-600 dark:border-l-indigo-400 bg-indigo-50 dark:bg-indigo-500/[0.12]"
          : active && !selectable
            ? "border-l-indigo-600 dark:border-l-indigo-400 bg-indigo-50 dark:bg-indigo-500/[0.12]"
            : "border-l-transparent hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
      }`}
    >
      {selectable && <SelectionBox selected={selected} />}

      <CompanyAvatar
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
                ? "text-indigo-600 dark:text-indigo-400 font-medium"
                : "text-slate-400 dark:text-slate-500"
            }`}
            title={fullDateTime(last_activity_at)}
          >
            {listTimestamp(last_activity_at)}
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
            {pinned && <PinIcon />}
            {muted && <MutedIcon />}
            {hasUnread && (
              <span
                className={`min-w-[19px] h-[19px] rounded-full flex items-center justify-center text-[11px] font-semibold leading-none px-1.5 ${
                  muted
                    ? "bg-slate-300 dark:bg-white/[0.1] text-slate-700 dark:text-slate-200"
                    : "bg-indigo-500 text-white"
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
