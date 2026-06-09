import type { Catalyst } from "@/types/events";
import { formatCatalystDate } from "@/lib/utils";

export function CatalystsTable({ catalysts }: { catalysts: Catalyst[] }) {
  if (catalysts.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-slate-700/50">
      <p className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">
        Catalysts
      </p>
      <div className="space-y-0.5">
        {catalysts.map((cat, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="text-slate-500 font-mono w-16 shrink-0">
              {formatCatalystDate(cat.date)}
            </span>
            <span className="text-slate-300">{cat.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
