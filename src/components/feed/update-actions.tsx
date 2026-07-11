"use client";

import { useState } from "react";
import type { FilingEvent } from "@/types/events";
import {
  buildAiPrompt,
  copyText,
  shareEvent,
} from "@/lib/event-actions";

/**
 * Action row shown only when an update is expanded: read the source filing,
 * copy a ready-made prompt for ChatGPT/Gemini/Claude, and share the update.
 * Kept identical between the feed card and the watchlist message so every
 * update behaves the same way.
 */
export function UpdateActions({ event }: { event: FilingEvent }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const flash = (set: (v: boolean) => void) => {
    set(true);
    setTimeout(() => set(false), 1800);
  };

  const handleCopyPrompt = async () => {
    if ((await copyText(buildAiPrompt(event))) === "copied") {
      flash(setCopied);
    }
  };

  const handleShare = async () => {
    if ((await shareEvent(event)) === "copied") {
      flash(setShared);
    }
  };

  const buttonClass = `
    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
    bg-slate-100 dark:bg-white/[0.06]
    text-slate-700 dark:text-slate-200
    hover:bg-slate-200 dark:hover:bg-white/[0.12]
    transition-colors
  `;

  return (
    <div
      className="mt-3 flex items-center gap-2 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      {event.edgar_url && (
        <a
          href={event.edgar_url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-60">
            <path d="M2 2h8v8H2z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M4 4.5h4M4 6.5h4M4 8.5h2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
          Read the filing
        </a>
      )}

      <button
        onClick={handleCopyPrompt}
        className={buttonClass}
        title="Copy this update as a question you can paste into ChatGPT, Gemini, or Claude"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-60">
          <rect x="4" y="4" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1" />
          <path d="M8 4V2.5A1 1 0 0 0 7 1.5H2.5a1 1 0 0 0-1 1V7a1 1 0 0 0 1 1H4" stroke="currentColor" strokeWidth="1" />
        </svg>
        {copied ? "Copied — paste into any AI chat" : "Copy for AI chat"}
      </button>

      <button
        onClick={handleShare}
        className={buttonClass}
        title="Share this update"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-60">
          <circle cx="3" cy="6" r="1.5" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="2.7" r="1.5" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="9.3" r="1.5" stroke="currentColor" strokeWidth="1" />
          <path d="M4.4 5.3 7.6 3.4M4.4 6.7l3.2 1.9" stroke="currentColor" strokeWidth="1" />
        </svg>
        {shared ? "Link copied" : "Share"}
      </button>
    </div>
  );
}
