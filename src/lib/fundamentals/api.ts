import { cache } from "react";
import type {
  FundamentalsDocuments,
  FundamentalsPayload,
} from "@/types/fundamentals";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/** How long a rendered company page may be served before re-fetching. */
export const PAGE_REVALIDATE_SECONDS = 3600;
export const DOCS_REVALIDATE_SECONDS = 6 * 3600;

export type FundamentalsResult =
  | { kind: "ready"; data: FundamentalsPayload }
  | { kind: "building"; data: FundamentalsPayload }
  | { kind: "unavailable"; data: FundamentalsPayload }
  | { kind: "empty"; data: FundamentalsPayload }
  | { kind: "missing" }
  | { kind: "offline" };

async function fetchPage(
  symbol: string,
  init: RequestInit & { next?: { revalidate: number } }
): Promise<FundamentalsResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/fundamentals/${encodeURIComponent(symbol)}`, init);
  } catch {
    return { kind: "offline" };
  }
  if (res.status === 404 || res.status === 400) return { kind: "missing" };
  if (!res.ok && res.status !== 202) return { kind: "offline" };
  const data = (await res.json()) as FundamentalsPayload;
  switch (data.status) {
    case "ready":
      return { kind: "ready", data };
    case "building":
      return { kind: "building", data };
    case "empty":
      return { kind: "empty", data };
    default:
      return { kind: "unavailable", data };
  }
}

/**
 * The page's one data fetch, cached per request so metadata and body share it.
 *
 * Next's data cache stores whatever the API answered, including a 202
 * "building" while a never-synced ticker backfills. A cached "building"
 * would pin the page to its skeleton for an hour, so anything that isn't
 * `ready` is re-fetched uncached: the common case stays on the ISR path,
 * the rare case costs one extra round trip and heals itself.
 */
export const getFundamentals = cache(
  async (symbol: string): Promise<FundamentalsResult> => {
    const cached = await fetchPage(symbol, {
      next: { revalidate: PAGE_REVALIDATE_SECONDS },
    });
    if (cached.kind === "ready" || cached.kind === "missing") return cached;
    return fetchPage(symbol, { cache: "no-store" });
  }
);

export const getDocuments = cache(
  async (symbol: string): Promise<FundamentalsDocuments | null> => {
    try {
      const res = await fetch(
        `${API_URL}/fundamentals/${encodeURIComponent(symbol)}/documents`,
        { next: { revalidate: DOCS_REVALIDATE_SECONDS } }
      );
      if (!res.ok) return null;
      return (await res.json()) as FundamentalsDocuments;
    } catch {
      return null;
    }
  }
);
