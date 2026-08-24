"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

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
      <div className="shrink-0 border-t border-line-subtle bg-canvas px-3 py-2">
        <p className="mb-1.5 text-meta text-ink-muted">
          Remove {companies} from your watchlist?
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            size="xs"
            variant="destructive"
            disabled={busy}
            onClick={() => {
              setConfirmRemove(false);
              onRemove();
            }}
          >
            Remove
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setConfirmRemove(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-line-subtle bg-canvas px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="xs"
          variant="secondary"
          disabled={busy || count === 0}
          onClick={() => onMute(!allMuted)}
        >
          {allMuted ? "Unmute" : "Mute"}
        </Button>
        <Button
          size="xs"
          variant="secondary"
          disabled={busy || count === 0}
          onClick={onMarkRead}
        >
          Mark read
        </Button>
        <Button
          size="xs"
          variant="ghost"
          disabled={busy || count === 0}
          onClick={() => setConfirmRemove(true)}
          className="text-danger hover:bg-danger-soft hover:text-danger"
        >
          Remove
        </Button>
      </div>
      <p className="mt-1.5 text-micro text-ink-faint">
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
