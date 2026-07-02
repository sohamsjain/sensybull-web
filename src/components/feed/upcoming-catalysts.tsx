"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { formatCatalystDate } from "@/lib/utils";

interface UpcomingCatalyst {
  id: string;
  filing_event_id: string;
  event: string;
  date: string | null;
  ticker: string | null;
  company_name: string | null;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - startOfToday.getTime()) / 86400000);
}

function untilLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

/** Right-rail agenda of upcoming catalysts across all tracked events. */
export function UpcomingCatalysts() {
  const [catalysts, setCatalysts] = useState<UpcomingCatalyst[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ catalysts: UpcomingCatalyst[] }>("/events/catalysts?limit=40")
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

  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-1 h-3.5 rounded-full bg-amber-400/60" />
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Upcoming Catalysts
        </h2>
        <a
          href="/calendar"
          className="ml-auto text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
        >
          View all →
        </a>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-100 dark:bg-white/[0.04]" />
          ))}
        </div>
      ) : catalysts.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          No dated catalysts on the calendar yet. They land here as filings
          announce deadlines, closings, and decision dates.
        </p>
      ) : (
        <ol className="space-y-1">
          {catalysts.map((c) => {
            if (!c.date) return null;
            const days = daysUntil(c.date);
            const near = days <= 7;
            return (
              <li
                key={c.id}
                className="rounded-lg px-2.5 py-2 -mx-1 hover:bg-slate-100/70 dark:hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {formatCatalystDate(c.date)}
                    <span
                      className={`ml-1.5 ${
                        near
                          ? "text-amber-600 dark:text-amber-400 font-semibold"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {untilLabel(days)}
                    </span>
                  </span>
                  {c.ticker && (
                    <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                      {c.ticker}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  {c.event}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
