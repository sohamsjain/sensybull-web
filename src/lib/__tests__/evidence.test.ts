import { describe, it, expect } from "vitest";
import {
  evidenceEntries,
  hasEvidence,
  linkTitle,
  sourceLabel,
} from "@/lib/evidence";
import type { Briefing, Evidence, FilingEvent } from "@/types/events";

const DOC =
  "https://www.sec.gov/Archives/edgar/data/320193/000032019326000010/a8k.htm";

function entry(overrides: Partial<Evidence> = {}): Evidence {
  return {
    quote: "the Company entered into a definitive merger agreement",
    event_type: "Acquisition",
    source: "Item 1.01",
    doc_url: DOC,
    url: `${DOC}#:~:text=the%20Company%20entered`,
    highlighted: true,
    ...overrides,
  };
}

function briefing(evidence?: unknown): Briefing {
  return {
    headline: "Acme agrees to a merger",
    summary: "Acme entered a definitive agreement.",
    primary_event_type: "Acquisition",
    significance: "High",
    sentiment: "Positive",
    investor_takeaway: "",
    catalysts: [],
    deal_terms: {},
    mode: "llm",
    ...(evidence === undefined ? {} : { evidence: evidence as Evidence[] }),
  };
}

describe("evidenceEntries", () => {
  it("returns well-formed entries", () => {
    expect(evidenceEntries(briefing([entry()]))).toEqual([entry()]);
  });

  it("is empty for a briefing stored before evidence shipped", () => {
    expect(evidenceEntries(briefing())).toEqual([]);
  });

  it("is empty for a missing briefing", () => {
    expect(evidenceEntries(null)).toEqual([]);
    expect(evidenceEntries(undefined)).toEqual([]);
  });

  it("survives a payload where evidence is not a list", () => {
    expect(evidenceEntries(briefing("nope"))).toEqual([]);
    expect(evidenceEntries(briefing({ quote: "x" }))).toEqual([]);
  });

  it("drops entries with no quote to show", () => {
    const entries = evidenceEntries(
      briefing([null, { source: "Item 1.01" }, entry({ quote: "  " }), entry()])
    );
    expect(entries).toHaveLength(1);
  });

  it("shows at most three quotes", () => {
    expect(evidenceEntries(briefing(Array(6).fill(entry())))).toHaveLength(3);
  });

  it("keeps an unlinkable quote — the words are the evidence", () => {
    const entries = evidenceEntries(
      briefing([entry({ url: "", highlighted: false })])
    );
    expect(entries).toHaveLength(1);
  });
});

describe("hasEvidence", () => {
  const event = (b: Briefing) => ({ briefing: b }) as FilingEvent;

  it("is true only when there is something to show", () => {
    expect(hasEvidence(event(briefing([entry()])))).toBe(true);
    expect(hasEvidence(event(briefing()))).toBe(false);
  });
});

describe("captions", () => {
  it("names the item a quote came from", () => {
    expect(sourceLabel(entry())).toBe("Item 1.01");
    expect(sourceLabel(entry({ source: "EX-99.1" }))).toBe("EX-99.1");
  });

  it("falls back to a generic caption", () => {
    expect(sourceLabel(entry({ source: "" }))).toBe("the filing");
  });

  it("only promises a highlight when the link delivers one", () => {
    expect(linkTitle(entry())).toContain("highlighted");
    expect(linkTitle(entry({ highlighted: false }))).not.toContain("highlighted");
  });
});
