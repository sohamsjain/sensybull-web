"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard, type FeedFilter } from "@/app/(dashboard)/layout";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { EVENT_CATEGORIES } from "@/lib/event-categories";

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "important", label: "Important" },
];

/** Fallback while GET /events/types loads. "Other" is never a chip — the
 *  All chip already covers it. */
const DEFAULT_EVENT_TYPES = EVENT_CATEGORIES.filter((t) => t !== "Other");

/**
 * Feed header: the All/Important toggle, a search box, and a scrollable
 * row of event-type chips ("All types", Acquisition, Earnings, ...).
 */
export function FeedToolbar() {
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
    <div className="border-b border-slate-200 dark:border-white/[0.06] shrink-0 bg-white dark:bg-[#0b0d12]">
      <div className="h-12 flex items-center px-4 gap-3">
        {/* All / Important — one click, unmistakable selected state */}
        <div
          className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06]"
          role="tablist"
          aria-label="Show all updates or only important ones"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1 rounded-md text-[13px] font-semibold transition-colors ${
                filter === key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          id="feed-search"
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs bg-slate-100 dark:bg-[#14161c] border-slate-200 dark:border-white/[0.06] text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-indigo-500/60 focus-visible:ring-0"
        />

        {/* Guests have no nav rail; give them theme + sign-in here */}
        {!user && (
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="w-8 h-8" />
            <Link href="/login">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Event-type chips — horizontally scrollable, Substack-style */}
      <div
        className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter by event type"
      >
        <button
          role="tab"
          aria-selected={eventType === null}
          onClick={() => setEventType(null)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            eventType === null
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All types
        </button>
        {eventTypes.map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={eventType === type}
            onClick={() => setEventType(eventType === type ? null : type)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              eventType === type
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
