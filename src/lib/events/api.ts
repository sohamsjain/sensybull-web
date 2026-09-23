import { cache } from "react";
import type { FilingEvent } from "@/types/events";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/** A permalink can change after publish (a PR gains its SEC filing). */
export const EVENT_REVALIDATE_SECONDS = 300;

export type EventResult =
  | { kind: "ready"; event: FilingEvent }
  | { kind: "missing" }
  | { kind: "offline" };

const EVENT_ID_RE = /^[0-9a-f-]{36}$/i;

/**
 * One public event, fetched on the server so a permalink's HTML carries the
 * update itself — crawlers and link unfurlers never see a skeleton. Cached
 * per request so metadata and page share the fetch.
 */
export const getPublicEvent = cache(
  async (id: string): Promise<EventResult> => {
    if (!EVENT_ID_RE.test(id)) return { kind: "missing" };
    let res: Response;
    try {
      res = await fetch(`${API_URL}/events/all/${encodeURIComponent(id)}`, {
        next: { revalidate: EVENT_REVALIDATE_SECONDS },
      });
    } catch {
      return { kind: "offline" };
    }
    if (res.status === 404) return { kind: "missing" };
    if (!res.ok) return { kind: "offline" };
    const data = (await res.json()) as { event: FilingEvent };
    return { kind: "ready", event: data.event };
  }
);
