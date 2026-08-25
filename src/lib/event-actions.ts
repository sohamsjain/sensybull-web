import type { FilingEvent } from "@/types/events";
import { SITE_URL } from "@/lib/share";
import { dealTermEntries } from "@/lib/deal-terms";
import { evidenceEntries } from "@/lib/evidence";
import { fullDateTime } from "@/lib/utils";
import { filedPhrase } from "@/lib/forms";

/**
 * Binary importance: is this the kind of event that typically moves the
 * stock? The API sends `important`; older cached payloads only carry the
 * legacy briefing significance grade, so fall back to that.
 */
export function isImportant(event: FilingEvent): boolean {
  if (typeof event.important === "boolean") return event.important;
  const sig = event.briefing?.significance;
  if (sig) return sig === "High";
  return event.max_tier === 1;
}

/** Public permalink for one filing event. */
export function eventUrl(event: FilingEvent): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : SITE_URL;
  return `${origin}/e/${event.id}`;
}

/**
 * Self-contained prompt for pasting into ChatGPT / Gemini / Claude — the
 * "ask an AI about this update" copy button. Carries everything the chatbot
 * needs: who published, what, when, the briefing text, key dates, and the
 * link to the primary source so the bot (or the user) can verify.
 */
export function buildAiPrompt(event: FilingEvent): string {
  const { briefing } = event;
  const isPr = event.signal_type === "PR";
  const company = event.ticker
    ? `${event.company_name} (${event.ticker})`
    : event.company_name;
  const filedAt = fullDateTime(event.received_at || event.filing_date);

  const lines: string[] = isPr
    ? [
        `I'm researching a company press release and want your help understanding it.`,
        ``,
        `Company: ${company}`,
        `Announcement: press release${filedAt ? `, published ${filedAt}` : ""}`,
      ]
    : [
        `I'm researching a US SEC filing and want your help understanding it.`,
        ``,
        `Company: ${company}`,
        `Filing: ${event.signal_type}${filedAt ? `, filed ${filedAt}` : ""}`,
      ];
  if (briefing?.headline) lines.push(`What happened: ${briefing.headline}`);
  if (briefing?.summary) lines.push(``, `Summary: ${briefing.summary}`);

  const dealTerms = dealTermEntries(briefing?.deal_terms);
  if (dealTerms.length > 0) {
    lines.push(``, `Deal terms:`);
    for (const { label, value } of dealTerms) lines.push(`- ${label}: ${value}`);
  }

  const catalysts = (
    event.catalysts?.length ? event.catalysts : briefing?.catalysts ?? []
  ).filter((c) => c.event);
  if (catalysts.length > 0) {
    lines.push(
      ``,
      isPr
        ? `Key dates mentioned in the press release:`
        : `Key dates mentioned in the filing:`
    );
    for (const c of catalysts) {
      lines.push(`- ${c.date ?? "Date TBD"}: ${c.event}`);
    }
  }

  // Verbatim source text, so the chatbot reasons from the filing's own
  // words rather than only from our summary of them.
  const evidence = evidenceEntries(briefing);
  if (evidence.length > 0) {
    lines.push(
      ``,
      isPr
        ? `Quoted from the press release:`
        : `Quoted from the filing:`
    );
    for (const entry of evidence) {
      lines.push(`- "${entry.quote}" (${entry.source || "the filing"})`);
    }
  }

  if (event.edgar_url) {
    lines.push(
      ``,
      isPr
        ? `Original press release: ${event.edgar_url}`
        : `Original filing on SEC EDGAR: ${event.edgar_url}`
    );
  }
  if (isPr && event.filing_url) {
    lines.push(`Related SEC filing: ${event.filing_url}`);
  }

  lines.push(
    ``,
    `Please explain in plain English what this ${isPr ? "announcement" : "filing"}` +
      ` means for the company and for shareholders, and point out anything` +
      ` I should watch next. I'll ask follow-up questions.`
  );
  return lines.join("\n");
}

/** Short human-readable text used when sharing an update. */
export function buildShareText(event: FilingEvent): string {
  const company = event.ticker
    ? `${event.company_name} (${event.ticker})`
    : event.company_name;
  const headline = event.briefing?.headline;
  return headline
    ? `${company}: ${headline}`
    : `${company} ${filedPhrase(event.signal_type)}`;
}

/**
 * Share an update: native share sheet where available (phones/tablets),
 * otherwise copy the permalink. Resolves to "shared" | "copied" | null
 * (null = user cancelled or clipboard unavailable).
 */
export async function shareEvent(
  event: FilingEvent
): Promise<"shared" | "copied" | null> {
  const url = eventUrl(event);
  const text = buildShareText(event);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Sensybull", text, url });
      return "shared";
    } catch {
      return null; // user closed the share sheet
    }
  }
  return copyText(`${text}\n${url}`);
}

/** Clipboard write with a graceful failure result. */
export async function copyText(text: string): Promise<"copied" | null> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return null;
  }
}
