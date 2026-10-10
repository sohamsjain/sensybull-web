"use client";

import Link from "next/link";
import { displayCompanyName } from "@/lib/company-name";
import { companyLinkProps, fundamentalsHref, NEW_TAB } from "@/lib/fundamentals/links";
import { POPULAR_COMPANIES } from "@/lib/fundamentals/popular";
import { clearSearchHistory, recordSearch, useSearchHistory } from "@/lib/search-history";
import { CompanySearch } from "@/components/fundamentals/company-search";

const CHIP =
  "inline-flex h-8 items-center rounded-md border border-line px-3 text-meta text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-ink";

/**
 * The home page (`/`), for guests and signed-in readers alike: the
 * product's mark over one large search field, like a search engine's front
 * page, and one-click companies under it: a short list of familiar names,
 * then the reader's own recent searches when there are any.
 *
 * Results and chips open financials in a new tab, the same as the navbar
 * search. Chips print short names, never tickers.
 */
export function SearchHome() {
  const history = useSearchHistory();

  return (
    // Three rows, the outer two equal: the search field sits at the exact
    // centre of the pane, the brand stacks up from it and the chips hang
    // down from it, however many chips there are.
    <div className="grid h-full w-full grid-rows-[1fr_auto_1fr] overflow-y-auto bg-canvas px-4 sm:px-6">
      <div className="flex flex-col items-center justify-end pt-10 pb-8 text-center">
        {/* The tightly cropped mark (logo.png carries a square's worth of
            padding), so its height is the bull's height and it can sit right
            on top of the name. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt=""
          width={880}
          height={471}
          className="h-20 w-auto invert-0 sm:h-24 dark:invert"
        />
        {/* Display type outside marketing, deliberately: this is the
            product's front page, and the brand is most of its content. */}
        <h1 className="mt-2 text-display-lg font-semibold text-ink">
          Sensybull
        </h1>
        <p className="mt-3 text-body text-ink-muted">
          Never miss a material update on your portfolio.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl">
        <CompanySearch size="lg" placeholder="Search for a company" showTickers={false} />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col">
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-meta text-ink-muted">Popular:</span>
          {POPULAR_COMPANIES.map((c) => (
            <Link key={c.ticker} href={fundamentalsHref(c.ticker)} {...NEW_TAB} className={CHIP}>
              {c.name}
            </Link>
          ))}
        </div>

        {history.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-meta text-ink-muted">Recently searched:</span>
            {history.map((h) => (
              <Link
                key={h.id}
                {...companyLinkProps(h)}
                onClick={() => recordSearch(h)}
                title={h.name}
                className={CHIP}
              >
                {displayCompanyName(h.name)}
              </Link>
            ))}
            <button
              type="button"
              onClick={clearSearchHistory}
              className="inline-flex h-8 items-center px-2 text-meta text-ink-faint transition-colors hover:text-ink"
            >
              Clear
            </button>
          </div>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-10 pb-6 text-micro text-ink-faint">
          <span>Not investment advice.</span>
          <Link href="/terms" className="transition-colors hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <Link href="/disclaimer" className="transition-colors hover:text-ink">
            Disclaimer
          </Link>
        </footer>
      </div>
    </div>
  );
}
