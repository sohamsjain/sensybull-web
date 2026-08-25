import type { Briefing, Evidence, FilingEvent } from "@/types/events";

/**
 * Supporting quotes — the passage in the filing that backs the briefing.
 *
 * A briefing is written by a model, so on its own it asks the reader to
 * take our word for it. Evidence removes that ask: each entry is text the
 * backend matched against the source document character for character, and
 * a link that opens the document scrolled to that passage with it
 * highlighted (a `#:~:text=` fragment, built and verified at ingest).
 *
 * Everything is optional on the wire: press releases, facts-only briefings
 * and every event stored before this shipped carry no evidence at all, and
 * an individual quote may be unlinkable. Read through the helpers here so
 * a component never has to think about which of those it has.
 */

/** How many quotes a reader will actually look at before scrolling past. */
const MAX_SHOWN = 3;

/** Well-formed, displayable entries — empty for every legacy payload. */
export function evidenceEntries(
  briefing: Briefing | null | undefined
): Evidence[] {
  const raw = briefing?.evidence;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (entry): entry is Evidence =>
        !!entry && typeof entry.quote === "string" && entry.quote.trim().length > 0
    )
    .slice(0, MAX_SHOWN);
}

/** Whether this update can show its work. */
export function hasEvidence(event: FilingEvent): boolean {
  return evidenceEntries(event.briefing).length > 0;
}

/** Caption for one quote: where in the source document it came from. */
export function sourceLabel(entry: Evidence): string {
  return entry.source?.trim() || "the filing";
}

/**
 * Tooltip for the link. It names what the click does, and stays honest
 * about the case where we could only anchor the document, not the passage.
 */
export function linkTitle(entry: Evidence): string {
  const where = sourceLabel(entry);
  return entry.highlighted
    ? `Open ${where} on SEC EDGAR, highlighted at this passage`
    : `Open ${where} on SEC EDGAR`;
}
