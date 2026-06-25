"use client";

import type { CompanyThesis, ThesisRevision } from "@/types/events";
import { formatCatalystDate } from "@/lib/utils";

interface CompanyThesisPanelProps {
  companyName: string;
  thesis: CompanyThesis | null;
  loading: boolean;
  onClose: () => void;
}

/**
 * Slide-over panel showing the company's current investment thesis plus the
 * revision timeline — the story built up over every material filing. Unbiased
 * (bull and bear), informational only.
 */
export function CompanyThesisPanel({
  companyName,
  thesis,
  loading,
  onClose,
}: CompanyThesisPanelProps) {
  const current = thesis?.current ?? null;
  const history = (thesis?.revisions ?? []).filter(
    (r) => r.id !== current?.id
  );

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white dark:bg-[#0a0a12]">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-200 dark:border-white/[0.06] shrink-0">
        <div className="min-w-0 flex-1">
          <p className="text-slate-900 dark:text-white/90 text-sm font-semibold truncate">
            Investment thesis
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs truncate">
            {companyName}
            {current && (
              <>
                {" · "}
                <span className="tabular-nums">v{current.version}</span>
                {current.as_of && <> · as of {current.as_of.slice(0, 10)}</>}
              </>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          aria-label="Close thesis"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loading && !thesis ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 dark:bg-[#12121e] rounded" />
            ))}
          </div>
        ) : !current ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-xs">
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
                No thesis yet
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
                The thesis is built from material SEC filings. As soon as {companyName}{" "}
                files something significant, an unbiased thesis is generated and
                evolves with every update.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Current narrative */}
            <section>
              <p className="text-[14px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {current.narrative}
              </p>
            </section>

            {/* Bull / bear / uncertainties */}
            <PointBlock label="Bull case" color="emerald" points={current.points?.bull} />
            <PointBlock label="Bear case" color="rose" points={current.points?.bear} />
            <PointBlock label="Key uncertainties" color="amber" points={current.points?.uncertainties} />

            {/* Timeline */}
            {history.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                  How the thesis evolved
                </p>
                <ol className="space-y-3 border-l border-slate-200 dark:border-white/[0.08] pl-4">
                  <TimelineItem revision={current} highlighted />
                  {history.map((r) => (
                    <TimelineItem key={r.id} revision={r} />
                  ))}
                </ol>
              </section>
            )}

            <p className="text-[10px] text-slate-400/80 dark:text-slate-600 pt-1">
              Unbiased, automatically-generated analysis from public filings —
              not investment advice.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PointBlock({
  label,
  color,
  points,
}: {
  label: string;
  color: "emerald" | "rose" | "amber";
  points?: string[];
}) {
  if (!points || points.length === 0) return null;
  const tone =
    color === "emerald"
      ? "text-emerald-400"
      : color === "rose"
      ? "text-rose-400"
      : "text-amber-400";
  return (
    <section>
      <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${tone}`}>
        {label}
      </p>
      <ul className="space-y-1">
        {points.map((p, i) => (
          <li key={i} className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug flex gap-2">
            <span className={`${tone} shrink-0`}>•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TimelineItem({
  revision,
  highlighted,
}: {
  revision: ThesisRevision;
  highlighted?: boolean;
}) {
  const when = revision.as_of || revision.created_at;
  return (
    <li className="relative">
      <span
        className={`absolute -left-[1.3rem] top-1 w-2 h-2 rounded-full ${
          highlighted ? "bg-violet-400" : "bg-slate-300 dark:bg-slate-600"
        }`}
      />
      <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
        v{revision.version}
        {when && <> · {formatCatalystDate(when.slice(0, 10))}</>}
      </p>
      <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
        {revision.change_summary || "Thesis updated."}
      </p>
    </li>
  );
}
