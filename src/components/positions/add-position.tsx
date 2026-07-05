"use client";

import { useState, useEffect } from "react";
import type { CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { CompanyAvatar } from "@/components/watchlist/company-avatar";
import type { OpenPositionInput } from "@/hooks/use-positions";

/**
 * Two-step "open a position" flow: pick a company (SEC typeahead), then
 * write the thesis. The thesis is the whole point — the form leads with it
 * and treats size/basis as optional.
 */
export function AddPosition({
  onOpen,
  heldCompanyIds,
}: {
  onOpen: (input: OpenPositionInput) => Promise<unknown>;
  heldCompanyIds: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [picked, setPicked] = useState<CompanySearchResult | null>(null);

  const [direction, setDirection] = useState<"long" | "short">("long");
  const [thesis, setThesis] = useState("");
  const [shares, setShares] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (picked) return;
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        return;
      }
      try {
        const data = await api<CompanySearchResponse>(
          `/companies/search?q=${encodeURIComponent(q)}&limit=8`
        );
        setResults(data.results || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [query, picked]);

  const reset = () => {
    setQuery("");
    setResults([]);
    setPicked(null);
    setDirection("long");
    setThesis("");
    setShares("");
    setCostBasis("");
  };

  const submit = async () => {
    if (!picked) return;
    setSaving(true);
    try {
      await onOpen({
        company_id: picked.id,
        direction,
        thesis: thesis.trim() || null,
        shares: shares.trim() || null,
        cost_basis: costBasis.trim() || null,
      });
      reset();
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-indigo-400/60";

  // Step 1 — company picker
  if (!picked) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#12141b] p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Add a position — search by ticker or company"
          className={inputClass}
          autoComplete="off"
        />
        {results.length > 0 && (
          <ul className="mt-2 space-y-0.5 max-h-64 overflow-y-auto">
            {results.map((r) => {
              const held = heldCompanyIds.has(r.id);
              return (
                <li key={r.id}>
                  <button
                    disabled={held}
                    onClick={() => {
                      setPicked(r);
                      setResults([]);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-[#1a1d25] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CompanyAvatar ticker={r.ticker} name={r.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-sm text-slate-900 dark:text-white/90 truncate">
                        {r.name}
                      </span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500 font-mono">
                        {r.ticker}
                        {held ? " · already held" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Step 2 — thesis capture
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#12141b] p-3 space-y-3">
      <div className="flex items-center gap-2.5">
        <CompanyAvatar ticker={picked.ticker} name={picked.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-sm text-slate-900 dark:text-white/90 truncate">
            {picked.name}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {picked.ticker}
          </div>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-white/[0.08]">
          {(["long", "short"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                direction === d
                  ? "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={thesis}
        onChange={(e) => setThesis(e.target.value)}
        placeholder="Why do you hold this? Your thesis — the claim filings will be judged against. e.g. 'Services margin expansion outweighs hardware slowdown.'"
        rows={3}
        className={`${inputClass} resize-none`}
        autoFocus
      />

      <div className="flex gap-2">
        <input
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="Shares (optional)"
          inputMode="decimal"
          className={inputClass}
        />
        <input
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          placeholder="Cost basis (optional)"
          inputMode="decimal"
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Opening…" : "Open position"}
        </button>
      </div>
    </div>
  );
}
