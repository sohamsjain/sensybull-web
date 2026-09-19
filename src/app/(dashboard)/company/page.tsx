import type { Metadata } from "next";
import Link from "next/link";
import { CompanySearch } from "@/components/fundamentals/company-search";
import { fundamentalsHref, NEW_TAB } from "@/lib/fundamentals/links";

export const metadata: Metadata = {
  title: "Company financials",
  description:
    "Quarterly results, profit & loss, balance sheet, cash flows, ratios and SEC filings for any US-listed company, on one page.",
  alternates: { canonical: "/company" },
};

/** A few large, familiar names so an empty search box isn't a dead end. */
const STARTERS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "JPM", "XOM", "COST"];

/**
 * The fundamentals home: a search box. Like screener.in's front page, the
 * only thing to do here is name a company.
 */
export default function CompanyIndexPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-16 sm:pt-24">
        <h1 className="text-heading font-semibold text-ink">Company financials</h1>
        <p className="mt-1 mb-5 text-body text-ink-muted">
          Ten years of results, balance sheets, cash flows and ratios for any
          US-listed company, with its SEC filings, on one page.
        </p>
        <CompanySearch autoFocus />
        <p className="mt-6 eyebrow">Try</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {STARTERS.map((t) => (
            <li key={t}>
              <Link
                href={fundamentalsHref(t)}
                {...NEW_TAB}
                className="inline-flex h-8 items-center rounded-sm bg-surface-hover px-2.5 font-mono text-meta font-medium text-ink-muted transition-colors hover:bg-surface-active hover:text-ink"
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
