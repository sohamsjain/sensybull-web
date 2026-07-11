"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard, type FeedFilter } from "@/app/(dashboard)/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "important", label: "Important" },
];

/** Feed header: one All/Important toggle and a search box. Nothing else. */
export function FeedToolbar() {
  const { user } = useAuth();
  const { filter, setFilter, search, setSearch } = useDashboard();

  return (
    <div className="h-12 border-b border-slate-200 dark:border-white/[0.06] flex items-center px-4 gap-3 shrink-0 bg-white dark:bg-[#0b0d12]">
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
  );
}
