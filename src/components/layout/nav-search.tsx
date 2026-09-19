"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api-client";
import { displayCompanyName } from "@/lib/company-name";
import { companyLinkProps } from "@/lib/fundamentals/links";
import type { CompanySearchResponse, CompanySearchResult } from "@/types/api";
import { Kbd } from "@/components/ui/kbd";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * The navbar's company search. Type a ticker or a name, pick a result, and
 * the company's financials open in a new tab — the reader stays where they
 * were. Results hang below the field; the field never navigates itself.
 */
export function NavSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [focused, setFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const data = await api<CompanySearchResponse>(
          `/companies/search?q=${encodeURIComponent(q)}&limit=8`
        );
        setResults(data.results || []);
        setSelected(0);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, q ? 150 : 0);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus leaving the whole control closes the list. Result rows swallow
  // mousedown so a click never blurs the input first (Safari doesn't focus
  // a clicked anchor, which would unmount the row before its click lands).
  const onBlur = (e: React.FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
      setFocused(false);
    }
  };

  const open = (result: CompanySearchResult) => {
    const { href, target } = companyLinkProps(result);
    if (target) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      open(results[selected]);
    } else if (e.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
    }
  };

  const q = query.trim();
  const showList = focused && q.length > 0;

  return (
    <div
      ref={rootRef}
      onBlur={onBlur}
      className={cn("relative w-56 md:w-64", className)}
    >
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3",
          "transition-colors focus-within:border-brand"
        )}
      >
        <SearchIcon className="size-4 shrink-0 text-ink-faint" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search for a company"
          aria-expanded={showList}
          aria-controls="nav-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder="Search for a company"
          className="min-w-0 flex-1 bg-transparent text-label text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
        />
        {!query && <Kbd className="hidden md:inline-flex">⌘K</Kbd>}
      </div>

      {showList && (
        <div
          id="nav-search-results"
          role="listbox"
          aria-label="Companies"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full right-0 z-50 mt-1.5 w-80 overflow-hidden rounded-lg border border-line bg-popover py-1 shadow-popover"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-meta text-ink-faint">
              {searching ? "Searching…" : `No company matches “${q}”.`}
            </p>
          ) : (
            results.map((r, i) => (
              <a
                key={r.id}
                role="option"
                aria-selected={i === selected}
                {...companyLinkProps(r)}
                onMouseEnter={() => setSelected(i)}
                onClick={(e) => {
                  e.preventDefault();
                  open(r);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 transition-colors",
                  i === selected ? "bg-surface-hover" : ""
                )}
              >
                <span className="min-w-0 flex-1 truncate text-label text-ink">
                  {displayCompanyName(r.name)}
                </span>
                <span className="shrink-0 font-mono text-micro text-ink-faint">
                  {r.ticker}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
