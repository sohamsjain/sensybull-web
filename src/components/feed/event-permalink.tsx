"use client";

import Link from "next/link";
import type { FilingEvent } from "@/types/events";
import { FilingCard } from "@/components/feed/filing-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertIcon, DocumentIcon } from "@/components/ui/icons";

/**
 * The body of a public permalink (/e/<id>). The page fetches the event on
 * the server and hands the outcome here; this only renders it.
 *
 * "offline" is a separate state on purpose: a dropped connection is not a
 * deleted event, and the two need different next steps.
 */
export function EventPermalink({
  event,
  state,
}: {
  event: FilingEvent | null;
  state: "ready" | "missing" | "offline";
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {state === "offline" ? (
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
