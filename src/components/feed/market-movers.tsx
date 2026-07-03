"use client";

import type { Mover } from "@/types/api";
import { useMovers } from "@/hooks/use-movers";
import { useDashboard } from "@/app/(dashboard)/layout";

function MoverRow({ mover }: { mover: Mover }) {
  const { openCompany } = useDashboard();
  const positive = mover.change_pct >= 0;

  const content = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-100">
          {mover.ticker}
        </span>
        <span
          className={`text-[12px] font-mono tabular-nums font-semibold shrink-0 ${
            positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {positive ? "+" : ""}
          {mover.change_pct.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-0.5 line-clamp-2">
        {mover.event?.headline || "Recent SEC filing"}
      </p>
    </>
  );

  if (mover.company_id) {
    return (
      <button
        onClick={() =>
          openCompany({
            id: mover.company_id!,
            name: mover.company_name || mover.ticker,
            ticker: mover.ticker,
            cik: null,
          })
        }
        className="block w-full text-left rounded-lg px-2.5 py-2 -mx-1 hover:bg-slate-100/70 dark:hover:bg-white/[0.03] transition-colors"
        title={`View ${mover.company_name || mover.ticker}`}
      >
        {content}
      </button>
    );
  }
  return <div className="rounded-lg px-2.5 py-2 -mx-1">{content}</div>;
}

function MoverList({ title, movers }: { title: string; movers: Mover[] }) {
  if (movers.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
        {title}
      </p>
      <ol className="space-y-0.5">
        {movers.map((m) => (
          <li key={m.ticker}>
            <MoverRow mover={m} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Right-rail panel: today's biggest movers among companies with a filing
 * event in the last 7 days, each with its filing headline as the reason.
 */
export function MarketMovers() {
  const { movers, loading } = useMovers(5);

  const hasData =
    !!movers && (movers.gainers.length > 0 || movers.losers.length > 0);

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1 h-3.5 rounded-full bg-emerald-400/60" />
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Movers on News
        </h2>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-slate-100 dark:bg-white/[0.04]"
            />
          ))}
        </div>
      ) : !hasData ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          No notable moves among recent filers yet.
        </p>
      ) : (
        <div className="space-y-3">
          <MoverList title="Gainers" movers={movers.gainers} />
          <MoverList title="Losers" movers={movers.losers} />
        </div>
      )}
    </div>
  );
}
