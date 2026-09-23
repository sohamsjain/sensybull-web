import { apiCatalog } from "@/lib/api-catalog";

export const dynamic = "force-static";

const HEADERS = {
  "Content-Type": "application/linkset+json",
  "Access-Control-Allow-Origin": "*",
  Link: `</.well-known/api-catalog>; rel="api-catalog"`,
};

export function GET() {
  return new Response(JSON.stringify(apiCatalog()), { headers: HEADERS });
}

// RFC 9727 §2: the well-known URI answers HEAD with the same headers.
export function HEAD() {
  return new Response(null, { headers: HEADERS });
}
