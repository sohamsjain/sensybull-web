import { describe, expect, it } from "vitest";
import {
  dealTermEntries,
  dealTermLabel,
  formatDealTermValue,
  normalizeTermKey,
  titleCaseTerm,
} from "@/lib/deal-terms";

// Mirrors sensybull-api services/api/tests/test_deal_terms.py — the two
// implementations are expected to agree case for case.

describe("titleCaseTerm", () => {
  it("title cases lowercase labels", () => {
    expect(titleCaseTerm("definitive agreement signed")).toBe(
      "Definitive Agreement Signed"
    );
    expect(titleCaseTerm("stock")).toBe("Stock");
    expect(titleCaseTerm("vote pending")).toBe("Vote Pending");
  });

  it("keeps small words lowercase inside the value", () => {
    expect(titleCaseTerm("merger of equals")).toBe("Merger of Equals");
    expect(titleCaseTerm("sale of assets to acme")).toBe(
      "Sale of Assets to Acme"
    );
  });

  it("capitalizes small words at the edges", () => {
    expect(titleCaseTerm("the board")).toBe("The Board");
    expect(titleCaseTerm("shares issued for")).toBe("Shares Issued For");
  });

  it("preserves existing capitalization", () => {
    expect(titleCaseTerm("SPAC merger")).toBe("SPAC Merger");
    expect(titleCaseTerm("Agility Robotics, Inc.")).toBe(
      "Agility Robotics, Inc."
    );
    expect(titleCaseTerm("NASDAQ listing approved")).toBe(
      "NASDAQ Listing Approved"
    );
  });

  it("leaves figures untouched", () => {
    expect(titleCaseTerm("$2,500,000,000")).toBe("$2,500,000,000");
    expect(titleCaseTerm("45%")).toBe("45%");
    expect(titleCaseTerm("expected in Q4 2026")).toBe("Expected in Q4 2026");
    expect(titleCaseTerm("2026-12-31")).toBe("2026-12-31");
  });

  it("cases compound segments independently", () => {
    expect(titleCaseTerm("stock-for-stock")).toBe("Stock-for-Stock");
    expect(titleCaseTerm("all-cash tender offer")).toBe(
      "All-Cash Tender Offer"
    );
    expect(titleCaseTerm("cash/stock")).toBe("Cash/Stock");
  });

  it("sentence cases prose-length values", () => {
    expect(
      titleCaseTerm("definitive agreement signed and announced by the board")
    ).toBe("Definitive agreement signed and announced by the board");
  });

  it("collapses whitespace", () => {
    expect(titleCaseTerm("  vote   pending\n")).toBe("Vote Pending");
    expect(titleCaseTerm("   ")).toBe("");
  });

  it("is idempotent", () => {
    expect(titleCaseTerm("Definitive Agreement Signed")).toBe(
      "Definitive Agreement Signed"
    );
    expect(titleCaseTerm("Stock-for-Stock")).toBe("Stock-for-Stock");
  });

  it("handles leading punctuation", () => {
    expect(titleCaseTerm("(subject to approval)")).toBe(
      "(Subject to Approval)"
    );
  });
});

describe("formatDealTermValue", () => {
  it("title cases and adds thousands separators", () => {
    expect(formatDealTermValue("2500000000")).toBe("2,500,000,000");
    expect(formatDealTermValue("cash")).toBe("Cash");
  });

  it("leaves stringified containers alone", () => {
    expect(formatDealTermValue("{'$sum': '11500000000'}")).toBe(
      "{'$sum': '11500000000'}"
    );
  });
});

describe("normalizeTermKey / dealTermLabel", () => {
  it("canonicalizes keys to snake_case", () => {
    expect(normalizeTermKey("Deal Value")).toBe("deal_value");
    expect(normalizeTermKey("dealValue")).toBe("deal_value");
    expect(normalizeTermKey("  Deal-Status ")).toBe("deal_status");
    expect(normalizeTermKey("   ")).toBe("");
  });

  it("labels keys in title case", () => {
    expect(dealTermLabel("deal_value")).toBe("Deal Value");
    expect(dealTermLabel("consideration_type")).toBe("Consideration Type");
    expect(dealTermLabel("price_per_share")).toBe("Price per Share");
    expect(dealTermLabel("Deal Status")).toBe("Deal Status");
  });
});

describe("dealTermEntries", () => {
  it("orders by canonical priority, then alphabetically", () => {
    const entries = dealTermEntries({
      deal_status: "definitive agreement signed",
      consideration_type: "stock",
      counterparty: "Agility Robotics, Inc.",
      deal_value: "$2,500,000,000",
      deal_type: "SPAC merger",
    });
    expect(entries).toEqual([
      { key: "deal_value", label: "Deal Value", value: "$2,500,000,000" },
      { key: "deal_type", label: "Deal Type", value: "SPAC Merger" },
      {
        key: "consideration_type",
        label: "Consideration Type",
        value: "Stock",
      },
      {
        key: "counterparty",
        label: "Counterparty",
        value: "Agility Robotics, Inc.",
      },
      {
        key: "deal_status",
        label: "Deal Status",
        value: "Definitive Agreement Signed",
      },
    ]);
  });

  it("formats labels and values", () => {
    expect(
      dealTermEntries({ "Consideration Type": "stock" })
    ).toEqual([
      { key: "consideration_type", label: "Consideration Type", value: "Stock" },
    ]);
  });

  it("puts unknown keys last, alphabetically", () => {
    const entries = dealTermEntries({
      termination_fee: "$50M",
      break_fee: "$25M",
      deal_value: "$1B",
    });
    expect(entries.map((e) => e.key)).toEqual([
      "deal_value",
      "break_fee",
      "termination_fee",
    ]);
  });

  it("drops empty entries and duplicate keys", () => {
    const entries = dealTermEntries({
      deal_value: "$1B",
      "Deal Value": "$2B",
      deal_status: "",
      "": "cash",
    });
    expect(entries).toEqual([
      { key: "deal_value", label: "Deal Value", value: "$1B" },
    ]);
  });

  it("handles a missing map", () => {
    expect(dealTermEntries(undefined)).toEqual([]);
    expect(dealTermEntries({})).toEqual([]);
  });
});
