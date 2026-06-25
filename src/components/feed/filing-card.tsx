"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import type { Significance, Sentiment } from "@/config/constants";
import { SIGNIFICANCE_CONFIG } from "@/config/constants";
import { timeAgo } from "@/lib/utils";
import { SignificanceBadge } from "./significance-badge";
import { SentimentDot } from "./sentiment-dot";
import { DealTerms } from "./deal-terms";
import { CatalystsTable } from "./catalysts-table";
import { EventTypeTag } from "./event-type-tag";
import { CompanyLogo } from "./company-logo";
import { AnalysisSection } from "./analysis-section";

interface FilingCardProps {
  event: FilingEvent;
  isWatchlisted?: boolean;
  onAddToWatchlist?: (companyId: string) => void;
  addingToWatchlist?: boolean;
  isLoggedIn?: boolean;
}

const SIG_ACCENT: Record<string, string> = {
  High: "border-l-red-500",
  Medium: "border-l-amber-500",
  Low: "border-l-slate-500",
};

const SIG_GLOW: Record<string, string> = {
  High: "shadow-[inset_0_1px_0_0_rgba(239,68,68,0.08),0_0_24px_-6px_rgba(239,68,68,0.12)]",
  Medium: "shadow-[inset_0_1px_0_0_rgba(245,158,11,0.06)]",
  Low: "",
};

export function FilingCard({
  event,
  isWatchlisted,
  onAddToWatchlist,
  addingToWatchlist,
  isLoggedIn,
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
  const sigConfig = SIGNIFICANCE_CONFIG[significance] || SIGNIFICANCE_CONFIG.Medium;
  const sentiment: Sentiment =
    (briefing?.sentiment as Sentiment) || "Neutral";
  const isLow = significance === "Low";

  const [expanded, setExpanded] = useState(false);

  const catalysts =
    eventCatalysts?.length > 0
      ? eventCatalysts
      : briefing?.catalysts || [];

  const secondaryTypes = event_types?.filter(
    (t) => t !== briefing?.primary_event_type
  ) || [];

  const hasExhibits = exhibits?.length > 0;
  const hasExpandedContent = items?.length > 0 || (isLow && briefing?.summary);

  return (
    <div
      className={`
        group/card relative
        bg-slate-50 dark:bg-[#0f0f1a]
        rounded-xl border-l-[3px] ${SIG_ACCENT[significance] || SIG_ACCENT.Medium}
        border border-l-0 border-slate-200 dark:border-white/[0.06]
        ${SIG_GLOW[significance] || ""}
        transition-all duration-200
        hover:bg-slate-100/80 dark:hover:bg-[#13132a]
        hover:border-slate-300 dark:hover:border-white/[0.1]
        ${isLow ? "opacity-65" : ""}
        cursor-pointer
      `}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="p-4 sm:p-5">
        {/* ---- Header: Logo + Info + Actions ---- */}
        <div className="flex gap-3.5">
          <CompanyLogo ticker={ticker} name={company_name} />

          <div className="flex-1 min-w-0">
            {/* Top line: ticker, company, time */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {ticker && (
                  <span className="font-mono font-bold text-[15px] text-slate-900 dark:text-white tracking-tight">
                    {ticker}
                  </span>
                )}
                <span className="text-slate-400 dark:text-slate-500 text-sm truncate">
                  {company_name}
                </span>
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
                      bg-violet-500/10 text-violet-400
                      hover:bg-violet-500/20 hover:text-violet-300
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
                <span className="text-slate-400 dark:text-slate-500 text-xs tabular-nums whitespace-nowrap">
                  {timeAgo(received_at || filing_date)}
                </span>
              </div>
            </div>

            {/* Meta line: significance + sentiment + event type */}
            <div className="flex items-center gap-2 flex-wrap">
              <SignificanceBadge level={significance} />
              <SentimentDot sentiment={sentiment} />
              {briefing?.primary_event_type &&
                briefing.primary_event_type !== "Other" && (
                  <EventTypeTag type={briefing.primary_event_type} primary />
                )}
              {secondaryTypes.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {secondaryTypes.map((type, i) => (
                    <EventTypeTag key={i} type={type} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Briefing Content ---- */}
        {briefing && (
          <div className="mt-3.5 pl-[3.375rem]">
            {/* Headline */}
            <h3 className="text-[15px] sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
              {briefing.headline}
            </h3>

            {/* Investor takeaway */}
            {briefing.investor_takeaway && (
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex gap-2">
                <span className="text-amber-400/80 shrink-0 mt-0.5">&#9670;</span>
                <span className="italic">{briefing.investor_takeaway}</span>
              </p>
            )}

            {/* Summary */}
            {briefing.summary && (!isLow || expanded) && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {briefing.summary}
              </p>
            )}

            {/* Deal Terms */}
            {briefing.deal_terms &&
              Object.keys(briefing.deal_terms).length > 0 && (
                <DealTerms terms={briefing.deal_terms} />
              )}

            {/* Catalysts */}
            {catalysts.length > 0 && <CatalystsTable catalysts={catalysts} />}

            {/* Second-order analysis */}
            <AnalysisSection analysis={event.analysis} />
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

        {/* ---- Action row: Exhibits + SEC Filing (always visible) ---- */}
        {(hasExhibits || edgar_url) && (
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
                  bg-violet-500/10 text-violet-400
                  hover:bg-violet-500/20 hover:text-violet-300
                  ring-1 ring-violet-500/20 hover:ring-violet-500/30
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
          </div>
        )}

        {/* ---- Expand hint ---- */}
        {!expanded && hasExpandedContent && (
          <div className="mt-2 pl-[3.375rem]">
            <span className="text-[11px] text-slate-400 dark:text-slate-600 group-hover/card:text-slate-500 dark:group-hover/card:text-slate-400 transition-colors">
              Click to expand
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
