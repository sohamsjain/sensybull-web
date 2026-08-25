import type { Evidence } from "@/types/events";
import { linkTitle, sourceLabel } from "@/lib/evidence";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * The words in the filing that back the briefing.
 *
 * Everything else in an expanded update is written by a model. This block
 * is not: each quote is text the backend matched against the source
 * document character for character, and clicking it opens that document on
 * SEC EDGAR scrolled to the passage with it highlighted. A reader who wants
 * to check us gets there in one click instead of hunting a 40-page filing.
 *
 * Quotes read as quotes — a rule down the left, the filing's own words in
 * italic — so they can never be mistaken for our summary.
 */
export function EvidenceList({ entries }: { entries: Evidence[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-2.5 rounded-md border border-line bg-canvas-sunken p-3">
      <p className="eyebrow mb-2">From the filing</p>
      <div className="space-y-2.5">
        {entries.map((entry, i) => (
          <EvidenceQuote key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function EvidenceQuote({ entry }: { entry: Evidence }) {
  const linked = !!entry.url;

  const quote = (
    <blockquote
      className={cn(
        "border-l-2 border-line-strong pl-2.5",
        linked && "transition-colors group-hover/quote:border-brand"
      )}
    >
      <p className="text-label leading-relaxed text-ink-muted italic">
        &ldquo;{entry.quote}&rdquo;
      </p>
      <footer
        className={cn(
          "mt-0.5 flex items-center gap-1 text-micro text-ink-faint",
          linked && "transition-colors group-hover/quote:text-brand-ink"
        )}
      >
        {sourceLabel(entry)}
        {linked && <ExternalLinkIcon className="size-3" />}
      </footer>
    </blockquote>
  );

  // An unanchored quote is still evidence — it just has nowhere to go.
  if (!linked) return quote;

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      title={linkTitle(entry)}
      // The row underneath toggles the update open; opening the filing
      // should not also collapse what the reader is reading.
      onClick={(e) => e.stopPropagation()}
      className="group/quote block rounded-sm transition-colors hover:bg-surface-hover"
    >
      {quote}
    </a>
  );
}
