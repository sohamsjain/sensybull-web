import { dealTermEntries, isFinancialValue } from "@/lib/deal-terms";

/**
 * The numbers of a deal, laid out as label-over-value pairs so figures line
 * up in columns and can be compared without reading prose. One of the few
 * places that earns a bordered panel: it is a single conceptual unit.
 */
export function DealTerms({ terms }: { terms: Record<string, string> }) {
  const entries = dealTermEntries(terms);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2.5 rounded-md border border-line bg-canvas-sunken p-3">
      <p className="eyebrow mb-2">Deal terms</p>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {entries.map(({ key, label, value }) => (
          <div key={key} className="min-w-0">
            <dt className="truncate text-micro text-ink-faint">{label}</dt>
            <dd
              className={`text-label leading-snug tabular-nums text-ink ${
                isFinancialValue(value) ? "font-mono font-semibold" : "font-medium"
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
