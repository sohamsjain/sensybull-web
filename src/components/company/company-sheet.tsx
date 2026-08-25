"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { FilingEvent } from "@/types/events";
import type { Company, PaginatedEvents } from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlists } from "@/hooks/use-watchlists";
import { timeAgo, formatCatalystDate, formatMarketCap } from "@/lib/utils";
import { isImportant } from "@/lib/event-actions";
import { filedPhrase } from "@/lib/forms";
import { CompanyAvatar } from "@/components/watchlist/company-avatar";
import { PriceChart } from "@/components/company/price-chart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ImportantMarker } from "@/components/ui/badge";
import { CheckIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareDialog } from "@/components/share/share-dialog";

export interface CompanyRef {
  id: string;
  name: string;
  ticker: string | null;
  cik: string | null;
}

/** Slide-over company profile: identity, actions, catalysts, filing history. */
export function CompanySheet({
  company,
  onClose,
}: {
  company: CompanyRef | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { watchlists, create, addCompany } = useWatchlists();
  const [events, setEvents] = useState<FilingEvent[]>([]);
  const [historyState, setHistoryState] = useState<
    "loading" | "ready" | "gated"
  >("loading");
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Company | null>(null);
  const [sharing, setSharing] = useState(false);

  const isWatchlisted = useMemo(
    () =>
      !!company &&
      watchlists.some((wl) =>
        wl.companies?.some((c) => c.id === company.id)
      ),
    [watchlists, company]
  );

  // Reset when a different company opens (adjust-during-render pattern)
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (company && loadedFor !== company.id) {
    setLoadedFor(company.id);
    setEvents([]);
    setHistoryState("loading");
    setDetail(null);
  }

  useEffect(() => {
    if (!company) return;
    let cancelled = false;
    api<PaginatedEvents>(`/events/company/${company.id}?page=1&per_page=20`)
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events || []);
        setHistoryState("ready");
      })
      .catch(() => {
        // 403: history is scoped to watchlisted companies
        if (!cancelled) setHistoryState("gated");
      });
    return () => {
      cancelled = true;
    };
  }, [company, isWatchlisted]);

  // Market cap / last price live on the company record (daily sync)
  useEffect(() => {
    if (!company || !user) return;
    let cancelled = false;
    api<{ company: Company }>(`/companies/${company.id}`)
      .then((data) => {
        if (!cancelled) setDetail(data.company);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [company, user]);

  const handleWatch = useCallback(async () => {
    if (!company) return;
    setAdding(true);
    try {
      let target = watchlists[0];
      if (!target) target = await create("My Watchlist");
      if (target?.id) await addCompany(target.id, company.id);
    } catch {}
    setAdding(false);
  }, [company, watchlists, create, addCompany]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen = new Set<string>();
    const list: { event: string; date: string }[] = [];
    for (const e of events) {
      for (const c of e.catalysts || []) {
        if (!c.date || c.date < today) continue;
        const key = `${c.date}:${c.event}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ event: c.event, date: c.date });
      }
    }
    return list.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  }, [events]);

  const edgarUrl = company?.cik
    ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}&type=&dateb=&owner=include&count=40`
    : null;

  return (
    <Sheet open={!!company} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-l border-line bg-canvas p-0 sm:max-w-md"
      >
        {company && (
          <>
            <SheetHeader className="border-b border-line-subtle px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <CompanyAvatar ticker={company.ticker} name={company.name} />
                <div className="min-w-0">
                  <SheetTitle className="truncate text-title leading-tight font-medium text-ink">
                    {company.name}
                  </SheetTitle>
                  <p className="mt-0.5 text-meta text-ink-faint">
                    {company.ticker && (
                      <span className="font-mono font-semibold text-ink-muted">
                        {company.ticker}
                      </span>
                    )}
                    {company.cik && (
                      <span>
                        {company.ticker && " · "}CIK {company.cik}
                      </span>
                    )}
                    {formatMarketCap(detail?.market_cap) && (
                      <span title="Market cap (EDGAR shares × last price)">
                        {" · "}
                        {formatMarketCap(detail?.market_cap)}
                      </span>
                    )}
                    {edgarUrl && (
                      <>
                        {" · "}
                        <a
                          href={edgarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-ink underline-offset-2 hover:underline"
                        >
                          EDGAR
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                {user && (
                  <>
                    <Link href={`/watchlist?c=${company.id}`} onClick={onClose}>
                      <Button size="sm">View filings</Button>
                    </Link>
                    {isWatchlisted ? (
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-meta text-ink-faint">
                        <CheckIcon className="size-3.5" />
                        In watchlist
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={adding}
                        onClick={handleWatch}
                      >
                        {adding ? "Adding…" : "Track"}
                      </Button>
                    )}
                  </>
                )}
                {company.ticker && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSharing(true)}
                  >
                    Share
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 px-5 py-4">
              {/* Price chart with filing markers */}
              {user && company.ticker && (
                <Section title="Price">
                  <PriceChart
                    companyId={company.id}
                    ticker={company.ticker}
                    events={events}
                  />
                </Section>
              )}

              {/* Upcoming catalysts */}
              {upcoming.length > 0 && (
                <Section title="Upcoming catalysts">
                  <table className="w-full border-collapse">
                    <tbody>
                      {upcoming.map((c, i) => (
                        <tr key={i} className="align-baseline">
                          <td className="w-24 py-0.5 pr-3 font-mono text-micro tabular-nums whitespace-nowrap text-ink">
                            {formatCatalystDate(c.date)}
                          </td>
                          <td className="py-0.5 text-label leading-snug text-ink-muted">
                            {c.event}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Filing history */}
              <Section title="Filing history">
                {historyState === "loading" ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : historyState === "gated" ? (
                  <p className="text-meta leading-relaxed text-ink-faint">
                    {user
                      ? "Decoded filing history unlocks for companies on your watchlist — track it above, or browse the raw filings on EDGAR."
                      : "Sign in and track this company to see its decoded filing history."}
                  </p>
                ) : events.length === 0 ? (
                  <p className="text-meta text-ink-faint">
                    No filings decoded yet — new ones land within minutes of
                    hitting EDGAR.
                  </p>
                ) : (
                  <ol className="-mx-2 divide-y divide-line-subtle">
                    {events.map((e) => (
                      <li
                        key={e.id}
                        className="px-2 py-2 transition-colors hover:bg-surface-hover"
                      >
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          {isImportant(e) ? <ImportantMarker /> : <span />}
                          <span className="shrink-0 text-micro tabular-nums text-ink-faint">
                            {timeAgo(e.received_at || e.filing_date)}
                          </span>
                        </div>
                        <p className="text-label leading-snug text-ink-muted">
                          {e.briefing?.headline ||
                            filedPhrase(e.signal_type).replace(/^\w/, (c) =>
                              c.toUpperCase()
                            )}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </Section>
            </div>
          </>
        )}
      </SheetContent>
      {sharing && company?.ticker && (
        <ShareDialog
          company={{ name: company.name, ticker: company.ticker }}
          onClose={() => setSharing(false)}
        />
      )}
    </Sheet>
  );
}
