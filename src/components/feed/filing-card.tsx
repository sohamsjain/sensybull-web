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

export function FilingCard({ event }: { event: FilingEvent }) {
  const {
    ticker,
    company_name,
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

  return (
    <div
      className={`bg-slate-100 dark:bg-[#12121e] rounded-lg border ${sigConfig.border} p-4 cursor-pointer transition-colors hover:bg-slate-100/80 dark:hover:bg-[#12121e]/80 ${isLow ? "opacity-60" : ""}`}
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <SignificanceBadge level={significance} />
          {ticker && (
            <span className="font-mono font-semibold text-slate-900 dark:text-white/90">{ticker}</span>
          )}
          <span className="text-slate-500 dark:text-slate-400 text-sm truncate">
            {company_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <SentimentDot sentiment={sentiment} />
          <span className="text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
            {timeAgo(received_at || filing_date)}
          </span>
        </div>
      </div>

      {/* Briefing */}
      {briefing && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-slate-700 dark:text-slate-200 text-sm font-medium flex-1 min-w-0">
              {briefing.headline}
            </p>
            {briefing.primary_event_type &&
              briefing.primary_event_type !== "Other" && (
                <EventTypeTag type={briefing.primary_event_type} primary />
              )}
          </div>

          {briefing.investor_takeaway && (
            <p className="text-slate-700 dark:text-slate-200 text-sm italic mt-1">
              {briefing.investor_takeaway}
            </p>
          )}

          {briefing.summary && (!isLow || expanded) && (
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-1">
              {briefing.summary}
            </p>
          )}

          {briefing.deal_terms &&
            Object.keys(briefing.deal_terms).length > 0 && (
              <DealTerms terms={briefing.deal_terms} />
            )}

          {catalysts.length > 0 && <CatalystsTable catalysts={catalysts} />}
        </div>
      )}

      {/* Secondary event type tags */}
      {event_types?.filter((t) => t !== briefing?.primary_event_type).length >
        0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {event_types
            .filter((t) => t !== briefing?.primary_event_type)
            .map((type, i) => (
              <EventTypeTag key={i} type={type} />
            ))}
        </div>
      )}

      {/* Category tags */}
      {items?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {items.map((item, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 rounded text-xs"
            >
              {item.category}
            </span>
          ))}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (exhibits?.length > 0 || edgar_url) && (
        <div
          className="mt-3 pt-3 border-t border-slate-200 dark:border-white/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          {exhibits?.length > 0 && (
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wide mb-1">
                Exhibits
              </p>
              {exhibits.map((ex, i) => (
                <a
                  key={i}
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-violet-400 hover:text-violet-300 text-xs mb-0.5"
                >
                  {ex.type} &mdash; {ex.description}
                </a>
              ))}
            </div>
          )}

          {edgar_url && (
            <a
              href={edgar_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-3 py-1.5 bg-slate-200 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 rounded text-xs font-semibold uppercase tracking-wide transition-colors"
            >
              Read SEC Filing &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}
