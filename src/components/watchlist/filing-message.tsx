"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import { messageTime, fullDateTime } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
import { DealTerms } from "@/components/feed/deal-terms";
import { CatalystsTable } from "@/components/feed/catalysts-table";
import { PriceReactionStrip } from "@/components/feed/price-reaction-strip";
import { UpdateActions } from "@/components/feed/update-actions";
import { formPhrase, formTag, formTagDuplicatesEventType } from "@/lib/forms";

/**
 * One filing event rendered as an incoming message bubble.
 * Collapsed, it shows only the category label and headline; the summary,
 * key dates, and action buttons live behind the "Read more" toggle.
 */
export function FilingMessage({ event }: { event: FilingEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { briefing, edgar_url } = event;

  const important = isImportant(event);
  const catalysts =
    event.catalysts?.length > 0 ? event.catalysts : briefing?.catalysts || [];
  const hasDealTerms =
    !!briefing?.deal_terms && Object.keys(briefing.deal_terms).length > 0;

  const hasDetails = !!(
    briefing?.summary ||
    hasDealTerms ||
    catalysts.length > 0 ||
    edgar_url
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
        {/* Meta row: Important marker + category + form type */}
        <div className="flex items-center gap-2 mb-1.5">
          {important && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
              Important
            </span>
          )}
          {briefing?.primary_event_type &&
            briefing.primary_event_type !== "Other" && (
              <span className="text-slate-700 dark:text-slate-200 text-[11px] font-semibold uppercase tracking-wide">
                {briefing.primary_event_type}
              </span>
            )}
          <span className="text-slate-400 dark:text-slate-500 text-[10.5px] ml-auto whitespace-nowrap uppercase tracking-wide">
            {formTagDuplicatesEventType(
              event.signal_type,
              briefing?.primary_event_type
            )
              ? event.signal_type
              : formTag(event.signal_type)}
          </span>
        </div>

        {/* Headline */}
        {briefing ? (
          <p className="text-slate-900 dark:text-slate-100/90 text-[14px] font-normal leading-snug">
            {briefing.headline}
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {event.company_name} filed {formPhrase(event.signal_type)}.
          </p>
        )}

        {/* Details, on demand */}
        {expanded && (
          <>
            {briefing?.summary && (
              <p className="text-slate-600/90 dark:text-slate-300/90 text-[13px] leading-[1.5] mt-1.5">
                {briefing.summary}
              </p>
            )}
            {briefing?.mode === "facts_only" && (
              <p className="text-slate-400 dark:text-slate-500 text-[12px] leading-[1.5] mt-1.5">
                An AI summary isn&apos;t available for this filing.
              </p>
            )}
            {hasDealTerms && <DealTerms terms={briefing!.deal_terms} />}
            {catalysts.length > 0 && <CatalystsTable catalysts={catalysts} />}
            {event.price_reactions && (
              <PriceReactionStrip
                reactions={event.price_reactions}
                className="mt-2"
              />
            )}
            <UpdateActions event={event} />
          </>
        )}

        {/* Footer row: expand affordance + timestamp */}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          {hasDetails ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 select-none">
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
          ) : (
            <span />
          )}
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
