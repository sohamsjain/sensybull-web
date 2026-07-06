import { describe, expect, it } from "vitest";
import {
  addPath,
  addUrl,
  embedHtml,
  normalizeSymbol,
  parseAttribution,
  shareHtml,
  shareMarkdown,
  SITE_URL,
} from "@/lib/share";

describe("normalizeSymbol", () => {
  it("uppercases and trims valid tickers", () => {
    expect(normalizeSymbol("mu")).toBe("MU");
    expect(normalizeSymbol(" nvda ")).toBe("NVDA");
    expect(normalizeSymbol("brk.b")).toBe("BRK.B");
    expect(normalizeSymbol("BF-B")).toBe("BF-B");
  });

  it("decodes URL-encoded input", () => {
    expect(normalizeSymbol("BRK%2EB")).toBe("BRK.B");
  });

  it("rejects malformed symbols", () => {
    expect(normalizeSymbol("")).toBeNull();
    expect(normalizeSymbol(null)).toBeNull();
    expect(normalizeSymbol(undefined)).toBeNull();
    expect(normalizeSymbol("TOOLONGSYMBOL")).toBeNull();
    expect(normalizeSymbol("<script>")).toBeNull();
    expect(normalizeSymbol("A B")).toBeNull();
    expect(normalizeSymbol("../etc")).toBeNull();
  });
});

describe("share link builders", () => {
  it("builds the canonical add URL", () => {
    expect(addUrl("MU")).toBe(`${SITE_URL}/add/MU`);
  });

  it("carries attribution params", () => {
    expect(addPath("MU", { ref: "substack" })).toBe("/add/MU?ref=substack");
    expect(addPath("MU", { utm_source: "newsletter", ref: "x" })).toContain(
      "utm_source=newsletter"
    );
  });

  it("escapes company names in HTML snippets", () => {
    const html = shareHtml("BAD", 'Ba<d> & "Co"');
    expect(html).not.toContain("<d>");
    expect(html).toContain("Ba&lt;d&gt; &amp; &quot;Co&quot;");
  });

  it("escapes brackets in Markdown labels", () => {
    expect(shareMarkdown("X", "A[cme] Corp")).toContain("A\\[cme\\] Corp");
  });

  it("builds an iframe embed snippet", () => {
    const html = embedHtml("MU", "dark");
    expect(html).toContain(`${SITE_URL}/embed/MU?theme=dark`);
    expect(html).toContain("<iframe");
  });
});

describe("parseAttribution", () => {
  it("picks known params only", () => {
    const attribution = parseAttribution(
      new URLSearchParams("ref=reddit&utm_source=post&other=1")
    );
    expect(attribution.ref).toBe("reddit");
    expect(attribution.utm_source).toBe("post");
    expect("other" in attribution).toBe(false);
  });

  it("drops values with unexpected characters", () => {
    const attribution = parseAttribution(
      new URLSearchParams("ref=<script>&utm_campaign=spring-2026")
    );
    expect(attribution.ref).toBeUndefined();
    expect(attribution.utm_campaign).toBe("spring-2026");
  });

  it("bounds value length", () => {
    const attribution = parseAttribution(
      new URLSearchParams(`ref=${"x".repeat(200)}`)
    );
    expect(attribution.ref).toHaveLength(64);
  });
});
