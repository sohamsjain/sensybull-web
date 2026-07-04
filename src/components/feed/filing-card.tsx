"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import type { Significance, Sentiment } from "@/config/constants";
import { useDashboard } from "@/app/(dashboard)/layout";
import { timeAgo, fullDateTime, marketSession } from "@/lib/utils";
import { SignificanceBadge } from "./significance-badge";
import { DealTerms } from "./deal-terms";
import { CatalystsTable } from "./catalysts-table";
import { EventTypeTag } from "./event-type-tag";
import { CompanyLogo } from "./company-logo";
import { InvestorTakeaway } from "./investor-takeaway";
import { SignificanceExplainer } from "./significance-explainer";
import { PriceReactionStrip } from "./price-reaction-strip";
import { formTag, formTagDuplicatesEventType } from "@/lib/forms";

interface FilingCardProps {
  event: FilingEvent;
  isWatchlisted?: boolean;
  onAddToWatchlist?: (companyId: string) => void;
  addingToWatchlist?: boolean;
  isLoggedIn?: boolean;
  /** Compact hides summary/deal terms/catalysts until expanded. */
  density?: "compact" | "comfortable";
  /** Controlled expansion (used by the feed's keyboard navigation). */
  expanded?: boolean;
  onToggleExpanded?: () => void;
  /** Keyboard-navigation cursor highlight. */
  selected?: boolean;
}

// Only genuinely material events get an accent; everything else stays quiet
const SIG_ACCENT: Record<string, string> = {
  High: "border-l-red-400/60 dark:border-l-red-400/40",
  Medium: "border-l-slate-200/80 dark:border-l-white/[0.06]",
  Low: "border-l-slate-200/80 dark:border-l-white/[0.06]",
};

