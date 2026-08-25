"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import {
  useDashboard,
  type FeedFilter,
  type FeedScope,
} from "@/app/(dashboard)/layout";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/badge";
import { Chip, ChipRow, SegmentedControl } from "@/components/ui/chip";
import { Kbd } from "@/components/ui/kbd";
import { SearchInput } from "@/components/ui/search-input";
import { ThemeToggle } from "@/components/theme-toggle";

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "important", label: "Important" },
];

/** Whose updates you're reading. */
const SCOPES: { value: FeedScope; label: string }[] = [
  { value: "mine", label: "My companies" },
  { value: "all", label: "Everything" },
];

/** Fallback while GET /events/types loads (mirrors the API's canonical list). */
const DEFAULT_EVENT_TYPES = [
  "Acquisition",
  "Material Agreement",
  "Earnings",
  "Bankruptcy",
  "Debt / Financing",
  "Restructuring",
  "Leadership Change",
  "Delisting",
  "Restatement",
  "Cybersecurity Incident",
];

/**
 * Feed header, two rows that always sit in the same place: whose updates
 * you're reading plus search on top, then how to narrow them — All /
 * Important, and the event categories.
 *
 * The stream's state lives here rather than in the reading column: it is
 * chrome, and a "Live · 50 events" banner above the first update was a row
 * of furniture between the reader and the news.
 */
export function FeedToolbar({ connected }: { connected: boolean }) {
  const { user } = useAuth();
  const {
    scope,
    setScope,
    filter,
    setFilter,
    eventType,
    setEventType,
    search,
    setSearch,
  } = useDashboard();

  const [eventTypes, setEventTypes] = useState<string[]>(DEFAULT_EVENT_TYPES);
  useEffect(() => {
    let cancelled = false;
    api<{ event_types: string[] }>("/events/types")
      .then((data) => {
        if (cancelled || !data.event_types?.length) return;
        // "Other" isn't a useful filter — the All chip already covers it
        setEventTypes(data.event_types.filter((t) => t !== "Other"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="shrink-0 border-b border-line-subtle bg-canvas">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2.5 px-4">
        {/* Signed-in readers choose whose filings they're looking at */}
        {user && (
          <SegmentedControl
            options={SCOPES}
            value={scope ?? "all"}
            onChange={setScope}
            label="Show updates from the companies you follow, or from every company"
          />
        )}

        <SearchInput
          id="feed-search"
          value={search}
          onValueChange={setSearch}
          placeholder="Search company or headline…"
          className="min-w-0 max-w-xs flex-1"
          hint={<Kbd className="hidden md:inline-flex">/</Kbd>}
        />

        <div className="ml-auto flex items-center gap-2.5">
          <span
            className="hidden items-center gap-1.5 text-meta text-ink-faint sm:flex"
            aria-live="polite"
          >
            <StatusDot live={connected} />
            {connected ? "Live" : "Connecting…"}
          </span>
          {/* Guests have no nav rail; give them theme + sign-in here */}
          {!user && (
            <>
              <ThemeToggle size="md" />
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* items-start so All/Important stays on the first line of chips when
          the categories wrap onto a second and third row */}
      <div className="mx-auto flex w-full max-w-3xl items-start gap-2.5 px-4 pb-2">
        <SegmentedControl
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          label="Show all updates or only important ones"
        />
        <span className="mt-1 h-5 w-px shrink-0 bg-line-subtle" />
        <ChipRow
          className="min-w-0 flex-1 md:flex-wrap md:overflow-visible md:[mask-image:none]"
          role="tablist"
          aria-label="Filter by event type"
        >
          <Chip
            role="tab"
            aria-selected={eventType === null}
            selected={eventType === null}
            onClick={() => setEventType(null)}
          >
            All types
          </Chip>
          {eventTypes.map((type) => (
            <Chip
              key={type}
              role="tab"
              aria-selected={eventType === type}
              selected={eventType === type}
              onClick={() => setEventType(eventType === type ? null : type)}
            >
              {type}
            </Chip>
          ))}
        </ChipRow>
      </div>
    </div>
  );
}
