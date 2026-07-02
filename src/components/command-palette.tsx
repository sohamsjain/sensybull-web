"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import type { CompanySearchResult, CompanySearchResponse } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

/** ⌘K company jump + quick actions. Mounted once in the dashboard layout. */
export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state whenever the palette opens (adjust-during-render pattern)
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }

  // Focus after the dialog mounts
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open]);

  // Company typeahead (auth only — the endpoint requires a session)
  useEffect(() => {
    if (!open || !user) return;
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        return;
      }
      try {
        const data = await api<CompanySearchResponse>(
          `/companies/search?q=${encodeURIComponent(q)}&limit=6`
        );
        setResults(data.results || []);
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open, user]);

  const close = useCallback(() => setOpen(false), []);

  const actions = useMemo<PaletteAction[]>(() => {
    const nav: PaletteAction[] = [
      ...(user
        ? [
            {
              id: "chats",
              label: "Go to Chats",
              run: () => router.push("/chats"),
            },
          ]
        : []),
      { id: "feed", label: "Go to Feed", run: () => router.push("/feed") },
      ...(user
        ? [
            {
              id: "calendar",
              label: "Go to Calendar",
              run: () => router.push("/calendar"),
            },
            {
              id: "alerts",
              label: "Go to Alerts",
              run: () => router.push("/alerts"),
            },
          ]
        : []),
      {
        id: "theme",
        label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
    const q = query.trim().toLowerCase();
    return q ? nav.filter((a) => a.label.toLowerCase().includes(q)) : nav;
  }, [user, router, resolvedTheme, setTheme, query]);

  // Companies first, then actions
  const rows = useMemo(
    () => [
      ...results.map((r) => ({
        key: `co-${r.id}`,
        label: r.name,
        hint: r.ticker,
        company: r,
      })),
      ...actions.map((a) => ({
        key: `act-${a.id}`,
        label: a.label,
        hint: a.hint,
        action: a,
      })),
    ],
    [results, actions]
  );

  const runRow = useCallback(
    (row: (typeof rows)[number]) => {
      close();
      if ("company" in row && row.company) {
        router.push(`/chats?c=${row.company.id}`);
      } else if ("action" in row && row.action) {
        row.action.run();
      }
    },
    [close, router]
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && rows[selected]) {
      e.preventDefault();
      runRow(rows[selected]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 top-[20%] translate-y-0 sm:max-w-lg bg-white dark:bg-[#14161c] border-slate-200 dark:border-white/[0.08] overflow-hidden"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder={
            user ? "Search companies or actions…" : "Search actions…"
          }
          className="w-full px-4 py-3.5 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-b border-slate-200 dark:border-white/[0.06]"
        />
        <div className="max-h-80 overflow-y-auto py-1.5">
          {rows.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No matches.
            </p>
          ) : (
            rows.map((row, i) => (
              <button
                key={row.key}
                onClick={() => runRow(row)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors ${
                  i === selected
                    ? "bg-indigo-500/10 text-slate-900 dark:bg-indigo-500/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span className="truncate">{row.label}</span>
                {row.hint && (
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                    {row.hint}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-slate-200 dark:border-white/[0.06] text-[10.5px] text-slate-400 dark:text-slate-500 flex gap-3">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
