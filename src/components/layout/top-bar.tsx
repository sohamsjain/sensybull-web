"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIGNIFICANCE_LEVELS, SIGNIFICANCE_CONFIG } from "@/config/constants";
import type { EventTypesResponse } from "@/types/api";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopBarProps {
  significanceFilter: Set<string>;
  onSignificanceToggle: (level: string) => void;
  eventTypeFilter: Set<string>;
  onEventTypeToggle: (type: string) => void;
  onEventTypeClear: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onMobileMenuToggle?: () => void;
  showFilters?: boolean;
}

export function TopBar({
  significanceFilter,
  onSignificanceToggle,
  eventTypeFilter,
  onEventTypeToggle,
  onEventTypeClear,
  search,
  onSearchChange,
  onMobileMenuToggle,
  showFilters = true,
}: TopBarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<EventTypesResponse>("/events/types")
      .then((data) => setEventTypes(data.event_types || []))
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen, userMenuOpen]);

  const activeCount = eventTypeFilter.size;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-white/[0.06] flex items-center px-4 gap-4 shrink-0 bg-white dark:bg-[#0a0a12]">
      {/* Mobile menu button */}
      {onMobileMenuToggle && (
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <Link href="/" className="flex items-center gap-2 mr-2">
        <span className="h-6 w-6 rounded-md bg-white flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="h-5 w-5 object-contain"
            onError={(e) => {
              // No logo file yet — hide the chip, keep the wordmark
              e.currentTarget.parentElement!.style.display = "none";
            }}
          />
        </span>
        <h1 className="text-slate-900 dark:text-white font-bold text-lg">Sensybull</h1>
      </Link>

      {/* Primary nav — desktop uses the left rail; keep links on mobile */}
      {user && (
        <nav className="flex md:hidden items-center gap-1 mr-2">
          {[
            { href: "/chats", label: "Chats" },
            { href: "/feed", label: "Feed" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-2.5 py-1 rounded text-sm transition-colors ${
                pathname?.startsWith(href)
                  ? "bg-slate-200 dark:bg-white/[0.08] text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}

      {/* Significance filter toggles */}
      <div className={showFilters ? "hidden sm:flex gap-1" : "hidden"}>
        {SIGNIFICANCE_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSignificanceToggle(level)}
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
      <div
        className={showFilters ? "relative hidden sm:block" : "hidden"}
        ref={dropdownRef}
      >
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`flex px-3 py-1.5 rounded text-xs font-medium transition-colors items-center gap-1.5 ${
            activeCount > 0
              ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
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
                  onClick={onEventTypeClear}
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
                    onChange={() => onEventTypeToggle(type)}
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
      {showFilters && (
        <Input
          type="text"
          placeholder="Search ticker or company..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="hidden sm:block flex-1 max-w-xs bg-slate-100 dark:bg-[#12121e] border-slate-200 dark:border-white/[0.06] text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-violet-500/40 dark:focus-visible:border-violet-500/40 focus-visible:ring-0"
        />
      )}

      {/* Auth */}
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle className="w-8 h-8 md:hidden" />
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="text-slate-500 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-white"
            >
              {user.name}
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
                <Link
                  href="/alerts"
                  onClick={() => setUserMenuOpen(false)}
                  className="block w-full text-left px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                >
                  Alerts
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
