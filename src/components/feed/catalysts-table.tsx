import type { Catalyst } from "@/types/events";
import { formatCatalystDate } from "@/lib/utils";

/**
 * Dates the reader needs to diary. A two-column table rather than a
 * timeline drawing: dates align vertically, which is the whole point.
 */
export function CatalystsTable({ catalysts }: { catalysts: Catalyst[] }) {
  if (catalysts.length === 0) return null;

  return (
    <div className="mt-2.5 rounded-md border border-line bg-canvas-sunken p-3">
      <p className="eyebrow mb-2">Key dates</p>
      <table className="w-full border-collapse">
        <tbody>
          {catalysts.map((cat, i) => (
            <tr key={i} className="align-baseline">
              <td className="w-24 py-0.5 pr-3 font-mono text-micro tabular-nums whitespace-nowrap text-ink">
                {formatCatalystDate(cat.date)}
              </td>
              <td className="py-0.5 text-label leading-snug text-ink-muted">
                {cat.event}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
