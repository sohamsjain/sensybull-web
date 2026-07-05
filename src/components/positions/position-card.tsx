"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  CatalystsResponse,
  Position,
  ThesisAssessment,
  ThesisImpact,
  ThesisStatus,
} from "@/types/api";
import { api } from "@/lib/api-client";
import { CompanyAvatar } from "@/components/watchlist/company-avatar";
import { ThesisBadge, ImpactLabel } from "./thesis-badge";
import { AnalystPanel } from "./analyst-panel";
import {
  ThesisEditor,
  thesisFromPosition,
  thesisPayload,
  type ThesisEditorValue,
} from "./thesis-editor";
import {
  usePositionAssessments,
  usePositionVersions,
} from "@/hooks/use-positions";
import type { OpenPositionInput } from "@/hooks/use-positions";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtConfidence(c: number | null): string | null {
  if (c === null || c === undefined) return null;
  return `${Math.round(c * 100)}% confident`;
}

/** Small dot showing an assumption's latest verdict, next to its text. */
function AssumptionDot({ impact }: { impact: ThesisImpact | null }) {
  const color =
    impact === "breaks"
      ? "bg-red-500"
      : impact === "threatens"
        ? "bg-amber-500"
        : impact === "supports"
          ? "bg-emerald-500"
          : "bg-slate-300 dark:bg-slate-600";
  return <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />;
}

