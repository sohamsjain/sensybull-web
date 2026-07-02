import { formatDealValue } from "@/lib/utils";

// Canonical display order so the same deal renders identically everywhere,
// regardless of the key order the briefing JSON arrived in.
const KEY_PRIORITY = [
  "deal_value",
  "deal_type",
  "price_per_share",
  "consideration_type",
  "counterparty",
  "share_count",
  "deal_status",
];

function keyRank(key: string): number {
  const i = KEY_PRIORITY.indexOf(key);
  return i === -1 ? KEY_PRIORITY.length : i;
}

function labelFor(key: string): string {
  const s = key.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isFinancialValue(value: string): boolean {
  return /^\$|%/.test(value.trim());
}

export function DealTerms({ terms }: { terms: Record<string, string> }) {
  const entries = Object.entries(terms).sort(([a], [b]) => {
    const ra = keyRank(a);
    const rb = keyRank(b);
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg bg-slate-100/60 dark:bg-[#0b0d12]/40 ring-1 ring-slate-300/40 dark:ring-white/[0.06] p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-1 h-3.5 rounded-full bg-indigo-400/60" />
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Deal Terms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <p className="text-[10.5px] text-slate-500 leading-none mb-0.5 truncate">
              {labelFor(key)}
            </p>
            <p
              className={`text-[13px] leading-snug tabular-nums text-slate-900 dark:text-slate-100 ${
                isFinancialValue(value) ? "font-semibold" : "font-medium"
              }`}
            >
              {formatDealValue(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
