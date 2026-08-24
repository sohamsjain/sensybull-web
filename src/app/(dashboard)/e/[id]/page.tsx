"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import type { FilingEvent } from "@/types/events";
import { api } from "@/lib/api-client";
import { FilingCard } from "@/components/feed/filing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

/** Shareable permalink for a single filing event (public). */
export default function EventPermalinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<FilingEvent | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    api<{ event: FilingEvent }>(`/events/all/${id}`)
      .then((data) => {
        if (cancelled) return;
        setEvent(data.event);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("missing");
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
        ) : state === "missing" || !event ? (
          <EmptyState
            className="pt-12"
            title="Event not found"
            description="This update doesn't exist, or it was removed."
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
