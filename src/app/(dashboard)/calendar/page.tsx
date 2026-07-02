"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api-client";

interface UpcomingCatalyst {
  id: string;
  filing_event_id: string;
  event: string;
  date: string | null;
  ticker: string | null;
  company_name: string | null;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - startOfToday.getTime()) / 86400000);
}

function untilLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** Agenda of every dated catalyst ahead, grouped by month. */
export default function CalendarPage() {
  const [catalysts, setCatalysts] = useState<UpcomingCatalyst[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ catalysts: UpcomingCatalyst[] }>("/events/catalysts?limit=200")
      .then((data) => {
        if (!cancelled) setCatalysts(data.catalysts || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const byMonth = new Map<string, UpcomingCatalyst[]>();
    for (const c of catalysts) {
      if (!c.date) continue;
      const key = monthLabel(c.date);
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(c);
    }
    return [...byMonth.entries()];
  }, [catalysts]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1 h-4 rounded-full bg-amber-400/60" />
          <h1 className="text-slate-900 dark:text-white/90 text-base font-semibold">
            Catalyst Calendar
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Every dated deadline, closing, and decision announced in tracked
          filings — nearest first.
        </p>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No dated catalysts on the calendar yet. They land here as filings
            announce deadlines, closings, and decision dates.
          </p>
        ) : (
          groups.map(([month, items]) => (
            <section key={month} className="mb-7">
              <h2 className="sticky top-0 z-10 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/95 dark:bg-[#0b0d12]/95 backdrop-blur">
                {month}
              </h2>
              <ol className="mt-1 space-y-1">
                {items.map((c) => {
                  const days = daysUntil(c.date!);
                  const near = days <= 7;
                  const day = new Date(c.date! + "T00:00:00");
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/[0.05]"
                    >
                      <div className="w-10 shrink-0 text-center">
                        <p className="text-[10.5px] uppercase text-slate-400 dark:text-slate-500 leading-none">
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p className="text-lg font-semibold tabular-nums text-slate-800 dark:text-slate-100 leading-tight">
                          {day.getDate()}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          {c.ticker && (
                            <span className="font-mono font-semibold text-[12px] text-slate-700 dark:text-slate-200">
                              {c.ticker}
                            </span>
                          )}
                          <span
                            className={`text-[11px] tabular-nums ${
                              near
                                ? "text-amber-600 dark:text-amber-400 font-semibold"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {untilLabel(days)}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug truncate">
                          {c.event}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
