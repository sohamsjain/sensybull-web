import type { Catalyst } from "@/types/events";
import { formatCatalystDate } from "@/lib/utils";

export function CatalystsTable({ catalysts }: { catalysts: Catalyst[] }) {
  if (catalysts.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg bg-slate-100/60 dark:bg-slate-900/40 ring-1 ring-slate-300/40 dark:ring-slate-700/40 p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-1 h-3.5 rounded-full bg-amber-400/60" />
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Catalysts
        </span>
      </div>

      <div className="space-y-0">
        {catalysts.map((cat, i) => {
          const isLast = i === catalysts.length - 1;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center w-3 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-1 shrink-0" />
                {!isLast && (
                  <div className="w-px flex-1 bg-slate-300 dark:bg-slate-700/60" />
                )}
              </div>

              <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-2.5"}`}>
                <p className="text-[10px] text-slate-500 leading-none mb-0.5 font-mono tabular-nums">
                  {formatCatalystDate(cat.date)}
                </p>
                <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-snug">
                  {cat.event}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
