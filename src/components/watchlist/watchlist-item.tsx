"use client";

import type { Quote, WatchlistEntry } from "@/types/api";
import { StockQuote } from "@/components/company/stock-quote";
import { CountBadge } from "@/components/ui/badge";
import { CheckIcon, MutedIcon, PinIcon } from "@/components/ui/icons";
import { listTimestamp, fullDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { displayCompanyName } from "@/lib/company-name";
import { fundamentalsHref, NEW_TAB } from "@/lib/fundamentals/links";

import { CompanyAvatar } from "./company-avatar";

/** Selection box. Visual only — the whole row is the hit target. */
function SelectionBox({
  selected,
  className,
}: {
  selected: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-xs border transition-colors",
        className,
        selected
          ? "border-brand bg-brand text-brand-on"
          : "border-line-strong text-transparent"
      )}
    >
      <CheckIcon className="size-3.5" strokeWidth={3} />
    </span>
  );
}

/**
 * One company in the list.
 *
 * Three bands: who and when, where the stock is, and what happened. The
 * headline gets two lines because deciding whether to open a company is
 * mostly a question of whether that sentence is interesting — truncating it
 * at one line makes the reader click to find out.
 *
 * No ticker anywhere in the row: the name is the identity, and it is a link
 * to the company's financials (new tab) while the row itself opens the
 * company's history here. The row is a div with the button role rather than
 * a <button> so that link can live inside it legitimately.
 */
export function WatchlistItem({
  entry,
  active,
  quote,
  pinned = false,
  selectable = false,
  selected = false,
  onSelect,
  onToggleSelect,
}: {
  entry: WatchlistEntry;
  active: boolean;
  quote?: Quote;
  pinned?: boolean;
  /** Selection mode: show a checkbox and toggle instead of opening. */
  selectable?: boolean;
  selected?: boolean;
  onSelect: () => void;
  /** `extend` is the shift key — select the range from the last click. */
  onToggleSelect?: (extend: boolean) => void;
}) {
  const { company, last_event, last_activity_at, unread_count, muted } = entry;
  const name = displayCompanyName(company.name);
  const hasUnread = unread_count > 0;
  const highlighted = selected || (active && !selectable);

  const activate = (extend: boolean) =>
    selectable ? onToggleSelect?.(extend) : onSelect();

  return (
    <div
      role={selectable ? "checkbox" : "button"}
      aria-checked={selectable ? selected : undefined}
      tabIndex={0}
      onClick={(e) => activate(e.shiftKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate(e.shiftKey);
        }
      }}
      data-company-id={company.id}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 border-l-2 px-3 py-3 text-left transition-colors outline-none",
        highlighted
          ? "border-l-brand bg-brand-soft"
          : "border-l-transparent hover:bg-surface-hover"
      )}
    >
      {selectable && <SelectionBox selected={selected} className="mt-0.5" />}

      <CompanyAvatar
        ticker={company.ticker}
        name={name}
        size="sm"
        fallback="initials"
      />

      <div className="-mb-3 min-w-0 flex-1 border-b border-line-subtle pb-3">
        {/* Who, and when it last moved */}
        <div className="flex items-baseline justify-between gap-2">
          {company.ticker && !selectable ? (
            <a
              href={fundamentalsHref(company.ticker)}
              {...NEW_TAB}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className={cn(
                "min-w-0 truncate text-label font-medium transition-colors hover:text-brand-ink hover:underline underline-offset-2",
                hasUnread ? "text-ink" : "text-ink-muted"
              )}
              title={`${name} financials (opens in a new tab)`}
            >
              {name}
            </a>
          ) : (
            <span
              className={cn(
                "min-w-0 truncate text-label font-medium",
                hasUnread ? "text-ink" : "text-ink-muted"
              )}
            >
              {name}
            </span>
          )}
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

        {/* Where the stock is, and how much is unread */}
        <div className="mt-1 flex items-center justify-between gap-2">
          {quote ? (
            <StockQuote quote={quote} size="sm" />
          ) : (
            <span className="text-micro text-ink-dim">&nbsp;</span>
          )}
          <span className="flex shrink-0 items-center gap-1.5">
            {pinned && (
              <PinIcon className="size-3.5 text-ink-faint" aria-label="Pinned" />
            )}
            {muted && (
              <MutedIcon className="size-3.5 text-ink-faint" aria-label="Muted" />
            )}
            <CountBadge count={unread_count} muted={muted} />
          </span>
        </div>

        {/* What happened — two lines, so the reader can decide from the list */}
        <p
          className={cn(
            "mt-1.5 line-clamp-2 text-meta",
            hasUnread
              ? "text-ink-muted"
              : last_event
                ? "text-ink-faint"
                : "text-ink-dim italic"
          )}
        >
          {last_event ? last_event.headline : "No filings yet"}
        </p>
      </div>
    </div>
  );
}
