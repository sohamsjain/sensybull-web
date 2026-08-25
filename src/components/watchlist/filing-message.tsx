"use client";

import { useState } from "react";

import type { FilingEvent } from "@/types/events";
import { messageTime, fullDateTime } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
import { evidenceEntries } from "@/lib/evidence";
import { DealTerms } from "@/components/feed/deal-terms";
import { CatalystsTable } from "@/components/feed/catalysts-table";
import { EvidenceList } from "@/components/feed/evidence";
import { PriceReactionStrip } from "@/components/feed/price-reaction-strip";
import { UpdateActions } from "@/components/feed/update-actions";
import { ImportantMarker, MetaLabel } from "@/components/ui/badge";
import { ChevronDownIcon } from "@/components/ui/icons";
import { filedPhrase, formTag, formTagDuplicatesEventType } from "@/lib/forms";
import { cn } from "@/lib/utils";

/**
 * One filing event in a company's history.
 *
 * A research entry, not a chat bubble: the headline is the row, and the
 * summary, key dates and actions unfold in place. Collapsed it is two lines
 * tall, so a year of filings can be read by scrolling.
 */
export function FilingMessage({ event }: { event: FilingEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { briefing, edgar_url } = event;

  const important = isImportant(event);
  const catalysts =
    event.catalysts?.length > 0 ? event.catalysts : briefing?.catalysts || [];
  const hasDealTerms =
    !!briefing?.deal_terms && Object.keys(briefing.deal_terms).length > 0;
  const evidence = evidenceEntries(briefing);

  const hasDetails = !!(
    briefing?.summary ||
    hasDealTerms ||
    evidence.length > 0 ||
    catalysts.length > 0 ||
    edgar_url
  );

  const toggleExpanded = () => {
    // Selecting text to copy shouldn't toggle the entry open/closed
    if (window.getSelection()?.toString()) return;
    setExpanded((e) => !e);
  };

  return (
    <article
      onClick={toggleExpanded}
      className={cn(
        "group cursor-pointer border-b border-line-subtle px-4 py-3 transition-colors last:border-0",
        // An open entry keeps its own background: the panels inside it are
        // the tinted things, and a hover fill would swallow them.
        !expanded && "hover:bg-surface-hover/60"
      )}
    >
      {/* Meta row: Important marker · category · form type · time */}
      <div className="mb-1 flex items-center gap-2.5">
        {important && <ImportantMarker />}
        {briefing?.primary_event_type &&
          briefing.primary_event_type !== "Other" && (
            <MetaLabel className="text-ink-muted">
              {briefing.primary_event_type}
            </MetaLabel>
          )}
        <MetaLabel className="ml-auto shrink-0">
          {formTagDuplicatesEventType(
            event.signal_type,
            briefing?.primary_event_type
          )
            ? event.signal_type
            : formTag(event.signal_type)}
        </MetaLabel>
        <span
          className="shrink-0 text-micro tabular-nums text-ink-faint"
          title={fullDateTime(event.received_at || event.filing_date)}
        >
          {messageTime(event.received_at || event.filing_date)}
        </span>
      </div>

      {/* Headline */}
      {briefing ? (
        <h3 className="text-body-lg leading-snug text-ink">
          {briefing.headline}
        </h3>
      ) : (
        <h3 className="text-body-lg leading-snug text-ink-muted">
          {event.company_name} {filedPhrase(event.signal_type)}.
        </h3>
      )}

      {/* Details, on demand */}
      {expanded && (
        <>
          {briefing?.summary && (
            <p className="mt-1.5 text-label leading-relaxed text-ink-muted">
              {briefing.summary}
            </p>
          )}
          {briefing?.mode === "facts_only" && (
            <p className="mt-1.5 text-meta leading-relaxed text-ink-faint">
              An AI summary isn&apos;t available for this filing.
            </p>
          )}
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

      {hasDetails && (
        <div className="mt-1.5 flex select-none items-center gap-1 text-micro text-ink-faint transition-colors group-hover:text-ink-muted">
          <ChevronDownIcon
            className={`size-3 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : "Read more"}
        </div>
      )}
    </article>
  );
}
