"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api-client";
import { displayCompanyName } from "@/lib/company-name";
import type {
  CompanySearchResponse,
  CompanySearchResult,
} from "@/types/api";
import { toast } from "@/components/ui/app-toaster";
import { Button } from "@/components/ui/button";
import {
  CompaniesIcon,
  DocumentIcon,
  PlusIcon,
  SpinnerIcon,
  UpdatesIcon,
} from "@/components/ui/icons";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

/**
 * Widely-held tickers, offered only so the first click is cheap.
 *
 * They are resolved by ticker against the company search at click time
 * rather than hardcoded by id — ids are per-environment, and a suggestion
 * that 404s on staging is worse than no suggestion.
 */
const SUGGESTED = ["AAPL", "NVDA", "MSFT", "TSLA", "AMZN", "AMD"];

/** What a reader gets out of following a company, in the order it happens. */
const STEPS = [
  {
    Icon: CompaniesIcon,
    title: "Follow a company",
    body: "Search by ticker or name. There is one list, and you can add to it from anywhere in the app.",
  },
  {
    Icon: UpdatesIcon,
    title: "Get its filings as they land",
    body: "Every 8-K and press release arrives within seconds, rewritten in plain English with the key dates and deal terms pulled out.",
  },
  {
    Icon: DocumentIcon,
    title: "Check the source",
    body: "Each summary quotes the filing itself and links straight to the highlighted passage on SEC EDGAR, so you never have to take our word for it.",
  },
];

/**
 * What a signed-in reader sees before they follow anything.
 *
 * The screen used to say "Pick a company to read its filing history" to a
 * reader who had no companies to pick — an instruction that cannot be
 * followed. This does the three things a first run has to do: explain what
 * the screen will become, put the search that fills it right here, and make
 * reaching a non-empty state one click rather than a research task.
 */
export function FirstRun({
  onAddCompany,
}: {
  onAddCompany: (companyId: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  // Debounced typeahead. Every state write happens in the timer callback,
  // never in the effect body, so a keystroke doesn't cascade a render before
  // the request has even been made.
  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(
      async () => {
        if (!q) {
          setResults([]);
          setSearching(false);
          return;
        }
        setSearching(true);
        try {
          const data = await api<CompanySearchResponse>(
            `/companies/search?q=${encodeURIComponent(q)}&limit=6`
          );
          if (live.current) setResults(data.results || []);
        } catch {
          if (live.current) setResults([]);
        } finally {
          if (live.current) setSearching(false);
        }
      },
      q ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [query]);

  const add = useCallback(
    async (company: CompanySearchResult) => {
      setAddingId(company.id);
      try {
        await onAddCompany(company.id);
        if (!live.current) return;
        setQuery("");
        setResults([]);
      } catch {
        if (live.current) {
          toast({
            title: `Couldn't follow ${company.ticker || displayCompanyName(company.name)}`,
            description: "Check your connection and try again.",
            tone: "danger",
          });
        }
      } finally {
        if (live.current) setAddingId(null);
      }
    },
    [onAddCompany]
  );

  /** Resolve a suggested ticker to a real company, then follow it. */
  const addByTicker = useCallback(
    async (ticker: string) => {
      setAddingId(ticker);
      try {
        const data = await api<CompanySearchResponse>(
          `/companies/search?q=${encodeURIComponent(ticker)}&limit=5`
        );
        const match =
          data.results?.find(
            (r) => r.ticker?.toUpperCase() === ticker.toUpperCase()
          ) ?? data.results?.[0];
        if (!match) {
          if (live.current) {
            toast({
              title: `${ticker} isn't in the company index yet`,
              description: "Try searching for the company by name instead.",
              tone: "danger",
            });
          }
          return;
        }
        await onAddCompany(match.id);
      } catch {
        if (live.current) {
          toast({
            title: `Couldn't follow ${ticker}`,
            description: "Check your connection and try again.",
            tone: "danger",
          });
        }
      } finally {
        if (live.current) setAddingId(null);
      }
    },
    [onAddCompany]
  );

  return (
    <div className="flex h-full w-full justify-center overflow-y-auto bg-canvas-sunken px-6 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-heading font-semibold text-ink">
          Follow your first company
        </h1>
        <p className="mt-2 text-body leading-relaxed text-ink-muted">
          Sensybull reads SEC filings and newswire releases the moment they
          publish, and tells you what actually happened. Add a company and
          this screen becomes its history.
        </p>

        {/* The search that fills the screen, on the screen it fills */}
        <div className="mt-6">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search by ticker or company name…"
            aria-label="Search companies to follow"
            autoFocus
          />

          {query.trim() && (
            <div className="mt-2 overflow-hidden rounded-md border border-line-subtle bg-surface">
              {searching && results.length === 0 && (
                <p className="px-3 py-3 text-label text-ink-faint">
                  Searching…
                </p>
              )}
              {!searching && results.length === 0 && (
                <p className="px-3 py-3 text-label text-ink-faint">
                  No company matches “{query.trim()}”. Try the ticker instead.
                </p>
              )}
              {results.map((company) => (
                <button
                  key={company.id}
                  onClick={() => add(company)}
                  disabled={addingId === company.id}
                  className="flex w-full items-center justify-between gap-3 border-b border-line-subtle px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-hover disabled:opacity-50"
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="shrink-0 font-mono text-label font-semibold text-ink">
                      {company.ticker}
                    </span>
                    <span className="truncate text-meta text-ink-faint">
                      {displayCompanyName(company.name)}
                    </span>
                  </span>
                  {addingId === company.id ? (
                    <SpinnerIcon className="size-4 shrink-0 animate-spin text-ink-faint" />
                  ) : (
                    <PlusIcon className="size-4 shrink-0 text-brand-ink" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* One click to a non-empty state */}
        {!query.trim() && (
          <div className="mt-5">
            <p className="text-meta text-ink-faint">Or start with one of these</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED.map((ticker) => (
                <Button
                  key={ticker}
                  variant="outline"
                  size="sm"
                  onClick={() => addByTicker(ticker)}
                  disabled={addingId != null}
                  className={cn(
                    "font-mono",
                    addingId === ticker && "opacity-60"
                  )}
                >
                  {addingId === ticker ? (
                    <SpinnerIcon className="animate-spin" />
                  ) : (
                    <PlusIcon />
                  )}
                  {ticker}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* What happens next, so the first add isn't a leap of faith */}
        <ul className="mt-10 flex flex-col gap-5 border-t border-line-subtle pt-8">
          {STEPS.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-[18px] shrink-0 text-ink-dim"
              />
              <div className="min-w-0">
                <p className="text-label font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-label leading-relaxed text-ink-muted">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
