"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import type { ThesisAssessment } from "@/types/api";
import type { Significance, Sentiment } from "@/config/constants";
import { messageTime, fullDateTime } from "@/lib/utils";
import { DealTerms } from "@/components/feed/deal-terms";
import { CatalystsTable } from "@/components/feed/catalysts-table";
import { InvestorTakeaway } from "@/components/feed/investor-takeaway";
import { SignificanceExplainer } from "@/components/feed/significance-explainer";
import { PriceReactionStrip } from "@/components/feed/price-reaction-strip";
import { ImpactLabel } from "@/components/positions/thesis-badge";
import { formPhrase, formTag, formTagDuplicatesEventType } from "@/lib/forms";

/**
 * One filing event rendered as an incoming message bubble.
 * Collapsed, it shows only the category label and headline; the briefing
 * details live behind the "Read more" toggle. When the company is held and
 * the thesis engine judged this filing, the verdict leads the message.
 */
export function FilingMessage({
  event,
  assessment = null,
}: {
  event: FilingEvent;
  assessment?: ThesisAssessment | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { briefing, exhibits, edgar_url } = event;

  const copyPermalink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/e/${event.id}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

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
        {/* Meta row: category name + form type (links to the filing on EDGAR) */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {briefing?.primary_event_type &&
            briefing.primary_event_type !== "Other" && (
              <span className="text-slate-700 dark:text-slate-200 text-[11px] font-semibold uppercase tracking-wide">
                {briefing.primary_event_type}
              </span>
            )}
          {edgar_url ? (
            <a
              href={edgar_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="View this filing on SEC EDGAR"
              className="text-slate-400 dark:text-slate-500 text-[10.5px] ml-auto whitespace-nowrap uppercase tracking-wide hover:underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {/* Corner slot is form identity: fall back to the raw form name
                  when the friendly tag would repeat the category label */}
              {formTagDuplicatesEventType(
                event.signal_type,
                briefing?.primary_event_type
              )
                ? event.signal_type
                : formTag(event.signal_type)}
            </a>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[10.5px] ml-auto whitespace-nowrap uppercase tracking-wide">
              {formTagDuplicatesEventType(
                event.signal_type,
                briefing?.primary_event_type
              )
                ? event.signal_type
                : formTag(event.signal_type)}
            </span>
          )}
        </div>

        {/* Thesis verdict, when this filing was judged against a held thesis */}
        {assessment && assessment.impact !== "neutral" && (
          <p className="mb-1 text-[12px] leading-snug">
            <ImpactLabel impact={assessment.impact} />{" "}
            <span className="text-slate-500 dark:text-slate-400">
              your thesis
              {assessment.rationale ? ` — ${assessment.rationale}` : ""}
            </span>
          </p>
        )}

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

        {/* Price reaction since filing */}
        {event.price_reactions && (
          <PriceReactionStrip
            reactions={event.price_reactions}
            className="mt-1.5"
          />
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
            {briefing.mode === "facts_only" && (
              <p className="text-slate-400 dark:text-slate-500 text-[12px] leading-[1.5] mt-1.5">
                Showing verified filing facts only — an AI summary wasn&apos;t
                available for this filing.
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
            <SignificanceExplainer level={significance} items={event.items} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyPermalink();
              }}
              className="mt-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
            >
              {copied ? "Copied!" : "Copy link to this event"}
            </button>
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
            {expanded ? "Show less" : "Read more"}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex justify-end mt-1.5">
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
