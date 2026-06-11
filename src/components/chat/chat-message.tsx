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

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[88%] md:max-w-[75%] bg-slate-800 border border-slate-700 rounded-lg rounded-tl-sm px-3.5 py-3 cursor-pointer transition-colors hover:bg-slate-800/80"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-1.5">
          <SignificanceBadge level={significance} />
          {briefing?.primary_event_type &&
            briefing.primary_event_type !== "Other" && (
              <EventTypeTag type={briefing.primary_event_type} primary />
            )}
          <SentimentDot sentiment={sentiment} />
          <span className="text-slate-500 text-[11px] ml-auto whitespace-nowrap">
            {event.signal_type}
          </span>
        </div>

        {/* Briefing body */}
        {briefing ? (
          <>
            <p className="text-slate-100 text-sm font-medium leading-snug">
              {briefing.headline}
            </p>
            {briefing.investor_takeaway && (
              <p className="text-slate-300 text-sm italic mt-1.5">
                {briefing.investor_takeaway}
              </p>
            )}
            {briefing.summary && (
              <p className="text-slate-400 text-sm leading-relaxed mt-1.5">
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
          <p className="text-slate-300 text-sm">
            {event.company_name} filed an {event.signal_type}.
          </p>
        )}

        {/* Expanded: raw filing items + exhibits */}
        {expanded && (
          <div
            className="mt-3 pt-3 border-t border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {items?.map((item, i) => (
              <div key={i} className="mb-3">
                <p className="text-slate-300 text-sm font-medium mb-1">
                  Item {item.number}: {item.title}
                </p>
                {item.text && (
                  <p className="text-slate-400 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                    {item.text.slice(0, 2000)}
                  </p>
                )}
              </div>
            ))}
            {exhibits?.length > 0 && (
              <div className="mt-2">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
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
          </div>
        )}

        {/* Footer: provenance + timestamp */}
        <div
          className="flex items-center justify-between gap-3 mt-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-slate-500 text-[11px]">
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
          <span className="text-slate-500 text-[11px] whitespace-nowrap">
            {messageTime(event.received_at || event.filing_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
