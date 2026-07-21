# Sensybull Product Vision: Vanilla Simple

> Rewritten July 2026. The previous version of this document argued for a pivot into a
> "thesis engine". That direction was built, shipped behind the scenes, and then
> **hard-rolled-back** in July 2026 in favor of radical simplification. This document
> records the current direction so future work doesn't re-litigate it.

## The product, in one sentence

Every SEC filing from the companies you follow, explained in plain English, seconds
after it hits EDGAR.

## What Sensybull is

Three things, done well:

1. **Filings** — a live public feed of decoded SEC filings. Two views: **All** and
   **Important** (the binary that replaced High/Medium/Low significance grades).
2. **Watchlist** — follow companies; their filings arrive as a message thread with
   unread counts and optional alerts (email, push, SMS, Telegram, Discord, Slack,
   WhatsApp, webhooks).
3. **Summaries** — a headline first; a verified plain-English summary, deal terms, and
   key dates when the reader asks for more. Nothing the grounding pipeline can't verify
   ever reaches a user.

Supporting surfaces: per-company sheet (price chart, upcoming key dates, filing
history), public permalinks, and share/track links.

## What Sensybull deliberately is not (for now)

- **No thesis engine / positions.** Rolled back completely (July 2026). The API routes,
  LLM judging pipeline, thesis alerts, and the /positions UI are gone. The database
  tables were left in place so historical data survives, but no code reads them.
- **No catalyst calendar.** Key dates still appear inside each update and on the
  company sheet — there is just no dedicated calendar surface.
- **No taxonomy dashboards.** No significance tiers in the UI, no event-type or
  market-cap filter pickers. One toggle (All / Important) and a search box.

## Design principles

- **Grandma-friendly.** If a UI element needs explanation, cut it. Fewer clicks beats
  more control.
- **Headline first.** Every update collapses to who + when + one headline. Everything
  else — summary, key dates, actions — appears only when the reader opens it.
- **Obvious selection.** Selected states are solid indigo on white/dark, never a subtle
  tint. Decorative color stays banned; red is reserved for "Important" and negative
  price data, emerald for positive price data.
- **The user can leave.** Every expanded update has "Copy for AI chat" (a
  self-contained prompt for ChatGPT/Gemini/Claude), a share button, and a link to the
  primary source on EDGAR. We win by being the fastest plain-English source, not by
  trapping the reader.
