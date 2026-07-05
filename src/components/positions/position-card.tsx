"use client";

import { useState } from "react";
import type { Position } from "@/types/api";
import { CompanyAvatar } from "@/components/watchlist/company-avatar";
import { ThesisBadge, ImpactLabel } from "./thesis-badge";
import { usePositionAssessments } from "@/hooks/use-positions";
import type { OpenPositionInput } from "@/hooks/use-positions";
import type { ThesisStatus } from "@/types/api";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PositionCard({
  position,
  onUpdate,
  onRemove,
}: {
  position: Position;
  onUpdate: (id: string, patch: Partial<OpenPositionInput> & { thesis_status?: ThesisStatus }) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(position.thesis ?? "");
  const [busy, setBusy] = useState(false);
  const { assessments, loading } = usePositionAssessments(expanded ? position.id : null);

  const c = position.company;
  const needsReview = position.thesis_status !== "intact";

  const saveThesis = async () => {
    setBusy(true);
    try {
      await onUpdate(position.id, { thesis: draft.trim() || null });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const markReviewed = async () => {
    setBusy(true);
    try {
      await onUpdate(position.id, { thesis_status: "intact" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#12141b] p-3.5">
      <div className="flex items-start gap-3">
        <CompanyAvatar ticker={c.ticker} name={c.name} size="sm" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-900 dark:text-white/90 truncate">
              {c.name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              {c.ticker}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {position.direction}
            </span>
            <ThesisBadge status={position.thesis_status} />
          </div>

          {/* Thesis */}
          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-400/60 resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setEditing(false); setDraft(position.thesis ?? ""); }}
                  className="px-2.5 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={saveThesis}
                  disabled={busy}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p
              className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed cursor-text"
              onClick={() => setEditing(true)}
            >
              {position.thesis || (
                <span className="text-slate-400 dark:text-slate-500 italic">
                  No thesis yet — add one so filings can be judged against it.
                </span>
              )}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            {position.shares && <span>{position.shares} sh</span>}
            {position.cost_basis && <span>@ {position.cost_basis}</span>}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="hover:text-slate-700 dark:hover:text-slate-300"
            >
              {expanded ? "Hide history" : "Thesis history"}
            </button>
            {needsReview && (
              <button
                onClick={markReviewed}
                disabled={busy}
                className="text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
              >
                Mark reviewed
              </button>
            )}
            <button
              onClick={() => onRemove(position.id)}
              className="ml-auto text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
            >
              Close
            </button>
          </div>

          {/* Assessment history */}
          {expanded && (
            <div className="mt-3 border-t border-slate-100 dark:border-white/[0.05] pt-2 space-y-2">
              {loading ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">Loading…</p>
              ) : assessments.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No filings have been assessed against this thesis yet.
                </p>
              ) : (
                assessments.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 w-10 shrink-0 pt-px">
                      {fmtDate(a.created_at)}
                    </span>
                    <span className="shrink-0 pt-px">
                      <ImpactLabel impact={a.impact} />
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {a.rationale}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
