"use client";

import { useMovers } from "@/hooks/use-movers";
import { MoverList } from "@/components/movers/movers-list";

/**
 * Today's biggest price moves among companies that filed with the SEC in
 * the last few days — each move paired with the filing that may explain it.
 * Click any row to open the company and its filing history.
 */
export default function MoversPage() {
  const { movers, loading } = useMovers(25);

  const hasData =
    !!movers && (movers.gainers.length > 0 || movers.losers.length > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-slate-900 dark:text-white/90 font-medium text-base">
          Movers on news
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-6">
          Today&apos;s biggest price moves among companies with a recent SEC
          filing. Click a company to see what happened.
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-8 animate-pulse">
            {[0, 1].map((col) => (
              <div key={col} className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-slate-100 dark:bg-white/[0.04]"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : !hasData ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
            No notable moves among recent filers yet. Check back after the
            market has been open for a while.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-8">
            <MoverList title="Gainers" movers={movers.gainers} />
            <MoverList title="Losers" movers={movers.losers} />
          </div>
        )}
      </div>
    </div>
  );
}
