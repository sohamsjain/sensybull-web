import { describe, expect, it } from "vitest";

import {
  companyHref,
  companyLinkProps,
  fundamentalsHref,
  NEW_TAB,
} from "@/lib/fundamentals/links";

describe("fundamentalsHref", () => {
  it("points at the company page and escapes the ticker", () => {
    expect(fundamentalsHref("AAPL")).toBe("/company/AAPL");
    expect(fundamentalsHref("BRK.B")).toBe("/company/BRK.B");
    expect(fundamentalsHref("A B")).toBe("/company/A%20B");
  });
});

describe("companyHref", () => {
  it("routes a result with financials to its company page", () => {
    expect(companyHref({ id: "1", name: "Apple", ticker: "AAPL" })).toBe(
      "/company/AAPL"
    );
    expect(
      companyHref({ id: "1", name: "Apple", ticker: "AAPL", has_fundamentals: true })
    ).toBe("/company/AAPL");
  });

  it("falls back to the watchlist when there are no financials", () => {
    expect(
      companyHref({ id: "1", name: "Apple", ticker: "AAPL", has_fundamentals: false })
    ).toBe("/watchlist?c=1");
    expect(companyHref({ id: "2", name: "No Ticker", ticker: "" })).toBe(
      "/watchlist?c=2"
    );
  });
});

describe("companyLinkProps", () => {
  it("opens financials in a new tab", () => {
    expect(companyLinkProps({ id: "1", name: "Apple", ticker: "AAPL" })).toEqual({
      href: "/company/AAPL",
      ...NEW_TAB,
    });
  });

  it("keeps the watchlist fallback in this tab", () => {
    expect(
      companyLinkProps({ id: "1", name: "Apple", ticker: "AAPL", has_fundamentals: false })
    ).toEqual({ href: "/watchlist?c=1" });
  });
});
