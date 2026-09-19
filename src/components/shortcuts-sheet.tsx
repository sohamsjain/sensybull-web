"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { GroupLabel } from "@/components/ui/section";

/** Lets the rail (or anything else) raise the sheet without prop drilling. */
let openListener: (() => void) | null = null;

export function openShortcuts(): void {
  openListener?.();
}

interface Shortcut {
  keys: string[];
  /** Joins the caps: "J then K" reads differently from "J or K". */
  join?: "or" | "then";
  action: string;
}

/**
 * Every shortcut the app actually listens for, grouped by where it works.
 *
 * This list is the documentation — if a handler is added or removed in
 * `filing-list.tsx` or `watchlist/page.tsx`, it changes here in the same
 * commit. A shortcut nobody can discover is a shortcut nobody has.
 */
const GROUPS: { title: string; items: Shortcut[] }[] = [
  {
    title: "Anywhere",
    items: [
      { keys: ["⌘", "K"], action: "Search companies and actions" },
      { keys: ["?"], action: "Show this list" },
      { keys: ["Esc"], action: "Close, or step back out" },
    ],
  },
  {
    title: "Updates",
    items: [
      { keys: ["J", "K"], join: "or", action: "Move down / up the list" },
      { keys: ["O", "Enter"], join: "or", action: "Open or close an update" },
      { keys: ["E"], action: "Read the source filing" },
      { keys: ["C"], action: "Copy a link to this update" },
      { keys: ["W"], action: "Follow this company" },
      { keys: ["/"], action: "Jump to search" },
    ],
  },
  {
    title: "Watchlist",
    items: [
      { keys: ["↑", "↓"], join: "or", action: "Move between companies" },
      { keys: ["/"], action: "Jump to search" },
      { keys: ["Esc"], action: "Close the open company" },
    ],
  },
];

function Keys({ keys, join }: Shortcut) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {keys.map((key, i) => (
        <span key={key} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-micro text-ink-dim">{join ?? "+"}</span>
          )}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </span>
  );
}

/**
 * The shortcuts sheet, on `?`.
 *
 * The product is built for people who live in it, and the shortcuts are a
 * real part of the interface — but until now the only way to find one was to
 * press a key and see what happened.
 */
export function ShortcutsSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    openListener = () => setOpen(true);
    return () => {
      openListener = null;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "?") return;
      const target = e.target as HTMLElement;
      // "?" is a character someone may well be typing into search.
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-title">Keyboard shortcuts</DialogTitle>
        <div className="flex flex-col gap-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <GroupLabel className="px-0 pt-0 pb-0">{group.title}</GroupLabel>
              <ul className="mt-2 flex flex-col">
                {group.items.map((item) => (
                  <li
                    key={`${group.title}-${item.action}`}
                    className="flex items-center justify-between gap-4 py-1.5"
                  >
                    <span className="text-label text-ink-muted">
                      {item.action}
                    </span>
                    <Keys {...item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
