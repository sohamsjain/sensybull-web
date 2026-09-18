import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { normalizeSymbol, SITE_URL } from "@/lib/share";
import { displayCompanyName } from "@/lib/company-name";
import { getDocuments, getFundamentals } from "@/lib/fundamentals/api";
import {
  ANNUAL_INCOME_ROWS,
  BALANCE_ROWS,
  CASHFLOW_ROWS,
  INCOME_ROWS,
  RATIO_ROWS,
} from "@/lib/fundamentals/rows";
import { formatCompactDollars } from "@/lib/fundamentals/format";
import { AboutSection } from "@/components/fundamentals/about-section";
import { BuildingPoll } from "@/components/fundamentals/building-poll";
import { CompanyActions } from "@/components/fundamentals/company-actions";
import { DocumentsSection } from "@/components/fundamentals/documents-section";
import { FinancialTable } from "@/components/fundamentals/financial-table";
import { GrowthGrids } from "@/components/fundamentals/growth-grids";
import { RatioGrid } from "@/components/fundamentals/ratio-grid";
import { SectionNav } from "@/components/fundamentals/section-nav";
import { CompanyAvatar } from "@/components/watchlist/company-avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertIcon, CompaniesIcon, ExternalLinkIcon } from "@/components/ui/icons";

interface CompanyPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const symbol = normalizeSymbol((await params).symbol);
  const result = symbol ? await getFundamentals(symbol) : { kind: "missing" as const };
  if (!symbol || result.kind === "missing" || result.kind === "offline") {
    return {
      title: "Company financials",
      robots: { index: false, follow: false },
    };
  }
  const { company, ratios } = result.data;
  const name = displayCompanyName(company.name);
  const bits = [company.industry, formatCompactDollars(ratios.market_cap) + " market cap"].filter(
    (b) => b && !b.startsWith("—")
  );
  const description = `${name} (${symbol}) financials: quarterly results, profit & loss, balance sheet, cash flows and ratios, with SEC filings. ${bits.join(" · ")}.`;
  const title = `${symbol} · ${name} financials`;
  return {
    title,
    description,
    alternates: { canonical: `/company/${symbol}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/company/${symbol}`,
      siteName: "Sensybull",
      title,
      description,
    },
    twitter: { card: "summary", title, description },
    robots: result.kind === "ready" ? undefined : { index: false, follow: true },
  };
}

/**
 * The company page: everything screener.in puts on one page, for a US
 * ticker. Server-rendered from one API payload so the tables are in the
 * HTML before any JavaScript runs; the live price, expandable rows, units
 * toggle and section nav hydrate on top.
 */
export default async function CompanyPage({ params }: CompanyPageProps) {
  const symbol = normalizeSymbol((await params).symbol);
  if (!symbol) notFound();

  const [result, docs] = await Promise.all([getFundamentals(symbol), getDocuments(symbol)]);

  // A real 404 (not-found.tsx), so crawlers and link checkers learn the truth.
  if (result.kind === "missing") notFound();
  if (result.kind === "offline") return <Offline />;

  const { data } = result;
  const { company, ratios, growth, analysis } = data;
  const name = displayCompanyName(company.name);
  const ready = result.kind === "ready";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name,
    tickerSymbol: symbol,
    url: `${SITE_URL}/company/${symbol}`,
    ...(company.website ? { sameAs: company.website } : {}),
    ...(company.industry ? { industry: company.industry } : {}),
  };

  return (
    <div className="h-full overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-16">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="pt-6 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="flex min-w-0 items-start gap-3">
              <CompanyAvatar ticker={company.ticker} name={name} size="md" />
              <div className="min-w-0">
                <h1 className="text-heading leading-tight font-semibold text-ink">{name}</h1>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-meta text-ink-faint">
                  <span className="font-mono font-semibold text-ink-muted">{symbol}</span>
                  {company.exchange && <span>{company.exchange}</span>}
                  {company.industry && <span>· {company.industry}</span>}
                  {company.is_adr && <span>· ADR</span>}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-meta">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-ink underline-offset-2 hover:underline"
                    >
                      Website
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                  {docs?.edgar_url && (
                    <a
                      href={docs.edgar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-ink underline-offset-2 hover:underline"
                    >
                      SEC filings
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                </p>
              </div>
            </div>
            <CompanyActions companyId={company.id} ticker={symbol} name={name} />
          </div>

          <div className="mt-5">
            <RatioGrid companyId={company.id} ratios={ratios} />
          </div>
          {data.as_of.latest_quarter_end && ready && (
            <p className="mt-3 text-micro text-ink-faint">
              Statements through {data.as_of.latest_quarter_end.slice(0, 7)}
              {ratios.ttm_is_fy ? " · TTM figures use the latest fiscal year" : ""}.
            </p>
          )}
        </header>

        {ready ? (
          <>
            <SectionNav />

            <Section id="analysis" title="">
              <AboutSection company={company} analysis={analysis} />
            </Section>

            <Section id="quarters" title="Quarterly Results">
              <FinancialTable
                table={data.quarterly}
                rows={INCOME_ROWS}
                defaultColumns={data.table_defaults.quarters}
                showFiscalPeriod
              />
            </Section>

            <Section id="profit-loss" title="Profit & Loss">
              <FinancialTable
                table={data.annual.income}
                rows={ANNUAL_INCOME_ROWS}
                defaultColumns={data.table_defaults.annual_years + 1}
              />
              <div className="mt-6">
                <GrowthGrids growth={growth} />
              </div>
            </Section>

            <Section id="balance-sheet" title="Balance Sheet">
              <FinancialTable
                table={data.annual.balance}
                rows={BALANCE_ROWS}
                defaultColumns={data.table_defaults.annual_years}
              />
            </Section>

            <Section id="cash-flow" title="Cash Flows">
              <FinancialTable
                table={data.annual.cashflow}
                rows={CASHFLOW_ROWS}
                defaultColumns={data.table_defaults.annual_years}
              />
            </Section>

            <Section id="ratios" title="Ratios">
              <FinancialTable
                table={data.annual.ratios}
                rows={RATIO_ROWS}
                defaultColumns={data.table_defaults.annual_years}
                caption="Days and percentages, by fiscal year"
              />
            </Section>

            <Section id="documents" title="Documents">
              <DocumentsSection docs={docs} companyId={company.id} />
            </Section>
          </>
        ) : result.kind === "building" ? (
          <BuildingPoll symbol={symbol} />
        ) : result.kind === "empty" ? (
          <>
            <EmptyState
              icon={CompaniesIcon}
              align="start"
              className="px-0"
              title="No financial statements for this ticker"
              description="Funds, ETFs, SPACs and shell companies don't file the statements this page reads. Its SEC filings and updates are still below."
            />
            <Section id="documents" title="Documents">
              <DocumentsSection docs={docs} companyId={company.id} />
            </Section>
          </>
        ) : (
          <>
            <EmptyState
              icon={AlertIcon}
              align="start"
              className="px-0"
              title="Financials are temporarily unavailable"
              description="The statements couldn't be loaded from the data provider. The filings themselves are below, and the tables will return once the nightly sync succeeds."
            />
            <Section id="documents" title="Documents">
              <DocumentsSection docs={docs} companyId={company.id} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-14 border-t border-line-subtle py-6 first:border-0">
      {title && <h2 className="mb-3 text-title font-medium text-ink">{title}</h2>}
      {children}
    </section>
  );
}

function Offline() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={AlertIcon}
          title="Couldn't reach Sensybull"
          description="The page itself is fine — the API didn't answer. Try again in a moment."
          action={
            <Link href="/company">
              <Button variant="outline">Back to search</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
