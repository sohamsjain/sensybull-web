"use client";

import { useState } from "react";

import type { FilingEvent } from "@/types/events";
import type { Quote } from "@/types/api";
import { useDashboard } from "@/app/(dashboard)/layout";
import { timeAgo, fullDateTime } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
import { evidenceEntries } from "@/lib/evidence";
import { filedPhrase } from "@/lib/forms";
import { StockQuote } from "@/components/company/stock-quote";
import { ImportantMarker, MetaLabel } from "@/components/ui/badge";
import { ChevronDownIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

import { DealTerms } from "./deal-terms";
import { CatalystsTable } from "./catalysts-table";
import { EvidenceList } from "./evidence";
import { CompanyLogo } from "./company-logo";
import { PriceReactionStrip } from "./price-reaction-strip";
import { UpdateActions } from "./update-actions";

interface FilingCardProps {
  event: FilingEvent;
  /** Last price + day change for the filer, when we have one. */
  quote?: Quote;
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
 * One update in the feed. Collapsed it's who, where the stock is, when, and
 * the headline; a click opens the summary, key dates, and the actions.
 *
 * A flat row rather than a card: the list separates updates with a hairline,
 * so a screenful of events reads as one stream instead of a stack of boxes.
 */
export function FilingCard({
  event,
  quote,
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
  const evidence = evidenceEntries(briefing);
  const hasExpandedContent = !!(
    briefing?.summary ||
    hasDealTerms ||
    evidence.length > 0 ||
    catalysts.length > 0 ||
    event.edgar_url
  );

  const category =
    briefing?.primary_event_type && briefing.primary_event_type !== "Other"
      ? briefing.primary_event_type
      : null;
  const canTrack =
    isLoggedIn && !isWatchlisted && !!company_id && !!onAddToWatchlist;
  const eventTimestamp = received_at || filing_date;

  return (
    <article
      onClick={toggleExpanded}
      className={cn(
        "group grid cursor-pointer grid-cols-[2.5rem_1fr] gap-x-3 px-4 py-3 transition-colors",
        selected && "bg-brand-soft",
        // An open update keeps its own background: the panels inside it are
        // the tinted things, and a hover fill would swallow them.
        !selected && !expanded && "hover:bg-surface-hover/60"
      )}
    >
      <CompanyLogo ticker={ticker} name={company_name} />

      <div className="min-w-0">
        {/* Identity · price · time */}
        <div className="flex items-baseline justify-between gap-3">
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
                <span
                  className={cn(
                    "truncate text-meta text-ink-faint",
                    ticker && "hidden sm:inline"
                  )}
                >
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
                <span
                  className={cn(
                    "truncate text-meta text-ink-faint",
                    ticker && "hidden sm:inline"
                  )}
                >
                  {company_name}
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-baseline gap-3">
            <StockQuote quote={quote} size="sm" />
            {/* Fixed width so prices line up in a column down the feed */}
            <span
              className="w-14 text-right text-micro whitespace-nowrap tabular-nums text-ink-faint"
              title={fullDateTime(eventTimestamp)}
            >
              {timeAgo(eventTimestamp)}
            </span>
          </div>
        </div>

        {/* Category, priority, and the one action worth offering unopened */}
        {(important || category || canTrack) && (
          <div className="mt-0.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              {important && <ImportantMarker />}
              {category && <MetaLabel>{category}</MetaLabel>}
            </div>
            {canTrack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchlist!(company_id!);
                }}
                disabled={addingToWatchlist}
                className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-micro font-medium text-brand-ink transition-colors hover:bg-brand-soft disabled:opacity-50"
                title={`Track ${ticker || company_name}`}
              >
                <PlusIcon className="size-3" />
                Track
              </button>
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

            {/* Proof before terms: the reader is told what happened, then
                shown the sentence that says so. */}
            <EvidenceList entries={evidence} />

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
