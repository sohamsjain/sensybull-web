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
    // Three rows, the outer two equal: the search field sits at the exact
    // centre of the pane, the brand stacks up from it and the chips hang
    // down from it, however many chips there are.
    <div className="grid flex-1 grid-rows-[1fr_auto_1fr] overflow-y-auto bg-canvas-sunken px-4 sm:px-6">
      <div className="flex flex-col items-center justify-end pt-10 pb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" width={256} height={256} alt="" className="h-24 invert-0 dark:invert" />
        {/* Display type outside marketing, deliberately: this pane is the
            product's front page, and the brand is the whole of its content. */}
        <h1 className="mt-4 text-display-lg font-semibold text-ink">
          Sensybull
        </h1>
        <p className="mt-3 text-body text-ink-muted">
          Never miss a material update on your portfolio.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl">
        <CompanySearch size="lg" placeholder="Search for a company" showTickers={false} />
      </div>

      <div className="mx-auto w-full max-w-xl pb-10">
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-meta text-ink-muted">
            {recent ? "Recently searched:" : "Popular:"}
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

        <p className="mt-10 hidden flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-micro text-ink-faint md:flex">
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
