import { describe, expect, it } from "vitest";
import { robotsTxt } from "@/lib/robots";

/** Split robots.txt into groups: user-agents → rules (RFC 9309 §2.1). */
function groups(txt: string) {
  return txt
    .split(/\n\n+/)
    .map((block) => block.split("\n").filter((l) => !l.startsWith("#")))
    .filter((lines) => lines.some((l) => l.startsWith("User-agent:")))
    .map((lines) => ({
      agents: lines
        .filter((l) => l.startsWith("User-agent:"))
        .map((l) => l.slice("User-agent:".length).trim()),
      rules: lines.filter((l) => !l.startsWith("User-agent:")),
    }));
}

describe("robotsTxt", () => {
  const txt = robotsTxt("https://example.com");
  const byAgent = (agent: string) => groups(txt).find((g) => g.agents.includes(agent))!;

  it("points at the sitemap on the site's own origin", () => {
    expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("lets everyone read public pages but not the signed-in app", () => {
    const star = byAgent("*");
    expect(star.rules).toContain("Allow: /");
    expect(star.rules).toContain("Disallow: /watchlist");
    expect(star.rules).not.toContain("Disallow: /company");
    expect(star.rules).not.toContain("Disallow: /e/");
  });

  it("states search=yes, ai-input=yes, ai-train=no", () => {
    expect(byAgent("*").rules).toContain(
      "Content-Signal: search=yes, ai-input=yes, ai-train=no"
    );
  });

  it("welcomes AI search agents with the same private paths", () => {
    // A crawler obeys only its most specific group, so the private paths
    // must be repeated rather than inherited from `*`.
    expect(byAgent("OAI-SearchBot").rules).toEqual(byAgent("*").rules);
    expect(byAgent("Claude-User").rules).toEqual(byAgent("*").rules);
  });

  it("refuses AI training crawlers the whole site", () => {
    for (const bot of ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"]) {
      expect(byAgent(bot).rules).toEqual(["Disallow: /"]);
    }
  });

  it("never names one crawler in two groups", () => {
    const agents = groups(txt).flatMap((g) => g.agents);
    expect(new Set(agents).size).toBe(agents.length);
  });
});
