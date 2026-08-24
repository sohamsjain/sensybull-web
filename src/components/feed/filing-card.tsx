"use client";

import { useState } from "react";

import type { FilingEvent } from "@/types/events";
import { useDashboard } from "@/app/(dashboard)/layout";
import { timeAgo, fullDateTime } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
import { filedPhrase } from "@/lib/forms";
import { ImportantMarker, MetaLabel } from "@/components/ui/badge";
import { ChevronDownIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

import { DealTerms } from "./deal-terms";
import { CatalystsTable } from "./catalysts-table";
import { CompanyLogo } from "./company-logo";
import { PriceReactionStrip } from "./price-reaction-strip";
import { UpdateActions } from "./update-actions";

interface FilingCardProps {
  event: FilingEvent;
  isWatchlisted?: boolean;
  onAddToWatchlist?: (companyId: string) => void;
  addingToWatchlist?: boolean;
  isLoggedIn?: boolean;
  /** Controlled expansion (used by the feed's keyboard navigation). */
  expanded?: boolean;
  onToggleExpanded?: () => void;
  /** Keyboard-navigation cursor highlight. */
  selected?: boolean;
}

/**
 * One update in the feed. Collapsed it's who, when, and the headline; a
 * click opens the summary, key dates, and the actions.
 *
 * A flat row rather than a card: the list separates updates with a hairline,
 * so a screenful of events reads as one stream instead of a stack of boxes.
 */
export function FilingCard({
  event,
  isWatchlisted,
  onAddToWatchlist,
  addingToWatchlist,
  isLoggedIn,
  expanded: expandedProp,
  onToggleExpanded,
  selected = false,
}: FilingCardProps) {
  const { ticker, company_name, company_id, briefing, filing_date, received_at } =
    event;

  const important = isImportant(event);
  const { openCompany } = useDashboard();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = expandedProp ?? internalExpanded;
  const toggleExpanded =
    onToggleExpanded ?? (() => setInternalExpanded((e) => !e));

  const catalysts =
    event.catalysts?.length > 0 ? event.catalysts : briefing?.catalysts || [];
  const hasDealTerms =
    !!briefing?.deal_terms && Object.keys(briefing.deal_terms).length > 0;
  const hasExpandedContent = !!(
    briefing?.summary ||
    hasDealTerms ||
    catalysts.length > 0 ||
    event.edgar_url
  );

  const eventTimestamp = received_at || filing_date;

  return (
    <article
      onClick={toggleExpanded}
      className={cn(
        "group grid cursor-pointer grid-cols-[2.5rem_1fr] gap-x-3 px-4 py-3 transition-colors",
        selected ? "bg-brand-soft" : "hover:bg-surface-hover/60"
      )}
    >
      <CompanyLogo ticker={ticker} name={company_name} />

      <div className="min-w-0">
        {/* Identity + time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-2">
            {company_id ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCompany({
                    id: company_id,
                    name: company_name,
                    ticker,
                    cik: event.cik || null,
                  });
                }}
                className="group/company flex min-w-0 items-baseline gap-2 text-left"
                title={`View ${company_name}`}
              >
                {ticker && (
                  <span className="shrink-0 font-mono text-label font-semibold text-ink transition-colors group-hover/company:text-brand-ink">
                    {ticker}
                  </span>
                )}
                <span className="truncate text-meta text-ink-faint">
                  {company_name}
                </span>
              </button>
            ) : (
              <>
                {ticker && (
                  <span className="shrink-0 font-mono text-label font-semibold text-ink">
                    {ticker}
                  </span>
                )}
                <span className="truncate text-meta text-ink-faint">
                  {company_name}
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isLoggedIn && !isWatchlisted && company_id && onAddToWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchlist(company_id);
                }}
                disabled={addingToWatchlist}
                className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-micro font-medium text-brand-ink transition-colors hover:bg-brand-soft disabled:opacity-50"
                title="Add to watchlist"
              >
                <PlusIcon className="size-3" />
                <span className="hidden sm:inline">Track</span>
              </button>
            )}
            <span
              className="text-micro whitespace-nowrap tabular-nums text-ink-faint"
              title={fullDateTime(eventTimestamp)}
            >
              {timeAgo(eventTimestamp)}
            </span>
          </div>
        </div>

        {/* Category + Important marker */}
        {(important ||
          (briefing?.primary_event_type &&
            briefing.primary_event_type !== "Other")) && (
          <div className="mt-0.5 flex flex-wrap items-center gap-2.5">
            {important && <ImportantMarker />}
            {briefing?.primary_event_type &&
              briefing.primary_event_type !== "Other" && (
                <MetaLabel>{briefing.primary_event_type}</MetaLabel>
              )}
          </div>
        )}

        {/* Headline */}
        <h3 className="mt-1 text-body-lg leading-snug text-ink">
          {briefing
            ? briefing.headline
            : `${company_name} ${filedPhrase(event.signal_type)}.`}
        </h3>

        {/* Details, only when opened */}
        {expanded && (
          <>
            {briefing?.summary && (
              <p className="mt-1.5 text-label leading-relaxed text-ink-muted">
                {briefing.summary}
              </p>
            )}

            {briefing?.mode === "facts_only" && (
              <p className="mt-1.5 text-meta leading-relaxed text-ink-faint">
                An AI summary isn&apos;t available for this filing — read the
                source document below.
              </p>
            )}

            {hasDealTerms && <DealTerms terms={briefing!.deal_terms} />}

            {catalysts.length > 0 && <CatalystsTable catalysts={catalysts} />}

            {event.price_reactions && (
              <PriceReactionStrip
                reactions={event.price_reactions}
                className="mt-2.5"
              />
            )}

            <UpdateActions event={event} />
          </>
        )}

        {hasExpandedContent && (
          <div className="mt-1.5 flex select-none items-center gap-1 text-micro text-ink-faint transition-colors group-hover:text-ink-muted">
            <ChevronDownIcon
              className={cn(
                "size-3 transition-transform duration-150",
                expanded && "rotate-180"
              )}
            />
            {expanded ? "Show less" : "Read more"}
          </div>
        )}
      </div>
    </article>
  );
}
