"use client";

import { useState } from "react";
import type { ThesisStructured } from "@/types/api";
import { draftThesis } from "@/hooks/use-positions";

/**
 * Structured thesis editor, shared by AddPosition and PositionCard.
 *
 * Two modes. Free text: the investor dumps their raw reason for holding —
 * one click hands it to the drafting assistant, which returns a falsifiable
 * structure (core claim, assumptions, kill criteria, horizon). Structured:
 * each field is editable inline; assumptions are what incoming filings get
 * judged against, one verdict per assumption.
 */

export interface ThesisEditorValue {
  thesis: string;
  structured: ThesisStructured | null;
  source: "user" | "assist";
}

export function emptyThesis(): ThesisEditorValue {
  return { thesis: "", structured: null, source: "user" };
}

export function thesisFromPosition(p: {
  thesis: string | null;
  thesis_structured: ThesisStructured | null;
}): ThesisEditorValue {
  return {
    thesis: p.thesis ?? "",
    structured: p.thesis_structured,
    source: "user",
  };
}

/** The position-payload fields this editor's value translates to. */
export function thesisPayload(v: ThesisEditorValue): {
  thesis: string | null;
  thesis_structured: ThesisStructured | null;
  thesis_source: "user" | "assist";
} {
  if (v.structured) {
    // The API derives the free text from the structure, keeping both in sync.
    return { thesis: null, thesis_structured: v.structured, thesis_source: v.source };
  }
  return {
    thesis: v.thesis.trim() || null,
    thesis_structured: null,
    thesis_source: "user",
  };
}

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-indigo-400/60";
const smallInputClass =
  "flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-[13px] bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-indigo-400/60";
const labelClass =
  "text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium";

function ListEditor({
  label,
  hint,
  items,
  max,
  placeholder,
  onChange,
}: {
  label: string;
  hint?: string;
  items: string[];
  max: number;
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className={labelClass}>
        {label}
        {hint && (
          <span className="normal-case tracking-normal font-normal"> — {hint}</span>
        )}
      </p>
      <div className="mt-1 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={item}
              onChange={(e) =>
                onChange(items.map((x, j) => (j === i ? e.target.value : x)))
              }
              placeholder={placeholder}
              className={smallInputClass}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 text-sm px-1"
              aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => onChange([...items, ""])}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

export function ThesisEditor({
  value,
  onChange,
  companyId,
  direction = "long",
  autoFocus = false,
}: {
  value: ThesisEditorValue;
  onChange: (value: ThesisEditorValue) => void;
  companyId?: string | null;
  direction?: "long" | "short";
  autoFocus?: boolean;
}) {
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const structure = async () => {
    if (!value.thesis.trim()) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const draft = await draftThesis(value.thesis, companyId, direction);
      onChange({ ...value, structured: draft, source: "assist" });
    } catch (err) {
      // The API names the cause (e.g. "AI is not configured on this
      // server") — show it rather than a generic shrug.
      setDraftError(
        err instanceof Error && err.message
          ? err.message
          : "Drafting is unavailable right now"
      );
    } finally {
      setDrafting(false);
    }
  };

  // Any manual edit to the structure makes it the investor's own revision.
  const setStructured = (patch: Partial<ThesisStructured>) => {
    if (!value.structured) return;
    onChange({
      ...value,
      structured: { ...value.structured, ...patch },
      source: "user",
    });
  };

  if (!value.structured) {
    return (
      <div className="space-y-2">
        <textarea
          value={value.thesis}
          onChange={(e) => onChange({ ...value, thesis: e.target.value })}
          placeholder="Why do you hold this? Your thesis — the claim filings will be judged against. e.g. 'Services margin expansion outweighs hardware slowdown.'"
          rows={3}
          className={`${inputClass} resize-none`}
          autoFocus={autoFocus}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={structure}
            disabled={drafting || !value.thesis.trim()}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/20 hover:bg-indigo-500/15 dark:hover:bg-indigo-500/30 disabled:opacity-40 transition-colors"
          >
            {drafting ? "Structuring…" : "Structure with AI"}
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {draftError
              ? `${draftError} — your text still works as-is.`
              : "Breaks your notes into falsifiable assumptions the engine can judge one by one."}
          </span>
        </div>
      </div>
    );
  }

  const s = value.structured;
  return (
    <div className="space-y-3">
      <div>
        <p className={labelClass}>Core claim</p>
        <input
          value={s.core_claim}
          onChange={(e) => setStructured({ core_claim: e.target.value })}
          placeholder="The single claim this position stands or falls on"
          className={`${smallInputClass} w-full mt-1`}
          autoFocus={autoFocus}
        />
      </div>
      <ListEditor
        label="Assumptions"
        hint="what must hold; each gets its own verdict per filing"
        items={s.assumptions}
        max={5}
        placeholder="e.g. Services revenue grows >12% YoY"
        onChange={(assumptions) => setStructured({ assumptions })}
      />
      <ListEditor
        label="Kill criteria"
        hint="what would prove you wrong"
        items={s.kill_criteria}
        max={3}
        placeholder="e.g. Services growth below 5% for two quarters"
        onChange={(kill_criteria) => setStructured({ kill_criteria })}
      />
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className={labelClass}>Horizon</p>
          <input
            value={s.horizon ?? ""}
            onChange={(e) => setStructured({ horizon: e.target.value || null })}
            placeholder="e.g. 12 months (optional)"
            className={`${smallInputClass} w-full mt-1`}
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...value, structured: null, source: "user" })}
          className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 self-end pb-1.5"
        >
          Back to free text
        </button>
      </div>
    </div>
  );
}
