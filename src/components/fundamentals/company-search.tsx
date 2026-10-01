"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { displayCompanyName } from "@/lib/company-name";
import { formatCompactDollars } from "@/lib/fundamentals/format";
import { companyLinkProps } from "@/lib/fundamentals/links";
import { recordSearch } from "@/lib/search-history";
import type { CompanySearchResponse, CompanySearchResult } from "@/types/api";
import { SearchInput } from "@/components/ui/search-input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/**
 * The search box that is the fundamentals section's home: type a ticker or
 * a name, arrow to a result, Enter to open. Public — works signed out.
 */
export function CompanySearch({
  autoFocus = false,
  size = "md",
  placeholder = "Search a company or ticker…",
}: {
  autoFocus?: boolean;
  /** "lg" is the hero field on an otherwise empty pane. */
  size?: "md" | "lg";
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "offline">("idle");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const q = query.trim();
    // Debounced; the empty case clears on the next tick rather than in the
    // effect body so a keystroke never triggers a synchronous re-render.
    // `stale` drops an answer that lands after the query moved on — without
    // it, erasing "ap" cleared the list and then the in-flight "ap" request
    // filled it again under an empty box.
    let stale = false;
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        setState("idle");
        return;
      }
      setState("loading");
      try {
        const data = await api<CompanySearchResponse>(
          `/companies/search?q=${encodeURIComponent(q)}&limit=8`
        );
        if (stale) return;
        setResults(data.results || []);
        setSelected(0);
        setState("ready");
      } catch (err) {
        if (stale) return;
        setState(err instanceof ApiError && err.isOffline ? "offline" : "ready");
        setResults([]);
      }
    }, q ? 150 : 0);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      recordSearch(results[selected]);
      const { href, target } = companyLinkProps(results[selected]);
      // Financials always open in a new tab; only the watchlist fallback
      // navigates this one.
      if (target) window.open(href, "_blank", "noopener,noreferrer");
      else router.push(href);
    } else if (e.key === "Escape" && query) {
      e.stopPropagation();
      setQuery("");
    }
  };

  // Focus leaving the whole control closes the list. The list swallows
  // mousedown so clicking a result never blurs the input first.
  const onBlur = (e: React.FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
      setFocused(false);
    }
  };

  const q = query.trim();
  // The list exists only while there is something typed: no query, no list,
  // whatever an earlier answer left in state.
  const open = focused && q.length > 0 && state !== "idle";

  return (
    <div
      ref={rootRef}
      onBlur={onBlur}
      onFocus={() => setFocused(true)}
      className="relative w-full"
    >
      <SearchInput
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Search companies"
        className={size === "lg" ? "h-12 px-4 [&_input]:text-body" : undefined}
        autoComplete="off"
      />
      {open && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden rounded-lg border border-line bg-popover shadow-popover"
        >
          {state === "offline" ? (
            <p className="px-3 py-2.5 text-meta text-ink-faint">
              Couldn&apos;t reach Sensybull. Check your connection and try again.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2.5 text-meta text-ink-faint">
              {state === "loading"
                ? "Searching…"
                : <>No company matches &ldquo;{q}&rdquo;. Try the ticker.</>}
            </p>
          ) : (
            <ul
              role="listbox"
              aria-label="Companies"
              className="divide-y divide-line-subtle"
            >
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === selected}>
                  <Link
                    {...companyLinkProps(r)}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => recordSearch(r)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 transition-colors",
                      i === selected ? "bg-brand-soft" : "hover:bg-surface-hover"
                    )}
                  >
                    <span className="w-16 shrink-0 font-mono text-label font-semibold text-ink">
                      {r.ticker}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-label text-ink-muted">
                      {displayCompanyName(r.name)}
                      {r.industry && (
                        <span className="text-ink-faint"> · {r.industry}</span>
                      )}
                    </span>
                    {r.market_cap != null && (
                      <span className="shrink-0 font-mono text-micro tabular-nums text-ink-faint">
                        {formatCompactDollars(r.market_cap)}
                      </span>
                    )}
                    {i === selected && <Kbd className="hidden sm:inline-flex">↵</Kbd>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
