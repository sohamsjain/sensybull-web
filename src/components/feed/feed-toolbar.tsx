"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/app/(dashboard)/layout";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SIGNIFICANCE_LEVELS, SIGNIFICANCE_CONFIG } from "@/config/constants";
import { useDensity } from "@/hooks/use-density";
import type { EventTypesResponse } from "@/types/api";

/** Filter row at the top of the feed: significance, event types, search. */
export function FeedToolbar() {
  const { user } = useAuth();
  const {
    significanceFilter,
    toggleSignificance,
    eventTypeFilter,
    toggleEventType,
    clearEventTypes,
    search,
    setSearch,
    openMobileNav,
  } = useDashboard();

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [density, setDensity] = useDensity();

  useEffect(() => {
    api<EventTypesResponse>("/events/types")
      .then((data) => setEventTypes(data.event_types || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const activeCount = eventTypeFilter.size;

  return (
    <div className="h-12 border-b border-slate-200 dark:border-white/[0.06] flex items-center px-4 gap-3 shrink-0 bg-white dark:bg-[#0a0a12]">
      {/* Watchlist drawer on mobile */}
      {user && (
        <button
          onClick={openMobileNav}
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          aria-label="Open watchlists"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Significance filter toggles */}
      <div className="flex gap-1">
        {SIGNIFICANCE_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => toggleSignificance(level)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              significanceFilter.has(level)
                ? SIGNIFICANCE_CONFIG[level].activeToggle
                : "bg-slate-100 dark:bg-[#12121e] text-slate-400 dark:text-slate-600"
            }`}
          >
            {level === "Medium" ? "Med" : level}
          </button>
        ))}
      </div>

      {/* Event type filter dropdown */}
      <div className="relative hidden sm:block" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`flex px-3 py-1.5 rounded text-xs font-medium transition-colors items-center gap-1.5 ${
            activeCount > 0
              ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/30"
              : "bg-slate-100 dark:bg-[#12121e] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06] hover:border-slate-400 dark:hover:border-white/[0.12]"
          }`}
        >
          Event Types
          {activeCount > 0 && (
            <span className="bg-violet-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] leading-none px-1">
              {activeCount}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            {activeCount > 0 && (
              <div className="px-3 py-2 border-b border-slate-200 dark:border-white/[0.06]">
                <button
                  onClick={clearEventTypes}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Clear all ({activeCount})
                </button>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto py-1">
              {eventTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-200/50 dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={eventTypeFilter.has(type)}
                    onChange={() => toggleEventType(type)}
                    className="rounded border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#0a0a12] text-violet-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <Input
        id="feed-search"
        type="text"
        placeholder="Search ticker or company..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 max-w-xs bg-slate-100 dark:bg-[#12121e] border-slate-200 dark:border-white/[0.06] text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-violet-500/40 dark:focus-visible:border-violet-500/40 focus-visible:ring-0"
      />

      {/* Density: compact collapses summaries/deal terms behind a click */}
      <button
        onClick={() =>
          setDensity(density === "compact" ? "comfortable" : "compact")
        }
        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
        title={
          density === "compact"
            ? "Density: Compact — click for Comfortable"
            : "Density: Comfortable — click for Compact"
        }
        aria-label={`Density: ${density}. Activate to change.`}
      >
        {density === "compact" ? (
          <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth={1.5} d="M3 4.5h14M3 8.5h14M3 12.5h14M3 16.5h14" />
          </svg>
        ) : (
          <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth={1.5} d="M3 5.5h14M3 11h14M3 16.5h14" />
          </svg>
        )}
      </button>

      {/* Guests have no nav rail; give them theme + sign-in here */}
      {!user && (
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="w-8 h-8" />
          <Link href="/login">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
