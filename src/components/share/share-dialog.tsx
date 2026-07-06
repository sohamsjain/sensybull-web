"use client";

/**
 * "Share" modal for a company: copy the canonical track link, an HTML
 * anchor, a Markdown link, or an iframe embed — everything a blogger or
 * newsletter writer needs to send readers to /add/:symbol.
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addUrl,
  embedHtml,
  shareHtml,
  shareMarkdown,
} from "@/lib/share";

interface ShareDialogProps {
  company: { name: string; ticker: string } | null;
  onClose: () => void;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard blocked (http / permissions) — leave the text selectable.
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <button
          onClick={copy}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <code
        onClick={(e) => {
          const range = document.createRange();
          range.selectNodeContents(e.currentTarget);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }}
        className="block w-full rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] px-2.5 py-2 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300 break-all cursor-text"
      >
        {value}
      </code>
    </div>
  );
}

export function ShareDialog({ company, onClose }: ShareDialogProps) {
  if (!company) return null;
  const { name, ticker } = company;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#12141b] border-slate-200 dark:border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Share {name}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Anyone who opens this link can add {ticker} to their watchlist in
            one click.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <CopyRow label="Copy link" value={addUrl(ticker)} />
          <CopyRow label="Copy HTML" value={shareHtml(ticker, name)} />
          <CopyRow label="Copy Markdown" value={shareMarkdown(ticker, name)} />
          <CopyRow label="Embed button" value={embedHtml(ticker)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
