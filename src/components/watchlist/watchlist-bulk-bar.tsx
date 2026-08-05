"use client";

import { useState } from "react";

/**
 * Bulk action bar for the watchlist's selection mode. Pinned to the bottom of
 * the panel so it stays put while the list scrolls.
 *
 * Remove confirms inline rather than in a dialog, matching the single-company
 * confirm in the conversation header.
 */
export function WatchlistBulkBar({
  count,
  allMuted,
  busy,
  onMute,
  onMarkRead,
  onRemove,
}: {
  count: number;
  /** Every selected company is already muted, so the action is "unmute". */
  allMuted: boolean;
  busy: boolean;
  onMute: (muted: boolean) => void;
  onMarkRead: () => void;
  onRemove: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const companies = `${count} ${count === 1 ? "company" : "companies"}`;

  if (confirmRemove) {
    return (
      <div className="shrink-0 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0b0d12] px-3 py-2">
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-1.5">
          Remove {companies} from your watchlist?
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setConfirmRemove(false);
              onRemove();
            }}
            disabled={busy}
            className="px-2.5 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          >
            Remove
          </button>
          <button
            onClick={() => setConfirmRemove(false)}
            className="px-2.5 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const action =
    "px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="shrink-0 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0b0d12] px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => onMute(!allMuted)}
          disabled={busy || count === 0}
          className={`${action} text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1]`}
        >
          {allMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={onMarkRead}
          disabled={busy || count === 0}
          className={`${action} text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1]`}
        >
          Mark read
        </button>
        <button
          onClick={() => setConfirmRemove(true)}
          disabled={busy || count === 0}
          className={`${action} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`}
        >
          Remove
        </button>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
        {count === 0 ? (
          "Pick companies to act on them together"
        ) : (
          <>
            Applies to {companies}
            {/* Pointer-only: there is no shift key on a touch device. */}
            <span className="hidden [@media(pointer:fine)]:inline">
              {" · shift-click to select a range"}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
