/**
 * Display helpers for SEC form types (`FilingEvent.signal_type`).
 * The backend now ingests event-driven forms beyond 8-K — 13D stakes,
 * tenders, merger/contested proxies, delistings, late filings, Form 4
 * insider buys.
 */

/** Sentence fragment: "AcmeCo filed {formPhrase(t)}" */
const FORM_PHRASES: Record<string, string> = {
  "8-K": "an 8-K",
  "8-K/A": "an 8-K amendment",
  "4": "a Form 4 insider transaction",
  "SC 13D": "a 13D stake disclosure",
  "SC 13D/A": "a 13D amendment",
  "SC 13G": "a 13G passive stake",
  "SC TO-T": "a tender offer",
  "SC TO-I": "a self-tender offer",
  "SC 14D9": "a tender-offer response",
  "SC 13E3": "a going-private filing",
  "S-4": "a merger registration",
  "PREM14A": "a preliminary merger proxy",
  "DEFM14A": "a merger proxy",
  "PREC14A": "a contested proxy",
  "DEFC14A": "a contested proxy",
  "DFAN14A": "proxy-fight materials",
  "25": "a delisting notice",
  "25-NSE": "a delisting notice",
  "15-12B": "a deregistration notice",
  "15-12G": "a deregistration notice",
  "15F-12B": "a deregistration notice",
  "NT 10-K": "a late-filing notice",
  "NT 10-Q": "a late-filing notice",
  CB: "a foreign tender notification",
};

export function formPhrase(signalType: string): string {
  return FORM_PHRASES[signalType] ?? `a ${signalType}`;
}

/** Short badge tag: "13D", "Tender", "Form 4"… */
const FORM_TAGS: Record<string, string> = {
  "4": "Form 4",
  "SC 13D": "13D",
  "SC 13D/A": "13D/A",
  "SC 13G": "13G",
  "SC TO-T": "Tender",
  "SC TO-I": "Self-Tender",
  "SC 14D9": "14D-9",
  "SC 13E3": "13E-3",
  "S-4": "S-4",
  "PREM14A": "Merger Proxy",
  "DEFM14A": "Merger Proxy",
  "PREC14A": "Proxy Fight",
  "DEFC14A": "Proxy Fight",
  "DFAN14A": "Proxy Fight",
  "25": "Delisting",
  "25-NSE": "Delisting",
  "15-12B": "Going Dark",
  "15-12G": "Going Dark",
  "15F-12B": "Going Dark",
  "NT 10-K": "Late 10-K",
  "NT 10-Q": "Late 10-Q",
  CB: "Foreign Tender",
};

export function formTag(signalType: string): string {
  return FORM_TAGS[signalType] ?? signalType;
}

/**
 * True when the form's display tag would just repeat the LLM event-type tag
 * (e.g. Form 15 → "Going Dark" badge next to a "Going Dark" event type).
 * Callers suppress the form badge or fall back to the raw form name.
 */
export function formTagDuplicatesEventType(
  signalType: string,
  primaryEventType: string | null | undefined
): boolean {
  if (!primaryEventType) return false;
  return formTag(signalType).toLowerCase() === primaryEventType.toLowerCase();
}
