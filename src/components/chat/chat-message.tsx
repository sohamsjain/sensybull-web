"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import type { Significance, Sentiment } from "@/config/constants";
import { messageTime } from "@/lib/utils";
import { SignificanceBadge } from "@/components/feed/significance-badge";
import { SentimentDot } from "@/components/feed/sentiment-dot";
import { DealTerms } from "@/components/feed/deal-terms";
import { CatalystsTable } from "@/components/feed/catalysts-table";
import { EventTypeTag } from "@/components/feed/event-type-tag";

/** One filing event rendered as an incoming chat message. */
export function ChatMessage({ event }: { event: FilingEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { briefing, items, exhibits, edgar_url } = event;

  const significance = (briefing?.significance as Significance) || "Medium";
  const sentiment = (briefing?.sentiment as Sentiment) || "Neutral";
  const catalysts =
    event.catalysts?.length > 0 ? event.catalysts : briefing?.catalysts || [];

  const toggleExpanded = () => {
    // Selecting text to copy shouldn't toggle the message open/closed
    if (window.getSelection()?.toString()) return;
    setExpanded((e) => !e);
  };

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[92%] md:max-w-[70%] bg-slate-100 dark:bg-slate-800 rounded-lg rounded-tl-none px-3 py-2 shadow-md shadow-slate-300/30 dark:shadow-black/20 cursor-pointer transition-colors hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
        onClick={toggleExpanded}
      >
        {/* Meta row */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <SignificanceBadge level={significance} />
          {briefing?.primary_event_type &&
            briefing.primary_event_type !== "Other" && (
              <EventTypeTag type={briefing.primary_event_type} primary />
            )}
          <SentimentDot sentiment={sentiment} />
          <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-auto whitespace-nowrap uppercase tracking-wide">
            {event.signal_type}
          </span>
        </div>

        {/* Briefing body */}
        {briefing ? (
          <>
            <p className="text-slate-900 dark:text-slate-50 text-[14px] font-semibold leading-snug">
              {briefing.headline}
            </p>
            {briefing.investor_takeaway && (
              <p className="text-emerald-200/80 text-[13px] leading-snug mt-1">
                {briefing.investor_takeaway}
              </p>
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
          </>
        ) : (
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {event.company_name} filed an {event.signal_type}.
          </p>
        )}

        {/* Expanded: exhibits */}
        {expanded && exhibits?.length > 0 && (
          <div
            className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wide mb-1">
              Exhibits
            </p>
            {exhibits.map((ex, i) => (
              <a
                key={i}
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 text-xs mb-0.5"
              >
                {ex.type} &mdash; {ex.description}
              </a>
            ))}
          </div>
        )}

        {/* Footer: provenance + timestamp */}
        <div
          className="flex items-center justify-between gap-3 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-slate-400 dark:text-slate-500 text-[10.5px]">
            AI briefing &middot;{" "}
            {edgar_url ? (
              <a
                href={edgar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400/80 hover:text-blue-300 underline underline-offset-2"
              >
                verify on SEC EDGAR
              </a>
            ) : (
              "sourced from SEC EDGAR"
            )}
          </span>
          <span className="text-slate-400/80 dark:text-slate-500/80 text-[10.5px] whitespace-nowrap tabular-nums">
            {messageTime(event.received_at || event.filing_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
