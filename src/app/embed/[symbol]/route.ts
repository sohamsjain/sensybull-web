/**
 * GET /embed/:symbol — a lightweight, iframe-able "Track on Sensybull"
 * button. Served as a self-contained HTML document (no framework runtime)
 * so it weighs almost nothing on host pages.
 *
 * Customization via query params (all validated/clamped, everything HTML-
 * escaped): theme=light|dark|auto, label, radius, width, height, fontSize.
 *
 * next.config.ts exempts /embed/* from the global frame-ancestors/DENY
 * headers and serves it with `frame-ancestors *` instead — this route is
 * the one part of the site meant to be framed. That's safe because the
 * page is a single outbound link: no auth, no cookies, no state-changing
 * actions, so there is nothing to clickjack.
 */

import { normalizeSymbol, SITE_URL } from "@/lib/share";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  const value = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

// Literal colours on purpose: this HTML is served standalone into someone
// else's page, where our design tokens don't exist. Values mirror the
// canvas / line / ink / surface-hover / brand tokens in globals.css.
const PALETTES = {
  light: {
    bg: "#ffffff",
    border: "#dcdee3",
    text: "#2f333c",
    hover: "#f3f4f6",
    accent: "#5546c8",
  },
  dark: {
    bg: "#191c22",
    border: "rgba(255,255,255,0.14)",
    text: "#e9eaee",
    hover: "#1f222a",
    accent: "#a99bf5",
  },
} as const;

type Palette = { bg: string; border: string; text: string; hover: string; accent: string };

function buttonCss(theme: "light" | "dark" | "auto", radius: number, fontSize: number): string {
  const rule = (p: Palette) => `
    a{background:${p.bg};border:1px solid ${p.border};color:${p.text}}
    a:hover{background:${p.hover}}
    .plus{color:${p.accent}}`;
  const base = `
    html,body{margin:0;padding:0;background:transparent}
    a{box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:.45em;
      width:100%;height:100%;border-radius:${radius}px;font-size:${fontSize}px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
      font-weight:600;text-decoration:none;transition:background .15s ease}
    .plus{font-weight:700}`;
  if (theme === "auto") {
    return `${base}${rule(PALETTES.light)}
    @media (prefers-color-scheme:dark){${rule(PALETTES.dark)}}`;
  }
  return `${base}${rule(PALETTES[theme])}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const symbol = normalizeSymbol((await params).symbol);
  if (!symbol) {
    return new Response("Unknown symbol", { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const themeParam = query.get("theme");
  const theme: "light" | "dark" | "auto" =
    themeParam === "light" || themeParam === "dark" ? themeParam : "auto";
  const label = (query.get("label") ?? `Track ${symbol} on Sensybull`).slice(0, 60);
  const radius = clampInt(query.get("radius"), 10, 0, 32);
  const width = clampInt(query.get("width"), 220, 120, 480);
  const height = clampInt(query.get("height"), 44, 28, 96);
  const fontSize = clampInt(query.get("fontSize"), 14, 10, 24);

  const href = `${SITE_URL}/add/${encodeURIComponent(symbol)}?ref=embed`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(label)}</title>
<style>${buttonCss(theme, radius, fontSize)}
body{width:${width}px;height:${height}px}</style>
</head>
<body>
<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
<span class="plus" aria-hidden="true">+</span>${escapeHtml(label)}
</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      // This document is meant to be framed anywhere; it carries no auth.
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors *",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
