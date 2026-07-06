import type { NextConfig } from "next";

// Derive the API origin (and its websocket origin) from the public API URL so
// CSP connect-src allows REST + Socket.IO traffic without hardcoding the host.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sensybull.com/api/v1";
const apiOrigin = (() => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "https://api.sensybull.com";
  }
})();
const wsOrigin = apiOrigin.replace(/^http/, "ws");

// Content-Security-Policy. Google/Apple sign-in load their own SDK scripts and
// render auth iframes; company/profile logos come from logo.dev and Google's
// avatar CDN. 'unsafe-inline' is required for Next's inline bootstrap/JSON-LD
// (a nonce-based policy would need middleware — a reasonable future hardening).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://appleid.cdn-apple.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://img.logo.dev https://*.googleusercontent.com https://*.apple.com",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} ${wsOrigin} https://accounts.google.com https://appleid.apple.com`,
  "frame-src https://accounts.google.com https://appleid.apple.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Everything except /embed/* — the embed button is the one surface
      // that must be frameable by third-party sites, so it opts out of the
      // global frame-ancestors 'none' / X-Frame-Options: DENY and sets its
      // own strict CSP in the route handler (src/app/embed/[symbol]/route.ts).
      { source: "/((?!embed/).*)", headers: securityHeaders },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sensybull.com" }],
        destination: "https://sensybull.com/:path*",
        permanent: true,
      },
      // Old alert deep links and bookmarks from the "Chats" era
      {
        source: "/chats",
        destination: "/watchlist",
        permanent: false,
      },
      // Long-form track link → canonical short form (/add/MU)
      {
        source: "/watchlist/add",
        has: [{ type: "query", key: "symbol", value: "(?<symbol>[a-zA-Z0-9.\\-]{1,10})" }],
        destination: "/add/:symbol",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
