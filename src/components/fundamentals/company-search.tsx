"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { displayCompanyName } from "@/lib/company-name";
import { formatCompactDollars } from "@/lib/fundamentals/format";
import type { CompanySearchResponse, CompanySearchResult } from "@/types/api";
import { SearchInput } from "@/components/ui/search-input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/** Where a company result goes: its financials when it has them. */
export function companyHref(result: CompanySearchResult): string {
  return result.has_fundamentals !== false && result.ticker
    ? `/company/${result.ticker}`
    : `/watchlist?c=${result.id}`;
}

/**
 * The search box that is the fundamentals section's home: type a ticker or
 * a name, arrow to a result, Enter to open. Public — works signed out.
 */
export function CompanySearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "offline">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const q = query.trim();
    // Debounced; the empty case clears on the next tick rather than in the
    // effect body so a keystroke never triggers a synchronous re-render.
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
        setResults(data.results || []);
        setSelected(0);
        setState("ready");
      } catch (err) {
        setState(err instanceof ApiError && err.isOffline ? "offline" : "ready");
        setResults([]);
      }
    }, q ? 150 : 0);
    return () => clearTimeout(timer);
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
      router.push(companyHref(results[selected]));
    }
  };

  return (
    <div className="w-full">
      <SearchInput
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        onKeyDown={onKeyDown}
        placeholder="Search a company or ticker…"
        aria-label="Search companies"
        autoComplete="off"
      />
      {state === "offline" && (
        <p className="mt-2 text-meta text-ink-faint">
          Couldn&apos;t reach Sensybull. Check your connection and try again.
        </p>
      )}
      {query.trim() && state === "ready" && results.length === 0 && (
        <p className="mt-2 text-meta text-ink-faint">
          No company matches &ldquo;{query.trim()}&rdquo;. Try the ticker.
        </p>
      )}
      {results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Companies"
          className="mt-2 divide-y divide-line-subtle rounded-md border border-line bg-surface"
        >
          {results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === selected}>
              <Link
                href={companyHref(r)}
                onMouseEnter={() => setSelected(i)}
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
  );
}
