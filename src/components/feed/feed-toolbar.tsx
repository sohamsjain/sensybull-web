"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import { useDashboard, type FeedFilter } from "@/app/(dashboard)/layout";
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
 * Feed header: what you're looking at, a search box, and the categories.
 *
 * The chips wrap on desktop rather than scrolling off the edge — a pointer
 * has no way to swipe a hidden overflow, so half the taxonomy was
 * unreachable. Mobile keeps the single swipeable row.
 */
export function FeedToolbar({ connected }: { connected: boolean }) {
  const { user } = useAuth();
  const { filter, setFilter, eventType, setEventType, search, setSearch } =
    useDashboard();

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
    <div className="shrink-0 border-b border-line-subtle bg-canvas px-4">
      {/* Aligned with the reading column below, so the controls sit over the
          content they filter rather than over the empty margin. */}
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2.5">
        <SegmentedControl
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          label="Show all updates or only important ones"
        />

        <SearchInput
          id="feed-search"
          value={search}
          onValueChange={setSearch}
          placeholder="Search company or headline…"
          className="max-w-xs flex-1"
          hint={<Kbd className="hidden md:inline-flex">/</Kbd>}
        />

        <div className="ml-auto flex items-center gap-2.5">
          {/* Stream state lives with the controls, not in the reading column */}
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

      <ChipRow
        className="mx-auto w-full max-w-3xl pb-2 md:flex-wrap md:overflow-visible md:[mask-image:none]"
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
  );
}
