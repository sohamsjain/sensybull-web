"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import type { FilingEvent } from "@/types/events";
import { api, ApiError } from "@/lib/api-client";
import { FilingCard } from "@/components/feed/filing-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertIcon, DocumentIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

/** Shareable permalink for a single filing event (public). */
export default function EventPermalinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<FilingEvent | null>(null);
  // "offline" is a separate state on purpose: a dropped connection is not a
  // deleted event, and the two need different next steps.
  const [state, setState] = useState<
    "loading" | "ready" | "missing" | "offline"
  >("loading");

  useEffect(() => {
    let cancelled = false;
    api<{ event: FilingEvent }>(`/events/all/${id}`)
      .then((data) => {
        if (cancelled) return;
        setEvent(data.event);
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const offline = err instanceof ApiError && err.isOffline;
        setState(offline ? "offline" : "missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {state === "loading" ? (
          <Skeleton className="h-40" />
        ) : state === "offline" ? (
          <EmptyState
            icon={AlertIcon}
            className="pt-12"
            title="Couldn't load this update"
            description="We couldn't reach Sensybull. Check your connection — the link itself is fine."
            action={
              <Button onClick={() => window.location.reload()}>
                Try again
              </Button>
            }
          />
        ) : state === "missing" || !event ? (
          <EmptyState
            icon={DocumentIcon}
            className="pt-12"
            title="This update no longer exists"
            description="It may have been removed, or the link may be incomplete."
            action={
              <Link href="/feed">
                <Button variant="outline">Browse the live feed</Button>
              </Link>
            }
          />
        ) : (
          <div className="rounded-md border border-line-subtle bg-surface">
            <FilingCard event={event} expanded />
          </div>
        )}
        <p className="mt-6 text-center">
          <Link
            href="/feed"
            className="text-meta text-brand-ink underline-offset-2 hover:underline"
          >
            Open the live feed
          </Link>
        </p>
      </div>
    </div>
  );
}
