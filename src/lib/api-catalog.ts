/**
 * RFC 9727 API catalog for sensybull.com, served at /.well-known/api-catalog.
 *
 * The API lives on its own host, which publishes the same catalog at its
 * own /.well-known/api-catalog (sensybull-api `app/openapi.py`). This copy
 * exists because agents look on the site they were pointed at, and RFC 9727
 * lets a publisher's catalog list APIs on other hosts.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.sensybull.com/api/v1";

export const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "https://api.sensybull.com";
  }
})();

export const OPENAPI_URL = `${API_ORIGIN}/docs/openapi.json`;
export const API_DOCS_URL = `${API_ORIGIN}/docs`;

export function apiCatalog() {
  return {
    linkset: [
      {
        anchor: `${API_ORIGIN}/api/v1`,
        "service-desc": [{ href: OPENAPI_URL, type: "application/json" }],
        "service-doc": [{ href: API_DOCS_URL, type: "text/html" }],
        status: [{ href: `${API_ORIGIN}/health`, type: "application/json" }],
      },
    ],
  };
}

/**
 * RFC 8288 Link header for the homepage: where an agent finds the API.
 * Wired up in next.config.ts.
 */
export function homepageLinkHeader(): string {
  return [
    `</.well-known/api-catalog>; rel="api-catalog"`,
    `<${OPENAPI_URL}>; rel="service-desc"; type="application/json"`,
    `<${API_DOCS_URL}>; rel="service-doc"; type="text/html"`,
  ].join(", ");
}
