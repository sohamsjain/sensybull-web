"use client";

import type { WatchlistEntry } from "@/types/api";
import { CountBadge } from "@/components/ui/badge";
import { CheckIcon, MutedIcon, PinIcon } from "@/components/ui/icons";
import { listTimestamp, fullDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { CompanyAvatar } from "./company-avatar";

/** Selection box. Visual only — the whole row is the hit target. */
function SelectionBox({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-xs border transition-colors",
        selected
          ? "border-brand bg-brand text-brand-on"
          : "border-line-strong text-transparent"
      )}
    >
      <CheckIcon className="size-3" strokeWidth={3} />
    </span>
  );
}

/**
 * One company in the list. Everything a scan needs on two lines: who,
 * when, what happened last, and whether anything is unread — at a density
 * where fifty companies fit on a screen without becoming a wall.
 */
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
  const highlighted = selected || (active && !selectable);

  // In selection mode the row is a checkbox, not a link to the company —
  // one hit target, so there's no half-pressed state to reason about.
  const checkboxProps = selectable
    ? ({ role: "checkbox", "aria-checked": selected } as const)
    : {};

  return (
    <button
      onClick={(e) => (selectable ? onToggleSelect?.(e.shiftKey) : onSelect())}
      data-company-id={company.id}
      {...checkboxProps}
      className={cn(
        "flex w-full items-center gap-2.5 border-l-2 px-3 py-2 text-left transition-colors outline-none",
        highlighted
          ? "border-l-brand bg-brand-soft"
          : "border-l-transparent hover:bg-surface-hover"
      )}
    >
      {selectable && <SelectionBox selected={selected} />}

      <CompanyAvatar ticker={company.ticker} name={company.name} size="sm" />

      <div className="-mb-2 min-w-0 flex-1 border-b border-line-subtle pb-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-baseline gap-1.5">
            {company.ticker && (
              <span
                className={cn(
                  "shrink-0 font-mono text-label font-semibold",
                  hasUnread ? "text-ink" : "text-ink-muted"
                )}
              >
                {company.ticker}
              </span>
            )}
            <span
              className={cn(
                "truncate text-label",
                hasUnread ? "text-ink" : "text-ink-muted"
              )}
            >
              {company.name}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 text-micro whitespace-nowrap tabular-nums",
              hasUnread && !muted ? "text-brand-ink" : "text-ink-faint"
            )}
            title={fullDateTime(last_activity_at)}
          >
            {listTimestamp(last_activity_at)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-meta",
              hasUnread
                ? "text-ink-muted"
                : last_event
                  ? "text-ink-faint"
                  : "text-ink-dim italic"
            )}
          >
            {last_event ? last_event.headline : "No filings yet"}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {pinned && (
              <PinIcon className="size-3 text-ink-faint" aria-label="Pinned" />
            )}
            {muted && (
              <MutedIcon className="size-3 text-ink-faint" aria-label="Muted" />
            )}
            <CountBadge count={unread_count} muted={muted} />
          </span>
        </div>
      </div>
    </button>
  );
}
