import type { PaginatedWatchlists, Watchlist } from "@/types/api";
import { api } from "@/lib/api-client";

/**
 * The UI presents a single watchlist; the API supports several. All adds go
 * to the user's first list, created on demand for brand-new accounts.
 */
export async function getOrCreateDefaultWatchlist(): Promise<Watchlist> {
  const data = await api<PaginatedWatchlists>("/watchlists/");
  const existing = data.watchlists?.[0];
  if (existing) return existing;
  const created = await api<{ watchlist: Watchlist }>("/watchlists/", {
    method: "POST",
    body: JSON.stringify({ name: "My Watchlist" }),
  });
  return created.watchlist;
}

/** Add a company to the user's default watchlist. */
export async function addToDefaultWatchlist(companyId: string): Promise<void> {
  const wl = await getOrCreateDefaultWatchlist();
  await api(`/watchlists/${wl.id}/companies`, {
    method: "POST",
    body: JSON.stringify({ company_id: companyId }),
  });
}
