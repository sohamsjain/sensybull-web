/**
 * Fire-and-forget funnel analytics for the shareable track links.
 *
 * The client reports the pre-add steps (link opened, button clicked, auth
 * started/completed, failures); the API records the authoritative outcomes
 * (watchlist_added / already_in_watchlist) on POST /watchlists/track itself.
 * Failures here are swallowed — analytics never blocks the UX.
 */

import { getTokens } from "@/lib/api-client";
import type { ShareAttribution } from "@/lib/share";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export type ShareFunnelEvent =
  | "link_opened"
  | "button_clicked"
  | "auth_started"
  | "auth_completed"
  | "failed";

export function trackShareEvent(
  event: ShareFunnelEvent,
  data: { symbol?: string; attribution?: ShareAttribution } = {}
): void {
  if (typeof window === "undefined") return;
  const { access } = getTokens();
  const body = JSON.stringify({
    event,
    symbol: data.symbol,
    referrer: document.referrer || undefined,
    logged_in: !!access,
    ...data.attribution,
  });
  try {
    void fetch(`${API_URL}/share/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body,
      keepalive: true, // survives the redirect that usually follows
    }).catch(() => {});
  } catch {}
}
