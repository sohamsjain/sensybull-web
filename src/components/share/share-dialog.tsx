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
      <div className="mb-1 flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <button
          onClick={copy}
          className="text-meta font-medium text-brand-ink underline-offset-2 hover:underline"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <code
        onClick={(e) => {
          const range = document.createRange();
          range.selectNodeContents(e.currentTarget);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }}
        className="block w-full cursor-text rounded-md border border-line-subtle bg-canvas-sunken px-2.5 py-2 font-mono text-meta leading-relaxed break-all text-ink-muted"
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
      <DialogContent className="border border-line bg-surface-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-title font-medium text-ink">
            Share {name}
          </DialogTitle>
          <DialogDescription className="text-label text-ink-faint">
            Anyone who opens this link can add {ticker} to their watchlist in
            one click.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 space-y-3.5">
          <CopyRow label="Copy link" value={addUrl(ticker)} />
          <CopyRow label="Copy HTML" value={shareHtml(ticker, name)} />
          <CopyRow label="Copy Markdown" value={shareMarkdown(ticker, name)} />
          <CopyRow label="Embed button" value={embedHtml(ticker)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
