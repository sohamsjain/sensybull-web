function isFinancialValue(value: string): boolean {
  return /^\$|%/.test(value.trim());
}

export function DealTerms({ terms }: { terms: Record<string, string> }) {
  const entries = Object.entries(terms);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg bg-slate-100/60 dark:bg-[#0a0a12]/40 ring-1 ring-slate-300/40 dark:ring-white/[0.06] p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-1 h-3.5 rounded-full bg-violet-400/60" />
        <span className="text-[11px] font-medium text-slate-400 tracking-wide">
          Deal Terms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <p className="text-[10px] text-slate-500 leading-none mb-0.5 truncate">
              {key.replace(/_/g, " ")}
            </p>
            <p
              className={`text-[13px] font-medium leading-snug ${
                isFinancialValue(value)
                  ? "text-emerald-300"
                  : "text-slate-100"
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
