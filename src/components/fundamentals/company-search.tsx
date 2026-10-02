"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { displayCompanyName } from "@/lib/company-name";
import { formatCompactDollars } from "@/lib/fundamentals/format";
import { companyLinkProps } from "@/lib/fundamentals/links";
import { recordSearch } from "@/lib/search-history";
import { useCompanySearch } from "@/hooks/use-company-search";
import type { CompanySearchResult } from "@/types/api";
import { SearchInput } from "@/components/ui/search-input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/** Space kept between the list's bottom edge and the viewport's. */
const VIEWPORT_GAP = 16;
/** Never shrink the list below this, even at the very bottom of the screen. */
const MIN_LIST_HEIGHT = 160;

/**
 * Cap the open list at the room left below it, so a long list scrolls inside
 * itself instead of stretching (and scrolling) the page or pane around it.
 * A ref callback: it measures once, as the list mounts.
 */
function fitToViewport(el: HTMLDivElement | null) {
  if (!el) return;
  const room = window.innerHeight - el.getBoundingClientRect().top - VIEWPORT_GAP;
  el.style.maxHeight = `${Math.max(room, MIN_LIST_HEIGHT)}px`;
}

/**
 * The search box that is the fundamentals section's home: type a ticker or
 * a name, arrow to a result, Enter to open. Public — works signed out.
 *
 * Results come from `useCompanySearch` (cache + local narrowing + adaptive
 * debounce), so most keystrokes re-rank a list already on screen rather
 * than wait on the network.
 */
export function CompanySearch({
  autoFocus = false,
  size = "md",
  placeholder = "Search a company or ticker…",
  showTickers = true,
}: {
  autoFocus?: boolean;
  /** "lg" is the hero field on an otherwise empty pane. */
  size?: "md" | "lg";
  placeholder?: string;
  /** False on surfaces that never print a ticker (the watchlist). */
  showTickers?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState({ key: "", index: 0 });
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { results, status } = useCompanySearch(query);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const q = query.trim();
  // The keyboard cursor belongs to the query it was moved under: typing on
  // puts it back on the first row without an effect to reset it.
  const selected =
    cursor.key === q ? Math.min(cursor.index, Math.max(results.length - 1, 0)) : 0;
  const select = (index: number) => setCursor({ key: q, index });

  // Arrowing past the list's visible edge scrolls the list, not the page.
  const moveTo = (index: number) => {
    select(index);
    document
      .getElementById(`company-search-option-${index}`)
      ?.scrollIntoView({ block: "nearest" });
  };

  const openResult = (result: CompanySearchResult) => {
    recordSearch(result);
    const { href, target } = companyLinkProps(result);
    // Financials always open in a new tab; only the watchlist fallback
    // navigates this one.
    if (target) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveTo(Math.min(selected + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveTo(Math.max(selected - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      openResult(results[selected]);
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

  // Open only while something is typed, and only with something to say:
  // rows, a definite "no match", or "offline". A query still in flight with
  // nothing to show yet keeps it shut rather than flashing "Searching…".
  const message =
    status === "offline"
      ? "Couldn’t reach Sensybull. Check your connection and try again."
      : status === "ready" && results.length === 0
        ? `No company matches “${q}”.${showTickers ? " Try the ticker." : ""}`
        : null;
  const open = focused && q.length > 0 && (results.length > 0 || message !== null);

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
        role="combobox"
        aria-label="Search companies"
        aria-expanded={open}
        aria-controls="company-search-results"
        aria-autocomplete="list"
        className={size === "lg" ? "h-12 px-4 [&_input]:text-body" : undefined}
        autoComplete="off"
      />
      {open && (
        <div
          ref={fitToViewport}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full right-0 left-0 z-30 mt-1.5 overflow-y-auto overscroll-contain rounded-lg border border-line bg-popover py-1 shadow-popover"
        >
          {message ? (
            <p className="px-4 py-2.5 text-meta text-ink-faint">{message}</p>
          ) : (
            <ul id="company-search-results" role="listbox" aria-label="Companies">
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={`company-search-option-${i}`}
                  role="option"
                  aria-selected={i === selected}
                >
                  <Link
                    {...companyLinkProps(r)}
                    onMouseEnter={() => select(i)}
                    onClick={() => recordSearch(r)}
                    className={cn(
                      "flex items-center gap-3 border-l-2 px-3.5 py-2 transition-colors",
                      i === selected
                        ? "border-l-brand bg-brand-soft"
                        : "border-l-transparent"
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-medium text-ink">
                        {displayCompanyName(r.name)}
                      </span>
                      {(showTickers || r.industry) && (
                        <span className="block truncate text-micro text-ink-faint">
                          {[showTickers ? r.ticker : null, r.industry]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </span>
                    {r.market_cap != null && (
                      <span className="shrink-0 text-micro tabular-nums text-ink-faint">
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
