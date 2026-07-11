"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import { useDashboard } from "@/app/(dashboard)/layout";
import { timeAgo, fullDateTime } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
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
 * One update in the feed. Collapsed it's just who + when + the headline;
 * a click opens the summary, key dates, and the action buttons.
 *
 * Rendered as a flat row (no card box) — the list separates updates with
 * a simple divider, like Substack or Twitter's timeline.
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
  const {
    ticker,
    company_name,
    company_id,
    briefing,
    filing_date,
    received_at,
  } = event;

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
    <div
      className={`
        group/card relative
        transition-colors
        hover:bg-slate-50 dark:hover:bg-white/[0.02]
        ${selected ? "bg-indigo-500/[0.06] dark:bg-indigo-400/[0.08]" : ""}
        cursor-pointer
      `}
      onClick={toggleExpanded}
    >
      <div className="px-4 sm:px-5 py-4">
        {/* ---- Header: Logo + company + time ---- */}
        <div className="flex gap-3.5">
          <CompanyLogo ticker={ticker} name={company_name} />

          <div className="flex-1 min-w-0">
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
                <span
                  className="text-slate-400 dark:text-slate-500 text-xs tabular-nums whitespace-nowrap"
                  title={fullDateTime(eventTimestamp)}
                >
                  {timeAgo(eventTimestamp)}
                </span>
              </div>
            </div>

            {/* Meta line: category + Important marker */}
            {(important ||
              (briefing?.primary_event_type &&
                briefing.primary_event_type !== "Other")) && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {important && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                    Important
                  </span>
                )}
                {briefing?.primary_event_type &&
                  briefing.primary_event_type !== "Other" && (
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      {briefing.primary_event_type}
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ---- Headline ---- */}
        <div className="mt-3 pl-[3.375rem]">
          {briefing ? (
            <h3 className="text-[15px] sm:text-base font-normal text-slate-800 dark:text-slate-100 leading-snug">
              {briefing.headline}
            </h3>
          ) : (
            <h3 className="text-[15px] sm:text-base font-normal text-slate-800 dark:text-slate-100 leading-snug">
              {company_name} filed an {event.signal_type}.
            </h3>
          )}

          {/* ---- Details, only when opened ---- */}
          {expanded && (
            <>
              {briefing?.summary && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {briefing.summary}
                </p>
              )}

              {/* Facts-only provenance: the AI summary was withheld because
                  it couldn't be verified against the filing text */}
              {briefing?.mode === "facts_only" && (
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Showing verified filing facts only — an AI summary wasn&apos;t
                  available for this filing. Read the source document below.
                </p>
              )}

              {hasDealTerms && <DealTerms terms={briefing!.deal_terms} />}

              {catalysts.length > 0 && <CatalystsTable catalysts={catalysts} />}

              {event.price_reactions && (
                <PriceReactionStrip
                  reactions={event.price_reactions}
                  className="mt-3"
                />
              )}

              <UpdateActions event={event} />
            </>
          )}

          {/* ---- Expand affordance ---- */}
          {hasExpandedContent && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-600 group-hover/card:text-slate-500 dark:group-hover/card:text-slate-400 transition-colors select-none">
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
    </div>
  );
}