export function FilingCard({
  event,
  isWatchlisted,
  onAddToWatchlist,
  addingToWatchlist,
  isLoggedIn,
  density = "comfortable",
  expanded: expandedProp,
  onToggleExpanded,
  selected = false,
}: FilingCardProps) {
  const {
    ticker,
    company_name,
    company_id,
    briefing,
    items,
    exhibits,
    filing_date,
    edgar_url,
    received_at,
    event_types,
    catalysts: eventCatalysts,
  } = event;

  const significance: Significance =
    (briefing?.significance as Significance) || "Medium";
  const sentiment: Sentiment =
    (briefing?.sentiment as Sentiment) || "Neutral";
  const isLow = significance === "Low";
  const compact = density === "compact";

  const { openCompany } = useDashboard();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const expanded = expandedProp ?? internalExpanded;
  const toggleExpanded =
    onToggleExpanded ?? (() => setInternalExpanded((e) => !e));

  const copyPermalink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/e/${event.id}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const catalysts =
    eventCatalysts?.length > 0
      ? eventCatalysts
      : briefing?.catalysts || [];

  const secondaryTypes = event_types?.filter(
    (t) => t !== briefing?.primary_event_type
  ) || [];

  const hasExhibits = exhibits?.length > 0;
  const hasDealTerms =
    !!briefing?.deal_terms && Object.keys(briefing.deal_terms).length > 0;
  // Collapsed compact card = materiality + category + headline only;
  // everything else opens on demand.
  const hasExpandedContent = compact
    ? !!(
        briefing?.investor_takeaway ||
        briefing?.summary ||
        hasDealTerms ||
        catalysts.length > 0 ||
        items?.length > 0 ||
        hasExhibits ||
        edgar_url
      )
    : items?.length > 0 || (isLow && !!briefing?.summary);

  const showDetails = expanded || !compact;
  const showTakeaway = !!briefing?.investor_takeaway && showDetails;
  const showSummary =
    !!briefing?.summary && (expanded || (!compact && !isLow));
  const showActions = showDetails;

  const eventTimestamp = received_at || filing_date;
  const session = marketSession(eventTimestamp);

  return (
    <div
      className={`
        group/card relative
        bg-white dark:bg-[#12141b]
        rounded-xl border-l-[3px] ${SIG_ACCENT[significance] || SIG_ACCENT.Medium}
        border border-l-0 border-slate-200/80 dark:border-white/[0.06]
        shadow-sm shadow-slate-200/50 dark:shadow-none
        transition-all duration-200
        hover:border-slate-300 dark:hover:bg-[#15181f] dark:hover:border-white/[0.1]
        ${isLow ? "opacity-70" : ""}
        ${selected ? "ring-2 ring-indigo-500/50 dark:ring-indigo-400/40" : ""}
        cursor-pointer
      `}
      onClick={toggleExpanded}
    >
      <div className="p-4 sm:p-5">
        {/* ---- Header: Logo + Info + Actions ---- */}
        <div className="flex gap-3.5">
          <CompanyLogo ticker={ticker} name={company_name} />

          <div className="flex-1 min-w-0">
            {/* Top line: ticker, company, time */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
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
                    className="flex items-center gap-2 min-w-0 group/company"
                    title={`View ${company_name}`}
                  >
                    {ticker && (
                      <span className="font-mono font-bold text-[15px] text-slate-900 dark:text-white tracking-tight group-hover/company:text-indigo-600 dark:group-hover/company:text-indigo-400 transition-colors">
                        {ticker}
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500 text-sm truncate group-hover/company:text-slate-600 dark:group-hover/company:text-slate-300 transition-colors">
                      {company_name}
                    </span>
                  </button>
                ) : (
                  <>
                    {ticker && (
                      <span className="font-mono font-bold text-[15px] text-slate-900 dark:text-white tracking-tight">
                        {ticker}
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500 text-sm truncate">
                      {company_name}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isLoggedIn && !isWatchlisted && company_id && onAddToWatchlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist(company_id);
                    }}
                    disabled={addingToWatchlist}
                    className="
                      flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                      bg-indigo-500/10 text-indigo-600 dark:text-indigo-400
                      hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300
                      disabled:opacity-50
                      transition-colors
                    "
                    title="Add to watchlist"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                      <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="hidden sm:inline">Watch</span>
                  </button>
                )}
                {session && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                    title={
                      session === "pre-market"
                        ? "Filed before market open (9:30 AM ET)"
                        : "Filed after market close (4:00 PM ET)"
                    }
                  >
                    {session === "pre-market" ? "Pre" : "AH"}
                  </span>
                )}
                <span
                  className="text-slate-400 dark:text-slate-500 text-xs tabular-nums whitespace-nowrap"
                  title={fullDateTime(eventTimestamp)}
                >
                  {timeAgo(eventTimestamp)}
                </span>
              </div>
            </div>

            {/* Meta line: category + form type + significance */}
            <div className="flex items-center gap-2 flex-wrap">
              {briefing?.primary_event_type &&
                briefing.primary_event_type !== "Other" && (
                  <EventTypeTag type={briefing.primary_event_type} primary />
                )}
              {event.signal_type &&
                event.signal_type !== "8-K" &&
                !formTagDuplicatesEventType(
                  event.signal_type,
                  briefing?.primary_event_type
                ) && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                    title={`SEC form ${event.signal_type}`}
                  >
                    {formTag(event.signal_type)}
                  </span>
                )}
              {significance === "High" && (
                <SignificanceBadge level={significance} />
              )}
              {showDetails && secondaryTypes.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {secondaryTypes.map((type, i) => (
                    <EventTypeTag key={i} type={type} />
                  ))}
                </div>
              )}
            </div>

            {/* Price reaction since filing (populates live as measured) */}
            {event.price_reactions && (
              <PriceReactionStrip
                reactions={event.price_reactions}
                className="mt-1.5"
              />
            )}
          </div>
        </div>

        {/* ---- Briefing Content ---- */}
        {briefing && (
          <div className="mt-3.5 pl-[3.375rem]">
            {/* Headline */}
            <h3 className="text-[15px] sm:text-base font-normal text-slate-800 dark:text-slate-100 leading-snug">
              {briefing.headline}
            </h3>

            {/* Investor takeaway */}
            {showTakeaway && (
              <InvestorTakeaway
                text={briefing.investor_takeaway}
                sentiment={sentiment}
                className="mt-1.5 text-sm leading-relaxed"
              />
            )}

            {/* Summary */}
            {showSummary && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {briefing.summary}
              </p>
            )}

            {/* Deal Terms */}
            {showDetails && hasDealTerms && (
              <DealTerms terms={briefing.deal_terms} />
            )}

            {/* Catalysts */}
            {showDetails && catalysts.length > 0 && (
              <CatalystsTable catalysts={catalysts} />
            )}

            {/* Scoring transparency */}
            {expanded && (
              <SignificanceExplainer level={significance} items={items} />
            )}
          </div>
        )}

        {/* ---- Expanded: Item categories ---- */}
        {expanded && items?.length > 0 && (
          <div className="mt-3 pl-[3.375rem] flex flex-wrap gap-1.5">
            {items.map((item, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-200/80 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 rounded-md text-xs"
              >
                {item.category}
              </span>
            ))}
          </div>
        )}

        {/* ---- Action row: Exhibits + SEC Filing ---- */}
        {showActions && (
          <div
            className="mt-3.5 pl-[3.375rem] flex items-center gap-2 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {hasExhibits && exhibits.map((ex, i) => (
              <a
                key={i}
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                  bg-slate-100 dark:bg-white/[0.05]
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-200 dark:hover:bg-white/[0.1]
                  ring-1 ring-slate-200 dark:ring-white/[0.06]
                  hover:ring-slate-300 dark:hover:ring-white/[0.12]
                  transition-all
                "
                title={ex.description}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-50">
                  <path d="M7 1.5h3.5V5M10.5 1.5 6 6M5 2H2.5a1 1 0 0 0-1 1v6.5a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {ex.type}
              </a>
            ))}

            {edgar_url && (
              <a
                href={edgar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold
                  bg-indigo-500/10 text-indigo-600 dark:text-indigo-400
                  hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300
                  ring-1 ring-indigo-500/20 hover:ring-indigo-500/30
                  transition-all
                "
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M2 2h8v8H2z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  <path d="M4 4.5h4M4 6.5h4M4 8.5h2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
                SEC Filing
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 opacity-60">
                  <path d="M3 7l4-4M3 3h4v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}

            <button
              onClick={copyPermalink}
              className="
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                text-slate-500 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-white/[0.06]
                ring-1 ring-slate-200 dark:ring-white/[0.06]
                transition-all
              "
              title="Copy a shareable link to this event"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-60">
                <path d="M5 7a2.5 2.5 0 0 0 3.54 0l1.72-1.72a2.5 2.5 0 1 0-3.54-3.54l-.86.86M7 5a2.5 2.5 0 0 0-3.54 0L1.74 6.72a2.5 2.5 0 1 0 3.54 3.54l.86-.86" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}

        {/* ---- Expand affordance ---- */}
        {hasExpandedContent && (
          <div className="mt-2 pl-[3.375rem] flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-600 group-hover/card:text-slate-500 dark:group-hover/card:text-slate-400 transition-colors select-none">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {expanded ? "Show less" : "Read more"}
          </div>
        )}
      </div>
    </div>
  );
}
