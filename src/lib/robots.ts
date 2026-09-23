import { SITE_URL } from "@/lib/share";

/**
 * The body of /robots.txt (RFC 9309, served by src/app/robots.txt/route.ts),
 * written by hand rather than with Next's `robots.ts` because the typed
 * version can't carry Content-Signal lines.
 *
 * Policy (Sept 2026): be found and be cited, don't be trained on.
 *  - Search engines and AI search/answer agents may read every public page.
 *  - AI training crawlers are refused the whole site.
 *  - Content-Signal (contentsignals.org) states the same preference for
 *    crawlers that read it: search=yes, ai-input=yes, ai-train=no.
 *
 * A crawler obeys only the most specific group naming it, so each group
 * repeats the private paths rather than relying on `User-agent: *`.
 */

// Signed-in surfaces, auth flows, and the share/embed plumbing — nothing a
// search result should land on. /add/* pages are also noindex.
const PRIVATE_PATHS = [
  "/watchlist",
  "/alerts",
  "/chats",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/magic-link",
  "/verify-email",
  "/add/",
  "/embed/",
];

// AI agents that search or fetch on a person's behalf: welcome.
const AI_SEARCH_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

// Crawlers that collect training data: refused.
const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Meta-ExternalAgent",
  "Bytespider",
];

const CONTENT_SIGNAL = "Content-Signal: search=yes, ai-input=yes, ai-train=no";

function group(agents: string[], rules: string[]): string {
  return [...agents.map((a) => `User-agent: ${a}`), ...rules].join("\n");
}

const publicRules = [
  CONTENT_SIGNAL,
  "Allow: /",
  ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`),
];

export function robotsTxt(siteUrl: string = SITE_URL): string {
  return (
    [
      "# Sensybull — real-time SEC filing briefings\n" +
        "# Search and AI answer engines: welcome. AI training: no.",
      group(["*"], publicRules),
      group(AI_SEARCH_AGENTS, publicRules),
      group(AI_TRAINING_CRAWLERS, ["Disallow: /"]),
      `Sitemap: ${siteUrl}/sitemap.xml`,
    ].join("\n\n") + "\n"
  );
}
