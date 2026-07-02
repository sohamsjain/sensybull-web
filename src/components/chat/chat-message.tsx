"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import type { Significance, Sentiment } from "@/config/constants";
import { messageTime, fullDateTime } from "@/lib/utils";
import { SignificanceBadge } from "@/components/feed/significance-badge";
import { SentimentDot } from "@/components/feed/sentiment-dot";
import { DealTerms } from "@/components/feed/deal-terms";
import { CatalystsTable } from "@/components/feed/catalysts-table";
import { EventTypeTag } from "@/components/feed/event-type-tag";
import { InvestorTakeaway } from "@/components/feed/investor-takeaway";

/**
 * One filing event rendered as an incoming chat message.
 * Collapsed, it shows only the materiality indicator, category label, and
 * headline; the briefing details live behind the Details toggle.
 */
export function ChatMessage({ event }: { event: FilingEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { briefing, exhibits, edgar_url } = event;

  const significance = (briefing?.significance as Significance) || "Medium";
  const sentiment = (briefing?.sentiment as Sentiment) || "Neutral";
  const catalysts =
    event.catalysts?.length > 0 ? event.catalysts : briefing?.catalysts || [];

  const hasDetails = !!(
    briefing?.investor_takeaway ||
    briefing?.summary ||
    (briefing?.deal_terms && Object.keys(briefing.deal_terms).length > 0) ||
    catalysts.length > 0 ||
    exhibits?.length > 0
  );

  const toggleExpanded = () => {
    // Selecting text to copy shouldn't toggle the message open/closed
    if (window.getSelection()?.toString()) return;
    setExpanded((e) => !e);
  };

  return (
    <div className="flex justify-start pl-2 md:pl-4">
      <div
        className="max-w-[92%] md:max-w-[70%] bg-white ring-1 ring-slate-200/80 dark:ring-0 dark:bg-[#14161c] rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm shadow-slate-300/40 dark:shadow-md dark:shadow-black/20 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#171a21]"
        onClick={toggleExpanded}
      >
        {/* Meta row: materiality + category */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <SignificanceBadge level={significance} />
          {briefing?.primary_event_type &&
            briefing.primary_event_type !== "Other" && (
              <EventTypeTag type={briefing.primary_event_type} primary />
            )}
          <SentimentDot sentiment={sentiment} label={expanded} />
          <span className="text-slate-400 dark:text-slate-500 text-[10.5px] ml-auto whitespace-nowrap uppercase tracking-wide">
            {event.signal_type}
          </span>
        </div>

        {/* Headline */}
        {briefing ? (
          <p className="text-slate-900 dark:text-slate-100/90 text-[14px] font-medium leading-snug">
            {briefing.headline}
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {event.company_name} filed an {event.signal_type}.
          </p>
        )}

        {/* Details, on demand */}
        {expanded && briefing && (
          <>
            {briefing.investor_takeaway && (
              <InvestorTakeaway
                text={briefing.investor_takeaway}
                sentiment={sentiment}
                className="mt-1.5 text-[13px]"
              />
            )}
            {briefing.summary && (
              <p className="text-slate-600/90 dark:text-slate-300/90 text-[13px] leading-[1.5] mt-1.5">
                {briefing.summary}
              </p>
            )}
            {briefing.deal_terms &&
              Object.keys(briefing.deal_terms).length > 0 && (
                <DealTerms terms={briefing.deal_terms} />
              )}
            {catalysts.length > 0 && <CatalystsTable catalysts={catalysts} />}
            {exhibits?.length > 0 && (
              <div
                className="mt-3 pt-3 border-t border-slate-200 dark:border-white/[0.06]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">
                  Exhibits
                </p>
                {exhibits.map((ex, i) => (
                  <a
                    key={i}
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs mb-0.5"
                  >
                    {ex.type} &mdash; {ex.description}
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* Expand affordance */}
        {hasDetails && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 select-none">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {expanded ? "Less" : "Details"}
          </div>
        )}

        {/* Footer: provenance + timestamp */}
        <div
          className="flex items-center justify-between gap-3 mt-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            AI briefing &middot;{" "}
            {edgar_url ? (
              <a
                href={edgar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600/90 hover:text-indigo-700 dark:text-indigo-400/80 dark:hover:text-indigo-300 underline underline-offset-2"
              >
                verify on SEC EDGAR
              </a>
            ) : (
              "sourced from SEC EDGAR"
            )}
          </span>
          <span
            className="text-slate-400/80 dark:text-slate-500/80 text-[11px] whitespace-nowrap tabular-nums"
            title={fullDateTime(event.received_at || event.filing_date)}
          >
            {messageTime(event.received_at || event.filing_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
