"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { FundamentalsPayload } from "@/types/fundamentals";
import { Skeleton } from "@/components/ui/skeleton";

const POLL_MS = 2000;
const GIVE_UP_AFTER = 30;

/**
 * Shown while the API backfills a ticker it has never synced. Polls until
 * the statements land, then re-renders the page server-side.
 */
export function BuildingPoll({ symbol }: { symbol: string }) {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const data = await api<FundamentalsPayload>(
          `/fundamentals/${encodeURIComponent(symbol)}`
        );
        if (cancelled) return;
        if (data.status !== "building") {
          clearInterval(timer);
          router.refresh();
          return;
        }
      } catch {
        // keep polling; a transient error is not a verdict
      }
      if (attempts >= GIVE_UP_AFTER) {
        clearInterval(timer);
        setGaveUp(true);
      }
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [symbol, router]);

  return (
    <div className="space-y-6" aria-busy={!gaveUp}>
      <p className="text-label text-ink-muted">
        {gaveUp
          ? "This is taking longer than usual. Reload in a minute — the data will be here."
          : "Loading financials for the first time — a few seconds."}
      </p>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    </div>
  );
}