/** One assessment row: verdict, rationale, evidence trail. */
function AssessmentRow({
  assessment,
  assumptions,
}: {
  assessment: ThesisAssessment;
  assumptions: string[];
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const a = assessment;
  const confidence = fmtConfidence(a.confidence);
  const hasEvidence = a.citations.length > 0 || a.assumption_verdicts.length > 0;

  return (
    <div className="flex items-start gap-2">
      <span className="text-[11px] text-slate-400 dark:text-slate-500 w-10 shrink-0 pt-px">
        {fmtDate(a.created_at)}
      </span>
      <span className="shrink-0 pt-px">
        <ImpactLabel impact={a.impact} />
      </span>
      <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <span>{a.rationale}</span>
        <span className="text-slate-400 dark:text-slate-500">
          {confidence && <> · {confidence}</>}
          {a.stage === "deep" && <> · deep read</>}
          {a.retroactive && <> · backtest</>}
        </span>
        {hasEvidence && (
          <>
            {" "}
            <button
              onClick={() => setShowEvidence((v) => !v)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
            >
              {showEvidence ? "Hide evidence" : "Evidence"}
            </button>
          </>
        )}
        {showEvidence && (
          <div className="mt-1.5 space-y-1.5">
            {a.assumption_verdicts.map((v) => (
              <p key={v.index} className="text-[11px] leading-relaxed">
                <ImpactLabel impact={v.impact} />{" "}
                <span className="text-slate-500 dark:text-slate-400">
                  {assumptions[v.index - 1] ?? `Assumption ${v.index}`}
                  {v.rationale ? ` — ${v.rationale}` : ""}
                </span>
              </p>
            ))}
            {a.citations.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-slate-200 dark:border-white/[0.1] pl-2 text-[11px] italic text-slate-500 dark:text-slate-400"
              >
                “{quote}”
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type Panel = "history" | "versions" | "analyst" | null;

export function PositionCard({
  position,
  onUpdate,
  onRemove,
}: {
  position: Position;
  onUpdate: (
    id: string,
    patch: Partial<OpenPositionInput> & { thesis_status?: ThesisStatus }
  ) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ThesisEditorValue>(() =>
    thesisFromPosition(position)
  );
  const [busy, setBusy] = useState(false);
  const [nextCatalyst, setNextCatalyst] = useState<{
    date: string;
    event: string;
  } | null>(null);

  // Assessments load with the card: the latest deep verdict annotates each
  // assumption inline, not just the history panel.
  const { assessments, loading } = usePositionAssessments(position.id);
  const { versions, loading: versionsLoading } = usePositionVersions(
    panel === "versions" ? position.id : null
  );

  const c = position.company;
  const s = position.thesis_structured;
  const needsReview = position.thesis_status !== "intact";

  // Latest per-assumption verdicts, only if they judged the current thesis.
  const verdictByIndex = useMemo(() => {
    const map = new Map<number, ThesisImpact>();
    const latest = assessments.find(
      (a) =>
        a.assumption_verdicts.length > 0 &&
        a.thesis_version === position.thesis_version
    );
    for (const v of latest?.assumption_verdicts ?? []) map.set(v.index, v.impact);
    return map;
  }, [assessments, position.thesis_version]);

  // The next catalyst that will test this thesis.
  useEffect(() => {
    let cancelled = false;
    api<CatalystsResponse>(
      `/events/catalysts?company_id=${position.company_id}&limit=1`
    )
      .then((d) => {
        const cat = d.catalysts?.[0];
        if (!cancelled && cat?.date)
          setNextCatalyst({ date: cat.date, event: cat.event });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [position.company_id]);

  const saveThesis = async () => {
    setBusy(true);
    try {
      await onUpdate(position.id, thesisPayload(draft));
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

  const togglePanel = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  const panelButton = (p: Panel, label: string) => (
    <button
      onClick={() => togglePanel(p)}
      className={
        panel === p
          ? "text-slate-900 dark:text-white font-medium"
          : "hover:text-slate-700 dark:hover:text-slate-300"
      }
    >
      {label}
    </button>
  );

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
            {position.thesis_version > 1 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                v{position.thesis_version}
              </span>
            )}
          </div>

          {/* Thesis */}
          {editing ? (
            <div className="mt-2 space-y-2">
              <ThesisEditor
                value={draft}
                onChange={setDraft}
                companyId={position.company_id}
                direction={position.direction}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraft(thesisFromPosition(position));
                  }}
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
          ) : s ? (
            <div
              className="mt-1.5 cursor-text"
              onClick={() => {
                setDraft(thesisFromPosition(position));
                setEditing(true);
              }}
            >
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {s.core_claim}
              </p>
              {s.assumptions.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {s.assumptions.map((assumption, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AssumptionDot impact={verdictByIndex.get(i + 1) ?? null} />
                      <span className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {assumption}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {s.kill_criteria.length > 0 && (
                <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  Would exit if: {s.kill_criteria.join("; ")}
                  {s.horizon ? ` · ${s.horizon}` : ""}
                </p>
              )}
            </div>
          ) : (
            <p
              className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed cursor-text"
              onClick={() => {
                setDraft(thesisFromPosition(position));
                setEditing(true);
              }}
            >
              {position.thesis || (
                <span className="text-slate-400 dark:text-slate-500 italic">
                  No thesis yet — add one so filings can be judged against it.
                </span>
              )}
            </p>
          )}

          {/* Next catalyst that will test the thesis */}
          {nextCatalyst && !editing && (
            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Next test:{" "}
              <span className="text-slate-600 dark:text-slate-300">
                {fmtDate(nextCatalyst.date)} — {nextCatalyst.event}
              </span>
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            {position.shares && <span>{position.shares} sh</span>}
            {position.cost_basis && <span>@ {position.cost_basis}</span>}
            {panelButton("history", panel === "history" ? "Hide history" : "History")}
            {panelButton("versions", "Versions")}
            {panelButton("analyst", "Analyst")}
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
          {panel === "history" && (
            <div className="mt-3 border-t border-slate-100 dark:border-white/[0.05] pt-2 space-y-2">
              {loading ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">Loading…</p>
              ) : assessments.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No filings have been assessed against this thesis yet. New
                  theses are backtested against recent filings within a few
                  minutes.
                </p>
              ) : (
                assessments.map((a) => (
                  <AssessmentRow
                    key={a.id}
                    assessment={a}
                    assumptions={s?.assumptions ?? []}
                  />
                ))
              )}
            </div>
          )}

          {/* Thesis revision history */}
          {panel === "versions" && (
            <div className="mt-3 border-t border-slate-100 dark:border-white/[0.05] pt-2 space-y-2">
              {versionsLoading ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">Loading…</p>
              ) : versions.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No revisions recorded yet — edits to the thesis are
                  snapshotted here.
                </p>
              ) : (
                versions.map((v) => (
                  <div key={v.id} className="flex items-start gap-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 w-10 shrink-0 pt-px font-mono">
                      v{v.version}
                    </span>
                    <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span>
                        {v.thesis_structured?.core_claim ?? v.thesis ?? "—"}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">
                        {" "}
                        · {fmtDate(v.created_at)}
                        {v.source === "assist" && " · AI-drafted"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Per-position analyst */}
          {panel === "analyst" && <AnalystPanel positionId={position.id} />}
        </div>
      </div>
    </div>
  );
}
