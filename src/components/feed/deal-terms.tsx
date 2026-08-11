import { dealTermEntries, isFinancialValue } from "@/lib/deal-terms";

export function DealTerms({ terms }: { terms: Record<string, string> }) {
  const entries = dealTermEntries(terms);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg bg-slate-100/60 dark:bg-[#0b0d12]/40 ring-1 ring-slate-300/40 dark:ring-white/[0.06] p-3">
      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mb-2.5">
        Deal Terms
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {entries.map(({ key, label, value }) => (
          <div key={key} className="min-w-0">
            <p className="text-[10.5px] text-slate-500 leading-none mb-0.5 truncate">
              {label}
            </p>
            <p
              className={`text-[13px] leading-snug tabular-nums text-slate-900 dark:text-slate-100 ${
                isFinancialValue(value) ? "font-semibold" : "font-medium"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
