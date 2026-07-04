"use client";

import type { Mover } from "@/types/api";
import { useDashboard } from "@/app/(dashboard)/layout";

export function MoverRow({ mover }: { mover: Mover }) {
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

export function MoverList({ title, movers }: { title: string; movers: Mover[] }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
        {title}
      </p>
      {movers.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
          Nothing notable today.
        </p>
      ) : (
        <ol className="space-y-0.5">
          {movers.map((m) => (
            <li key={m.ticker}>
              <MoverRow mover={m} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
