"use client";

import type { EventMarker } from "@/lib/chart-signals";
import { isImportant } from "@/lib/event-actions";
import { filedPhrase, formTag, formTagDuplicatesEventType } from "@/lib/forms";
import { formatChangePct } from "@/lib/quote";
import { cn } from "@/lib/utils";
import { displayCompanyName } from "@/lib/company-name";
import { ImportantMarker, MetaLabel } from "@/components/ui/badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CloseIcon,
  ExternalLinkIcon,
} from "@/components/ui/icons";

const WIDTH = 288;
const MARGIN = 8;

/** Keeps the card on screen whichever candle the cursor found. */
function place(
  point: { x: number; y: number },
  size: { width: number; height: number }
) {
  const left = Math.min(
    Math.max(point.x - WIDTH / 2, MARGIN),
    Math.max(size.width - WIDTH - MARGIN, MARGIN)
  );
  // Flip to the other side of the cursor rather than cover the candle
  const below = point.y < size.height / 2;
  return {
    left,
    top: below ? point.y + 18 : undefined,
    bottom: below ? undefined : size.height - point.y + 18,
  };
}

/**
 * What happened on a marked session.
 *
 * An arrow on its own says a filing landed; it doesn't say why the stock
 * moved. Hovering reads the headline behind the move, and clicking pins the
 * card so the filing itself is one link away.
 */
export function ChartMarkerTooltip({
  marker,
  point,
  size,
  pinned,
  onClose,
}: {
  marker: EventMarker;
  point: { x: number; y: number };
  size: { width: number; height: number };
  pinned: boolean;
  onClose: () => void;
}) {
  const position = place(point, size);
  const up = marker.direction === "up";
  const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
  const [lead, ...rest] = marker.events;
  const date = new Date(marker.barTime * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const tag = formTag(lead.signal_type);
  const category = lead.briefing?.primary_event_type;

  return (
    <div
      style={{ ...position, width: WIDTH }}
      className={cn(
        "absolute z-20 rounded-lg border border-line bg-popover p-2.5 shadow-popover",
        pinned ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* What the market did */}
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-meta font-semibold tabular-nums",
            up ? "text-success" : "text-danger"
          )}
        >
          <Arrow className="size-3" />
          {formatChangePct(marker.movePct)}
        </span>
        <span className="text-micro text-ink-faint">{date}</span>
        {marker.atrRatio > 0 && (
          <span className="ml-auto text-micro text-ink-dim tabular-nums">
            {marker.atrRatio.toFixed(1)}× weekly range
          </span>
        )}
        {pinned && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-my-1 -mr-1 rounded-sm p-1 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <CloseIcon className="size-3" />
          </button>
        )}
      </div>

      {/* Why */}
      <div className="mb-1 flex items-center gap-2">
        {isImportant(lead) && <ImportantMarker />}
        {category && <MetaLabel>{category}</MetaLabel>}
        {tag && !formTagDuplicatesEventType(lead.signal_type, category) && (
          <MetaLabel className="text-ink-dim">{tag}</MetaLabel>
        )}
      </div>
      <p className="text-label leading-snug font-medium text-ink">
        {lead.briefing?.headline ??
          `${displayCompanyName(lead.company_name)} ${filedPhrase(lead.signal_type)} a filing`}
      </p>

      {rest.length > 0 && (
        <p className="mt-1.5 text-micro text-ink-faint">
          + {rest.length} more {rest.length === 1 ? "update" : "updates"} that
          session
        </p>
      )}

      {pinned && lead.edgar_url && (
        <a
          href={lead.edgar_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-meta font-medium text-brand-ink hover:underline"
        >
          Read the filing
          <ExternalLinkIcon className="size-3" />
        </a>
      )}
      {!pinned && (
        <p className="mt-1.5 text-micro text-ink-dim">Click to keep this open</p>
      )}
    </div>
  );
}
