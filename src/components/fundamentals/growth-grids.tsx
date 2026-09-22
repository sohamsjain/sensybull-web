import type { FundamentalsGrowth } from "@/types/fundamentals";
import { GROWTH_GRIDS } from "@/lib/fundamentals/rows";
import { formatGrowth } from "@/lib/fundamentals/format";

/**
 * Compounded sales and profit growth, stock price CAGR and return on
 * equity, each over 10 / 5 / 3 years and the latest window. Every one of
 * these is an annual figure, which is why they sit in their own section
 * rather than inside a statement that can flip to quarters.
 *
 * Server-rendered; nothing here is interactive.
 */
export function GrowthGrids({ growth }: { growth: FundamentalsGrowth }) {
  return (
    <div className="grid gap-x-8 gap-y-5 rounded-md border border-line-subtle bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      {GROWTH_GRIDS.map((grid) => {
        const values = growth[grid.key] ?? {};
        return (
          <table key={grid.key} className="w-full border-collapse text-meta">
            <caption className="mb-1 text-left text-meta font-semibold text-ink">
              {grid.title}
            </caption>
            <tbody>
              {grid.windows.map((w) => (
                <tr key={w.key} className="border-b border-line-subtle last:border-0">
                  <th scope="row" className="py-1 pr-2 text-left font-normal text-ink-muted">
                    {w.label}:
                  </th>
                  <td className="py-1 text-right tabular-nums text-ink">
                    {formatGrowth(values[w.key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </div>
  );
}
