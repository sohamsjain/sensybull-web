"use client";

import Link from "next/link";
import { shortCompanyName } from "@/lib/company-name";
import { companyLinkProps, fundamentalsHref, NEW_TAB } from "@/lib/fundamentals/links";
import { POPULAR_COMPANIES } from "@/lib/fundamentals/popular";
import { clearSearchHistory, recordSearch, useSearchHistory } from "@/lib/search-history";
import { CompanySearch } from "@/components/fundamentals/company-search";
import { Kbd } from "@/components/ui/kbd";

const CHIP =
  "inline-flex h-8 items-center rounded-md border border-line px-3 text-meta text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-ink";

/**
 * What the watchlist's right pane shows with no company open: the product's
 * mark over one large search field, like a search engine's front page, and
 * a row of companies to start from — the reader's own recent searches when
 * there are any, otherwise a short list of familiar names.
 *
 * Results and chips open financials in a new tab, the same as the navbar
 * search. Chips print names, never tickers: this is the watchlist page.
 */
export function SearchHome() {
  const history = useSearchHistory();
  const recent = history.length > 0;

  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-canvas-sunken">
      <div className="w-full max-w-xl px-4 pt-[18vh] pb-16 sm:px-6">
        <div className="flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-9 invert-0 dark:invert" />
          <span className="text-heading font-semibold tracking-tight text-ink">
            Sensybull
          </span>
        </div>
        <p className="mt-3 mb-8 text-center text-body text-ink-muted">
          Every SEC filing, in plain English — and the financials behind it.
        </p>

        <CompanySearch size="lg" placeholder="Search for a company" />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-meta text-ink-muted">
            {recent ? "Recently searched:" : "Or analyse:"}
          </span>
          {recent
            ? history.map((h) => (
                <Link
                  key={h.id}
                  {...companyLinkProps(h)}
                  onClick={() => recordSearch(h)}
                  title={h.name}
                  className={CHIP}
                >
                  {shortCompanyName(h.name)}
                </Link>
              ))
            : POPULAR_COMPANIES.map((c) => (
                <Link key={c.ticker} href={fundamentalsHref(c.ticker)} {...NEW_TAB} className={CHIP}>
                  {c.name}
                </Link>
              ))}
          {recent && (
            <button
              type="button"
              onClick={clearSearchHistory}
              className="inline-flex h-8 items-center px-2 text-meta text-ink-faint transition-colors hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        <p className="mt-12 hidden flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-micro text-ink-faint md:flex">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span>switch companies</span>
          <span className="text-ink-dim">·</span>
          <Kbd>?</Kbd>
          <span>all shortcuts</span>
        </p>
      </div>
    </div>
  );
}
