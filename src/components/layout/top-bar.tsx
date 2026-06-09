"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIGNIFICANCE_LEVELS, SIGNIFICANCE_CONFIG } from "@/config/constants";
import type { EventTypesResponse } from "@/types/api";
import Link from "next/link";

interface TopBarProps {
  significanceFilter: Set<string>;
  onSignificanceToggle: (level: string) => void;
  eventTypeFilter: Set<string>;
  onEventTypeToggle: (type: string) => void;
  onEventTypeClear: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onMobileMenuToggle?: () => void;
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
}: TopBarProps) {
  const { user, logout } = useAuth();
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
    <header className="h-14 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0 bg-slate-900">
      {/* Mobile menu button */}
      {onMobileMenuToggle && (
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-slate-400 hover:text-white"
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

      <h1 className="text-white font-bold text-lg mr-4">Sensybull</h1>

      {/* Significance filter toggles */}
      <div className="hidden sm:flex gap-1">
        {SIGNIFICANCE_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSignificanceToggle(level)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              significanceFilter.has(level)
                ? SIGNIFICANCE_CONFIG[level].activeToggle
                : "bg-slate-800 text-slate-600"
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
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500"
          }`}
        >
          Event Types
          {activeCount > 0 && (
            <span className="bg-blue-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] leading-none px-1">
              {activeCount}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {activeCount > 0 && (
              <div className="px-3 py-2 border-b border-slate-700">
                <button
                  onClick={onEventTypeClear}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear all ({activeCount})
                </button>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto py-1">
              {eventTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={eventTypeFilter.has(type)}
                    onChange={() => onEventTypeToggle(type)}
                    className="rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-300">{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search ticker or company..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="hidden sm:block flex-1 max-w-xs bg-slate-800 border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:border-slate-500 focus-visible:ring-0"
      />

      {/* Auth */}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="text-slate-400 text-sm hover:text-white"
            >
              {user.name}
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
