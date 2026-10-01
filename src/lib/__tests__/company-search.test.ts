import { describe, it, expect } from "vitest";
import {
  lookupLocal,
  narrowResults,
  rankResults,
  searchDelay,
  BURST_GAP_MS,
  TRAILING_MS,
  SEARCH_LIMIT,
} from "../company-search";
import type { CompanySearchResult } from "@/types/api";

const co = (ticker: string, name: string, market_cap: number | null = null): CompanySearchResult => ({
  id: ticker,
  ticker,
  name,
  market_cap,
});

describe("rankResults (mirrors the API's _search_query order)", () => {
  it("puts exact ticker, then ticker prefix, then name matches", () => {
    const rows = [co("BAPP", "Bapp Corp", 9e12), co("APPS", "Digital Turbine", 1e9), co("APP", "AppLovin", 1e11)];
    expect(rankResults(rows, "app").map((r) => r.ticker)).toEqual(["APP", "APPS", "BAPP"]);
  });

  it("breaks ties by market cap, nulls last, then name", () => {
    const rows = [co("XA", "Zeta"), co("XB", "Beta", 5), co("XC", "Alpha"), co("XD", "Delta", 50)];
    expect(rankResults(rows, "x").map((r) => r.ticker)).toEqual(["XD", "XB", "XC", "XA"]);
  });
});

describe("lookupLocal", () => {
  it("returns a cached answer as exact", () => {
    const known = new Map([["app", [co("APP", "AppLovin")]]]);
    expect(lookupLocal("APP ", known)).toEqual({ results: [co("APP", "AppLovin")], exact: true });
  });

  it("narrows a complete prefix answer into an exact one", () => {
    const known = new Map([["ap", [co("AAPL", "Apple Inc.", 3e12), co("APD", "Air Products", 6e10)]]]);
    const got = lookupLocal("appl", known);
    expect(got?.exact).toBe(true);
    expect(got?.results.map((r) => r.ticker)).toEqual(["AAPL"]);
  });

  it("marks a narrowed truncated answer provisional", () => {
    const full = Array.from({ length: SEARCH_LIMIT }, (_, i) => co(`A${i}`, `Apple ${i}`));
    const got = lookupLocal("apple", new Map([["a", full]]));
    expect(got?.exact).toBe(false);
    expect(got?.results).toHaveLength(SEARCH_LIMIT);
  });

  it("uses the longest cached prefix", () => {
    const known = new Map([
      ["a", Array.from({ length: SEARCH_LIMIT }, (_, i) => co(`A${i}`, `A ${i}`))],
      ["mi", [co("MU", "Micron Technology", 1e11), co("MSFT", "Microsoft", 3e12)]],
    ]);
    expect(lookupLocal("micr", known)?.results.map((r) => r.ticker)).toEqual(["MSFT", "MU"]);
  });

  it("knows nothing about an unrelated query or a wildcard", () => {
    const known = new Map([["ap", [co("AAPL", "Apple")]]]);
    expect(lookupLocal("ms", known)).toBeNull();
    expect(lookupLocal("ap%", known)).toBeNull();
    expect(lookupLocal("  ", known)).toBeNull();
  });
});

describe("searchDelay", () => {
  it("searches at once on the first key after a pause", () => {
    expect(searchDelay(BURST_GAP_MS)).toBe(0);
    expect(searchDelay(5000)).toBe(0);
  });

  it("waits for a pause inside a burst", () => {
    expect(searchDelay(60)).toBe(TRAILING_MS);
  });
});

describe("narrowResults", () => {
  it("keeps only rows matching the query, ranked for it", () => {
    const rows = [co("AAPL", "Apple Inc.", 3e12), co("MU", "Micron Technology", 1e11), co("MSFT", "Microsoft", 3e12)];
    expect(narrowResults(rows, "m").map((r) => r.ticker)).toEqual(["MSFT", "MU"]);
    expect(narrowResults(rows, "zzz")).toEqual([]);
  });
});
