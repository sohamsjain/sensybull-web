"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { FilingEvent } from "@/types/events";
import type { PaginatedEvents } from "@/types/api";
import type { Significance } from "@/config/constants";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlists } from "@/hooks/use-watchlists";
import { timeAgo, formatCatalystDate } from "@/lib/utils";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { SignificanceBadge } from "@/components/feed/significance-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
    ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}&type=8-K&dateb=&owner=include&count=40`
    : null;

  return (
    <Sheet open={!!company} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-white dark:bg-[#0f1116] border-slate-200 dark:border-white/[0.06] p-0 gap-0 overflow-y-auto"
      >
        {company && (
          <>
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <ChatAvatar ticker={company.ticker} name={company.name} />
                <div className="min-w-0">
                  <SheetTitle className="text-slate-900 dark:text-white text-base font-semibold leading-tight truncate">
                    {company.name}
                  </SheetTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {company.ticker && (
                      <span className="font-mono font-semibold">
                        {company.ticker}
                      </span>
                    )}
                    {company.cik && (
                      <span>
                        {company.ticker && " · "}CIK {company.cik}
                      </span>
                    )}
                    {edgarUrl && (
                      <>
                        {" · "}
                        <a
                          href={edgarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
                        >
                          EDGAR
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/chats?c=${company.id}`} onClick={onClose}>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Open chat
                    </Button>
                  </Link>
                  {isWatchlisted ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
                      In watchlist ✓
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={adding}
                      onClick={handleWatch}
                      className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                    >
                      {adding ? "Adding..." : "+ Watch"}
                    </Button>
                  )}
                </div>
              )}
            </SheetHeader>

            <div className="px-5 py-4 space-y-5">
              {/* Upcoming catalysts */}
              {upcoming.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    <span className="w-1 h-3.5 rounded-full bg-amber-400/60" />
                    Upcoming catalysts
                  </h3>
                  <ul className="space-y-1.5">
                    {upcoming.map((c, i) => (
                      <li key={i} className="text-[13px] leading-snug">
                        <span className="font-mono tabular-nums text-[11px] text-amber-600 dark:text-amber-400 mr-2">
                          {formatCatalystDate(c.date)}
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {c.event}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Filing history */}
              <section>
                <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  <span className="w-1 h-3.5 rounded-full bg-indigo-400/60" />
                  Filing history
                </h3>
                {historyState === "loading" ? (
                  <div className="space-y-2 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 rounded-lg bg-slate-100 dark:bg-white/[0.04]"
                      />
                    ))}
                  </div>
                ) : historyState === "gated" ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {user
                      ? "Decoded filing history unlocks for watchlisted companies — add it above, or browse the raw filings on EDGAR."
                      : "Sign in and add this company to a watchlist to see its decoded filing history."}
                  </p>
                ) : events.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No filings decoded yet — new ones land within minutes of
                    hitting EDGAR.
                  </p>
                ) : (
                  <ol className="space-y-1">
                    {events.map((e) => (
                      <li
                        key={e.id}
                        className="rounded-lg px-2.5 py-2 -mx-1 hover:bg-slate-100/70 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <SignificanceBadge
                            level={
                              (e.briefing?.significance as Significance) ||
                              "Medium"
                            }
                          />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                            {timeAgo(e.received_at || e.filing_date)}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-snug">
                          {e.briefing?.headline ||
                            `Filed an ${e.signal_type}`}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
