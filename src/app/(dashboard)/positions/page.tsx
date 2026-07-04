"use client";

import { useMemo } from "react";
import { usePositions } from "@/hooks/use-positions";
import { AddPosition } from "@/components/positions/add-position";
import { PositionCard } from "@/components/positions/position-card";

/**
 * Positions — the holdings a user tracks and the thesis behind each. Filings
 * for a held company are judged against its thesis by the API; positions
 * whose thesis is threatened or broken surface at the top.
 */
export default function PositionsPage() {
  const { positions, loading, open, update, remove } = usePositions();

  const heldCompanyIds = useMemo(
    () => new Set(positions.map((p) => p.company_id)),
    [positions]
  );

  // Thesis-at-risk floats up: broken first, then watch, then intact — each
  // group keeping recency order.
  const sorted = useMemo(() => {
    const rank = { broken: 0, watch: 1, intact: 2 } as const;
    return [...positions].sort(
      (a, b) => rank[a.thesis_status] - rank[b.thesis_status]
    );
  }, [positions]);

  const atRisk = positions.filter((p) => p.thesis_status !== "intact").length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-slate-900 dark:text-white/90 font-medium text-base">
          Positions
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">
          Track what you hold and why. Every filing for a held company is judged
          against your thesis — you hear about it when the reason you bought
          changes.
          {atRisk > 0 && (
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              {" "}
              {atRisk} need{atRisk === 1 ? "s" : ""} review.
            </span>
          )}
        </p>

        <div className="mb-5">
          <AddPosition onOpen={open} heldCompanyIds={heldCompanyIds} />
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-slate-100 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        ) : positions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
            No positions yet. Search for a company above and write down why you
            hold it — that thesis is what filings get measured against.
          </p>
        ) : (
          <div className="space-y-2.5">
            {sorted.map((p) => (
              <PositionCard
                key={p.id}
                position={p}
                onUpdate={update}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
