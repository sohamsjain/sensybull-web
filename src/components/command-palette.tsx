"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { displayCompanyName } from "@/lib/company-name";
import type { CompanySearchResult, CompanySearchResponse } from "@/types/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EnterIcon, SearchIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { GroupLabel } from "@/components/ui/section";

interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

/** Lets the rail (or anything else) raise the palette without prop drilling. */
let openListener: (() => void) | null = null;

export function openCommandPalette(): void {
  openListener?.();
}

/**
 * ⌘K search: companies first, then the things you can do. Search is the
 * fastest route through the product, so it opens over whatever you were
 * reading and closes the moment you've chosen.
 */
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

  // Pointer route into the same palette (the rail's search button)
  useEffect(() => {
    openListener = () => setOpen(true);
    return () => {
      openListener = null;
    };
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
              id: "watchlist",
              label: "Go to Watchlist",
              run: () => router.push("/watchlist"),
            },
          ]
        : []),
      { id: "feed", label: "Go to Feed", run: () => router.push("/feed") },
      ...(user
        ? [
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
        label: displayCompanyName(r.name),
        hint: r.ticker,
        group: "Companies" as const,
        company: r,
      })),
      ...actions.map((a) => ({
        key: `act-${a.id}`,
        label: a.label,
        hint: a.hint,
        group: "Actions" as const,
        action: a,
      })),
    ],
    [results, actions]
  );

  const runRow = useCallback(
    (row: (typeof rows)[number]) => {
      close();
      if ("company" in row && row.company) {
        router.push(`/watchlist?c=${row.company.id}`);
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
        className="top-[18%] translate-y-0 gap-0 overflow-hidden border border-line bg-surface-raised p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2.5 border-b border-line-subtle px-3.5">
          <SearchIcon className="size-4 shrink-0 text-ink-faint" aria-hidden />
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
            className="w-full bg-transparent py-3 text-body text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {rows.length === 0 ? (
            <p className="px-4 py-6 text-center text-meta text-ink-faint">
              No matches.
            </p>
          ) : (
            rows.map((row, i) => {
              const startsGroup = i === 0 || rows[i - 1].group !== row.group;
              return (
                <div key={row.key}>
                  {startsGroup && (
                    <GroupLabel className="px-3.5 pt-2">{row.group}</GroupLabel>
                  )}
                  <button
                    onClick={() => runRow(row)}
                    onMouseEnter={() => setSelected(i)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-1.5 text-left text-label transition-colors ${
                      i === selected
                        ? "bg-surface-hover text-ink"
                        : "text-ink-muted"
                    }`}
                  >
                    <span className="truncate">{row.label}</span>
                    {row.hint && (
                      <span className="shrink-0 font-mono text-micro text-ink-faint">
                        {row.hint}
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line-subtle px-3.5 py-2 text-micro text-ink-faint">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <EnterIcon className="size-2.5" />
            </Kbd>{" "}
            open
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
