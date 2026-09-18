# Sensybull Product Vision: Thesis Monitoring

> **Direction set September 2026.** This reverses the July 2026 hard rollback of the
> thesis engine. That rollback was right about *complexity* — the multi-form ingest,
> the significance tiers, the taxonomy dashboards and the half-built positions UI were
> genuinely unmaintainable, and simplifying was the correct call. It was wrong about
> the *job to be done*. Simplification left a good filings utility with no reason to be
> preferred over a dozen other filing alerts.
>
> The thesis direction returns, but deliberately narrower than what was deleted:
> one free-text thesis per company, one verdict per event, one alert type. Read the
> "Scope discipline" section before adding to it.

## The product, in one sentence

Sensybull watches the companies you own and tells you when something happens that
could change **why you own them.**

## The problem

Investors don't lack information. They have SEC filings, earnings releases, press
releases, conference calls, analyst reports and news alerts. The problem is knowing
which of it matters *to their reason for owning the stock* — and that reason usually
lives in their head, unwritten, where it can quietly go stale for a year.

The positioning line, and the one to build the company around:

> **You shouldn't have to watch 50 companies. You should be able to watch *why* you
> own 50 companies.**

## What exists today

1. **Ingest** — 8-K / 8-K/A from EDGAR plus newswire press releases, seconds after
   publication.
2. **Briefings** — a plain-English headline and summary per event, with up to three
   verbatim quotes verified against the source document and deep-linked to the
   highlighted passage on sec.gov. Anything the pipeline can't verify is dropped, not
   guessed at.
3. **Feed** — public live stream, plus a "My companies" scope. One All/Important
   binary, event-type chips, search.
4. **Watchlist** — follow companies; filings arrive as a per-company thread with
   unread counts and alerts (email, push, SMS, Telegram, Discord, Slack, WhatsApp,
   webhooks).
5. **Supporting surfaces** — company sheet with price chart, public permalinks,
   share/track links.

## What is being built

The landing page (September 2026) sells thesis monitoring. The product does not do it
yet. Closing that gap is the priority, in this order:

1. **Thesis capture.** One free-text "why do you own this?" per followed company,
   optionally split into 2–5 assumption lines. Smallest thing that makes the page
   true. Ships with an empty-state prompt on `/watchlist`.
2. **The judge.** After a briefing is written, a second pass scores the event against
   that company's stored assumptions: `intact | watch | drift`, plus one sentence of
   reasoning. **It must cite the filing span that triggered the verdict**, verified by
   `services/ingest/evidence.py`, or it doesn't ship. The evidence discipline is the
   difference between this and another AI summary tool.
3. **Surfacing.** Thesis status on watchlist rows, a per-company thesis panel, a
   `THESIS DRIFT` alert type alongside the Important binary.
4. **The record.** Assumptions and verdicts over time — the thesis timeline.

The `position`, `thesis_version` and `thesis_assessment` tables survive from the first
attempt and are empty. Re-map them as models rather than migrating new ones.

### Scope discipline

The July 2026 rollback happened because the first thesis engine grew without a stop
condition. Things that stay out unless there is an explicit, written decision:

- **No financial-statement parsing.** 8-Ks and press releases don't reliably carry
  revenue growth or margins — that's 10-Q territory. Judge against what is actually
  disclosed: guidance revisions (Item 2.02), customer and contract loss (1.01/1.02),
  management departures (5.02), debt (2.03), M&A (2.01). Marketing copy that implies
  otherwise is a copy bug.
- **No significance tiers in the UI.** The ingest pipeline still grades High/Med/Low
  internally; the product surface stays binary.
- **No multi-form ingest.** 8-K family only among SEC forms, plus press releases.
- **No catalyst calendar, no taxonomy dashboards.**
- **One verdict per event.** Not a score, not a confidence band, not a chart.

## Design principles

- **Nothing in the UI needs explaining.** A craft bar, not an audience claim — the
  product is for investors with money at risk, and it still shouldn't need a tooltip.
  (This replaces the earlier "grandma-friendly" framing, which pointed at a different
  audience than the one the product now addresses.)
- **Headline first.** Every update collapses to who + when + one headline. Summary,
  evidence, key dates and actions appear only when the reader opens it.
- **Show your work.** Quotes are the filing's own words, never edited or paraphrased
  in the client. A thesis verdict without a cited span is a bug.
- **Obvious selection.** Selected states are solid indigo, never a subtle tint.
  Decorative colour stays banned; status colour (success/warning/danger) is for status.
- **The user can leave.** Every expanded update has "Copy for AI chat", a share button
  and a link to the primary source. We win by being the fastest honest read, not by
  trapping anyone.
