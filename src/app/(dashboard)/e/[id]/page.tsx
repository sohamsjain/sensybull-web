"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import type { FilingEvent } from "@/types/events";
import { api } from "@/lib/api-client";
import { FilingCard } from "@/components/feed/filing-card";

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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {state === "loading" ? (
          <div className="h-48 rounded-xl bg-slate-100 dark:bg-white/[0.04] animate-pulse" />
        ) : state === "missing" || !event ? (
          <div className="text-center mt-16">
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
              Event not found
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">
              This filing event doesn&apos;t exist or was removed.
            </p>
          </div>
        ) : (
          <FilingCard event={event} density="comfortable" />
        )}
        <p className="text-center mt-6">
          <Link
            href="/feed"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
          >
            ← Open the live feed
          </Link>
        </p>
      </div>
    </div>
  );
}
