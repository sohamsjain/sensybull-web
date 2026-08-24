"use client";

import { useState } from "react";

import type { FilingEvent } from "@/types/events";
import { buildAiPrompt, copyText, shareEvent } from "@/lib/event-actions";
import { Button } from "@/components/ui/button";
import { CopyIcon, DocumentIcon, ShareIcon } from "@/components/ui/icons";

/**
 * Action row shown only when an update is expanded: read the source
 * document (SEC filing or press release), copy a ready-made prompt for
 * ChatGPT/Gemini/Claude, and share the update. Kept identical between the
 * feed card and the watchlist entry so every update behaves the same way.
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

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {event.edgar_url && (
        <Button
          size="xs"
          variant="secondary"
          nativeButton={false}
          render={
            <a href={event.edgar_url} target="_blank" rel="noopener noreferrer" />
          }
        >
          <DocumentIcon />
          {event.signal_type === "PR"
            ? "Read the press release"
            : "Read the filing"}
        </Button>
      )}

      {/* A press release gains its SEC-filing link once the 8-K arrives */}
      {event.signal_type === "PR" && event.filing_url && (
        <Button
          size="xs"
          variant="secondary"
          nativeButton={false}
          render={
            <a href={event.filing_url} target="_blank" rel="noopener noreferrer" />
          }
        >
          <DocumentIcon />
          Read the filing
        </Button>
      )}

      <Button
        size="xs"
        variant="secondary"
        onClick={handleCopyPrompt}
        title="Copy this update as a question you can paste into ChatGPT, Gemini, or Claude"
      >
        <CopyIcon />
        {copied ? "Copied — paste into any AI chat" : "Copy for AI chat"}
      </Button>

      <Button
        size="xs"
        variant="secondary"
        onClick={handleShare}
        title="Share this update"
      >
        <ShareIcon />
        {shared ? "Link copied" : "Share"}
      </Button>
    </div>
  );
}
