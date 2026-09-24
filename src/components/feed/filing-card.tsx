"use client";

import { useState } from "react";

import type { FilingEvent } from "@/types/events";
import type { Quote } from "@/types/api";
import { timeAgo, fullDateTime } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
import { evidenceEntries } from "@/lib/evidence";
import { filedPhrase } from "@/lib/forms";
import { displayCompanyName } from "@/lib/company-name";
import { fundamentalsHref, NEW_TAB } from "@/lib/fundamentals/links";
import { StockQuote } from "@/components/company/stock-quote";
import { ImportantMarker, MetaLabel } from "@/components/ui/badge";
import { ChevronDownIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatMarketCap } from "@/lib/feed-filters";

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
  /**
   * Narrow the feed to this update's category or sector. When set, those
   * labels become buttons — the reader pivots from one interesting update
   * to everything like it. Absent on permalinks, where there's no feed.
   */
  onFilterBy?: (by: { eventType?: string; sector?: string }) => void;
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
  onFilterBy,
}: FilingCardProps) {
  const { ticker, company_id, briefing, filing_date, received_at } = event;
  const company_name = displayCompanyName(event.company_name);

  const important = isImportant(event);
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
  const sector = event.sector || null;
  const cap = formatMarketCap(event.market_cap);

  return (
    <article
      onClick={toggleExpanded}
      className={cn(
        "group grid cursor-pointer grid-cols-[2.5rem_1fr] gap-x-3.5 px-4 py-4 transition-colors",
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
            {/* The name opens the company's financials in a new tab, so
                the reader keeps their place in the stream */}
            {ticker ? (
              <a
                href={fundamentalsHref(ticker)}
                {...NEW_TAB}
                onClick={(e) => e.stopPropagation()}
                className="group/company flex min-w-0 items-baseline gap-2 text-left"
                title={`${company_name} financials (opens in a new tab)`}
              >
                <span className="shrink-0 font-mono text-label font-semibold text-ink transition-colors group-hover/company:text-brand-ink">
                  {ticker}
                </span>
                <span className="hidden truncate text-meta text-ink-faint transition-colors group-hover/company:text-brand-ink sm:inline">
                  {company_name}
                </span>
              </a>
            ) : (
              <span className="truncate text-meta text-ink-faint">{company_name}</span>
            )}
            {/* What kind of company: the market cap always (the same news
                means different things at $300M and $300B), the sector from
                md up */}
            {cap && (
              <span
                className="shrink-0 text-micro whitespace-nowrap text-ink-faint"
                title="Market cap"
              >
                <span className="font-mono tabular-nums">{cap}</span> cap
              </span>
            )}
            {sector && (
              <FilterableLabel
                label={sector}
                title={`Show ${sector} updates`}
                onClick={onFilterBy && (() => onFilterBy({ sector }))}
                className="hidden truncate text-micro text-ink-faint md:inline"
              />
            )}
          </div>

          <div className="flex shrink-0 items-baseline gap-3">
            <StockQuote quote={quote} size="sm" />
            {/* Fixed width so prices line up in a column down the feed.
                Relative time and the reader's timezone differ between a
                server render (permalinks) and the browser; the client's
                wins, so don't flag the mismatch. */}
            <span
              className="w-16 text-right text-micro whitespace-nowrap tabular-nums text-ink-faint"
              title={fullDateTime(eventTimestamp)}
              suppressHydrationWarning
            >
              {timeAgo(eventTimestamp)}
            </span>
          </div>
        </div>

        {/* Category, priority, and the one action worth offering unopened */}
        {(important || category || canTrack) && (
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              {important && <ImportantMarker />}
              {category &&
                (onFilterBy ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterBy({ eventType: category });
                    }}
                    title={`Show ${category} updates`}
                    className="-mx-1 rounded-xs px-1 transition-colors hover:bg-surface-hover [&>span]:hover:text-brand-ink"
                  >
                    <MetaLabel>{category}</MetaLabel>
                  </button>
                ) : (
                  <MetaLabel>{category}</MetaLabel>
                ))}
            </div>
            {canTrack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchlist!(company_id!);
                }}
                disabled={addingToWatchlist}
                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-sm px-2 text-micro font-medium text-brand-ink transition-colors hover:bg-brand-soft disabled:opacity-50"
                title={`Track ${ticker || company_name}`}
              >
                <PlusIcon className="size-3.5" />
                Track
              </button>
            )}
          </div>
        )}

        {/* Headline */}
        <h3 className="mt-1.5 text-body-lg font-medium text-ink">
          {briefing
            ? briefing.headline
            : `${company_name} ${filedPhrase(event.signal_type)}.`}
        </h3>

        {/* Details, only when opened */}
        {expanded && (
          <>
            {briefing?.summary && (
              <p className="mt-2.5 text-label leading-relaxed text-ink-muted">
                {briefing.summary}
              </p>
            )}

            {briefing?.mode === "facts_only" && (
              <p className="mt-2.5 text-meta leading-relaxed text-ink-faint">
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
          <div className="mt-2 flex select-none items-center gap-1.5 text-micro font-medium text-ink-faint transition-colors group-hover:text-brand-ink">
            <ChevronDownIcon
              className={cn(
                "size-3.5 transition-transform duration-150",
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

/** Muted metadata that becomes a filter button when the feed offers one. */
function FilterableLabel({
  label,
  title,
  onClick,
  className,
}: {
  label: string;
  title: string;
  onClick?: () => void;
  className?: string;
}) {
  if (!onClick) return <span className={className}>{label}</span>;
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(className, "transition-colors hover:text-brand-ink hover:underline")}
    >
      {label}
    </button>
  );
}
