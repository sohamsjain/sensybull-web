import { describe, it, expect } from "vitest";
import { buildAiPrompt, buildShareText } from "@/lib/event-actions";
import type { FilingEvent } from "@/types/events";

function ev(overrides: Partial<FilingEvent> = {}): FilingEvent {
  return {
    id: "e1",
    edgar_id: "pr:globenewswire:GNW-1",
    signal_type: "PR",
    source: "globenewswire",
    ticker: "MU",
    company_name: "Micron Technology, Inc.",
    company_id: "c1",
    cik: "0000723125",
    filing_date: "2026-07-15T08:30:00+00:00",
    edgar_url: "https://www.globenewswire.com/news-release/example",
    accession_number: null,
    max_tier: 1,
    items: [],
    exhibits: [],
    briefing: {
      headline: "Micron agrees to acquire ChipWorks for $2.1B",
      summary: "Micron entered a definitive agreement to acquire ChipWorks.",
      primary_event_type: "Acquisition",
      significance: "High",
      sentiment: "Positive",
      investor_takeaway: "",
      catalysts: [],
      deal_terms: {},
      mode: "llm",
    },
    event_types: ["Acquisition"],
    catalysts: [],
    received_at: "2026-07-15T08:31:00+00:00",
    ...overrides,
  };
}

describe("buildAiPrompt for press releases", () => {
  it("frames the prompt around a press release, not an SEC filing", () => {
    const prompt = buildAiPrompt(ev());
    expect(prompt).toContain("company press release");
    expect(prompt).not.toContain("SEC filing and want");
    expect(prompt).toContain("Original press release: https://www.globenewswire.com/news-release/example");
    expect(prompt).not.toContain("SEC EDGAR");
    expect(prompt).toContain("what this announcement means");
  });

  it("includes the related SEC filing link once backfilled", () => {
    const prompt = buildAiPrompt(
      ev({ filing_url: "https://www.sec.gov/Archives/edgar/data/x-index.htm" })
    );
    expect(prompt).toContain(
      "Related SEC filing: https://www.sec.gov/Archives/edgar/data/x-index.htm"
    );
  });

  it("keeps SEC framing for filings", () => {
    const prompt = buildAiPrompt(
      ev({ signal_type: "8-K", source: "edgar", edgar_url: "https://sec.gov/x" })
    );
    expect(prompt).toContain("US SEC filing");
    expect(prompt).toContain("Original filing on SEC EDGAR: https://sec.gov/x");
  });
});

describe("buildShareText", () => {
  it("prefers the briefing headline", () => {
    expect(buildShareText(ev())).toBe(
      "Micron Technology, Inc. (MU): Micron agrees to acquire ChipWorks for $2.1B"
    );
  });

  it("falls back to 'issued a press release' phrasing for PRs", () => {
    expect(buildShareText(ev({ briefing: null }))).toBe(
      "Micron Technology, Inc. (MU) issued a press release"
    );
  });

  it("falls back to 'filed …' phrasing for filings", () => {
    expect(buildShareText(ev({ briefing: null, signal_type: "8-K" }))).toBe(
      "Micron Technology, Inc. (MU) filed an 8-K"
    );
  });
});

describe("buildAiPrompt evidence", () => {
  const withEvidence = () =>
    ev({
      briefing: {
        ...ev().briefing!,
        evidence: [
          {
            quote: "Micron entered into a definitive agreement to acquire ChipWorks",
            event_type: "Acquisition",
            source: "Item 1.01",
            doc_url: "https://www.sec.gov/Archives/edgar/data/723125/a8k.htm",
            url: "https://www.sec.gov/Archives/edgar/data/723125/a8k.htm#:~:text=Micron",
            highlighted: true,
          },
        ],
      },
    });

  it("hands the chatbot the filing's own words, attributed", () => {
    const prompt = buildAiPrompt(withEvidence());
    expect(prompt).toContain(
      '- "Micron entered into a definitive agreement to acquire ChipWorks" (Item 1.01)'
    );
  });

  it("says nothing about quotes when there are none", () => {
    expect(buildAiPrompt(ev())).not.toContain("Quoted from");
  });
});
