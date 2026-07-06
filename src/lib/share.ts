/**
 * Canonical builders for shareable "Track on Sensybull" links.
 *
 * The short form `/add/MU` is canonical; `/watchlist/add?symbol=MU` redirects
 * to it (see next.config.ts). Everything here is pure so it can run on the
 * server (metadata, OG images) and the client (share dialog, TrackButton).
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sensybull.com";

// Mirrors the API's ticker validation: 1-6 alphanumerics with an optional
// ./- class suffix (BRK.B, BF-B). Validate before building URLs or markup.
const TICKER_RE = /^[A-Z0-9]{1,6}([.-][A-Z0-9]{1,4})?$/;

/** Uppercase + validate a ticker symbol; null if malformed. */
export function normalizeSymbol(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const symbol = decodeURIComponent(raw).trim().toUpperCase();
  return TICKER_RE.test(symbol) ? symbol : null;
}

export interface ShareAttribution {
  ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/** Site-relative add path, e.g. "/add/MU?ref=substack". */
export function addPath(symbol: string, attribution?: ShareAttribution): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(attribution ?? {})) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return `/add/${encodeURIComponent(symbol)}${qs ? `?${qs}` : ""}`;
}

/** Absolute canonical add URL, e.g. "https://sensybull.com/add/MU". */
export function addUrl(symbol: string, attribution?: ShareAttribution): string {
  return `${SITE_URL}${addPath(symbol, attribution)}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function shareLabel(companyName: string): string {
  return `Track ${companyName} on Sensybull`;
}

export function shareHtml(symbol: string, companyName: string): string {
  return `<a href="${addUrl(symbol)}">${escapeHtml(shareLabel(companyName))}</a>`;
}

export function shareMarkdown(symbol: string, companyName: string): string {
  const label = shareLabel(companyName).replace(/([[\]])/g, "\\$1");
  return `[${label}](${addUrl(symbol)})`;
}

/** Iframe snippet for the public embed button. */
export function embedHtml(symbol: string, theme: "light" | "dark" | "auto" = "auto"): string {
  const src = `${SITE_URL}/embed/${encodeURIComponent(symbol)}${theme === "auto" ? "" : `?theme=${theme}`}`;
  return `<iframe src="${src}" width="220" height="44" style="border:0" title="Track ${escapeHtml(symbol)} on Sensybull" loading="lazy"></iframe>`;
}

/** Read attribution params (ref / utm_*) off a URL's search params. */
export function parseAttribution(params: URLSearchParams): ShareAttribution {
  const pick = (key: string) => {
    const value = params.get(key)?.trim().slice(0, 64);
    // Keep attribution tokens boring: word chars, dot and dash only.
    return value && /^[\w.-]+$/.test(value) ? value : undefined;
  };
  const attribution: ShareAttribution = {
    ref: pick("ref"),
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
  };
  return attribution;
}
