# Sensybull Product Vision: The Thesis Engine

> A brutally honest assessment of the proposed pivot — kill the feed and every other
> commodity feature, focus entirely on thesis-aware updates, and reposition Sensybull
> as an investment thesis engine ("Claude Code for the fundamental investor's workflow").
> Grounded in a full survey of both codebases (`sensybull-web` + `sensybull-api`) as of
> July 2026.

---

## Verdict: Better — but the framing mis-diagnoses where the work is

Focusing on the thesis engine is the right call. It's the only thing in the product that
isn't a commodity, and nobody owns "your thesis, continuously stress-tested" as a
category. But two brutal corrections:

**1. Deleting the commodity features saves almost nothing.** `/feed`, `/movers`,
`/calendar`, and permalinks amount to roughly 1,000 LOC of frontend and four API routes,
mostly built on shared components. The ingest pipeline, the alert system, the inbox —
the expensive stuff — all serve the thesis product too. Killing the commodity pages is a
*positioning* move, not an engineering one. Worth doing, but it's 5% of the pivot.

**2. The thesis engine, as built, would not survive contact with a serious investor.**
The plumbing is production-grade: deferred bulk alerts, escalate-only status transitions,
idempotent assessments, tier-bypassing thesis alerts across 8 channels — genuinely
careful work. But the judgment is one cheap LLM call (llama-4-scout-17b →
llama-3.1-8b fallback) grading a free-text thesis sentence against another LLM's 2–4
sentence summary of the filing. It never sees the full filing text, never sees price
data (even though `reaction_worker.py` already computes 5m→1w reactions for every
filing), never sees position size or cost basis (captured in the model, fed nowhere),
produces no confidence score, and gives one blob verdict instead of per-assumption
analysis. An LLM grading a summary against a summary. A PM would catch a wrong verdict
within the first week and never trust it again.

**The real pivot is not "delete the feed" — it's "close the gap between the
sophistication of the plumbing and the naïveté of the judgment."**

Also: drop "investor operating system" from the pitch. OS positioning is what products
claim after they own a wedge, not before. "Claude Code for the fundamental investor" is
the better instinct — but the analogy has to be earned (see below).

---

## Pros of the pivot

1. **It's the only defensible position available.** The filing feed, movers, and
   catalyst calendar are reproducible by anyone with an EDGAR poller and a Groq key —
   Bloomberg, Koyfin, Fey, and free filing bots all orbit this space. "Filings judged
   against *your* thesis" has no incumbent. The moat compounds: theses + verdicts +
   subsequent price outcomes accumulate into a proprietary eval dataset no competitor
   can copy.

2. **Clear willingness to pay.** A feed is news (worth ~$0 retail). A thesis-break
   alert is *loss prevention* — it prices like insurance. "It caught the guidance cut
   that broke my NVDA thesis 20 minutes after the 8-K" is a testimonial that sells
   subscriptions; "it summarized a filing" is not.

3. **Focus for a small team.** The product has 8 fully-built alert channels and
   multi-watchlist API support the UI doesn't expose, and zero billing code. Effort has
   gone breadth-first. This pivot is the forcing function to go depth-first.

4. **Narrative clarity.** "Bloomberg tells you what happened. Sensybull tells you what
   it means for your thesis." One sentence, immediately differentiated, aimed at an
   emotion every fundamental investor has felt: the filing you missed, the thesis you
   held too long.

5. **The best UI already fits it.** The watchlist inbox (unread counts, mute,
   conversation view, live sockets, keyboard nav) is the most polished surface in the
   product — it needs reframing, not rebuilding.

## Cons and hard risks

1. **Activation hurdle: users must write a thesis.** Most retail investors don't have
   an articulated, falsifiable thesis. The Buffett-types who do are few and
   AI-skeptical. This shrinks TAM from "anyone watching stocks" to "people who take
   positions seriously" — which is the point, but be honest that it's a niche wedge
   (serious retail, small-fund PMs, RIA analysts), not a mass market.

2. **The accuracy bar is brutal, and the current engine isn't near it.** A false
   "thesis broken" alert trains users to ignore you (crying wolf); a missed break is
   worse (you had one job). Today's single-shot small-model judgment over lossy
   summaries will produce both, regularly. This is the existential risk of the pivot:
   **it stakes the product on the one component that's currently weakest.**

3. **Filings alone can't carry the promise.** Most thesis-breaking events are earnings
   calls, guidance, competitor moves, macro — not 8-Ks. Either scope the promise
   honestly ("we watch every SEC filing against your thesis" — defensible, narrow) or
   commit to a source-expansion roadmap. Overpromising "we watch everything" with
   filings-only coverage will churn exactly the sophisticated users being targeted.

4. **Cold-start silence.** After writing a thesis, the user may wait weeks before a
   material filing hits their company. If nothing happens, the product feels dead.
   (Mitigation below — retroactive assessment — is cheap and uses data already in
   Postgres.)

5. **Losing the public funnel.** `/feed`, `/movers`, `/e/[id]` are the unauthenticated
   SEO/share surface. Mitigation: keep permalinks as marketing pages (near-zero cost),
   kill the rest from nav. No analytics are instrumented, so there's no way to verify
   whether these pages drive anything — the call gets made on conviction, which is
   acceptable pre-revenue, but note it's made flying blind.

---

## The Vision: Sensybull is the Thesis Engine

**One-liner:** Every position you hold has a written, living thesis. Sensybull reads
everything that happens to your companies and tells you — with evidence — when reality
starts diverging from what you believed.

**The Claude Code analogy, earned properly.** Claude Code works because of three
things: it reads the *actual source* (not summaries), it works in a *loop*
(investigate → act → verify), and it maintains *context* (CLAUDE.md, the conversation).
Mapped to investing:

| Claude Code | Thesis Engine |
|---|---|
| Reads the real codebase | Reads full filings, not summaries |
| CLAUDE.md / plan files | The structured thesis: claims, assumptions, kill criteria |
| Plan mode before acting | AI-assisted thesis drafting ("interview mode") |
| Agentic loop with tools | Analyst agent that pulls filings, price data, past assessments |
| Diffs and review | Thesis versioning; per-assumption verdicts with citations |

### Pillar 1 — Thesis as a first-class, structured artifact

Replace the free-text `thesis` blob with structure: **core claim, 2–5 falsifiable
assumptions, explicit kill criteria, time horizon.** AI-assisted drafting: the user
dumps their raw view, the engine interviews them into a falsifiable thesis ("your claim
depends on datacenter capex growing — what number would worry you?"). Theses are
versioned like code — edits produce diffs and history, so thesis drift is visible.
*This step is itself a magic moment: most investors have never been forced to state
what would prove them wrong.*

### Pillar 2 — Judgment worth trusting (the core engineering bet)

Two-stage assessment, mirroring the tiering pattern already in the alert dispatcher:

- **Triage (cheap, current model):** every filing × every held thesis, as today.
- **Deep pass (frontier model) on any non-neutral triage:** reads the *full filing
  text* (the ingest pipeline already fetches up to 24k chars — feed it forward instead
  of discarding it), the **price reaction** (`reaction_worker` already computes it —
  currently a leaderboard input; make it a judgment input), position direction and
  size, and the structured thesis. Output: **per-assumption verdicts, a confidence
  score, and citations to specific filing passages.** Cost stays sane because deep
  passes only fire on triage escalations.
- **Retroactive assessment at thesis creation:** immediately run the thesis against the
  company's stored filing history — "here's how your thesis would have held up over the
  past 12 months." Solves cold-start with data already in Postgres, and is the
  activation wow-moment.

### Pillar 3 — The inbox becomes the thesis inbox

Keep the two-pane inbox — it's the best UI in the product — but reframe: companies sort
by **thesis health** (broken > threatened > watch > intact), not recency; every filing
message leads with its verdict against *your* assumptions; unread means *unreviewed
evidence*; and catalysts appear per-position as "upcoming events that will test
assumption #2." A per-thesis calendar is differentiated; the global `/calendar` page
was not.

### Pillar 4 — The interactive analyst (where "Claude Code for investing" becomes literal)

Chat with the engine about a position: "What's the strongest evidence against my thesis
this quarter?" "What would have to be true for this to break?" "Draft the bear case."
The agent has tools: filing retrieval, price history, past assessments, the thesis
itself. This is the feature that turns a monitoring product into a decision product —
and it's the natural paid tier.

### Pillar 5 — Memory and track record

Assessments + subsequent price outcomes accumulate into a scorecard: per-user ("your
broken theses preceded an average −14% move — you exit too late") and per-product ("our
thesis-break calls preceded an average −18% drawdown" — the single most powerful
marketing claim this product could ever make, and it falls out of data already stored
in `ThesisAssessment` + `PriceReaction`).

### Source roadmap

Filings (now) → earnings call transcripts (the highest-value add; most thesis breaks
live in the Q&A) → press releases/guidance → news. Each new source multiplies the value
of every existing thesis without changing the product shape.

### What gets killed, kept, folded

- **Kill from product nav:** `/feed`, `/movers`, `/calendar` as standalone pages.
- **Keep as marketing surface:** `/e/[id]` permalinks (SEO, near-zero cost); possibly
  the public feed at a marketing URL — not in the app.
- **Fold in:** catalysts → per-position view; price reactions → assessment input (keep
  `reaction_worker`, kill the movers leaderboard).
- **Keep untouched:** the entire ingest pipeline (it's the substrate and the best
  engineering in the codebase), the inbox, the thesis plumbing.
- **Freeze, don't delete:** the 8 alert channels. Stop building channel breadth; email +
  push + one chat channel is enough until revenue exists.

### Monetization

There is currently zero billing code — this pivot creates the paywall line. Free:
watchlist inbox + plain-English filing summaries (the commodity layer becomes the free
tier / funnel). Paid (~$25–50/mo prosumer, higher pro tier): the thesis engine — N
positions with deep assessments, retroactive backtests, the interactive analyst, full
alert channels. The framing is thesis-break insurance, not a news subscription.

### Sequencing (90 days)

1. **Weeks 1–4 — Judgment depth:** structured thesis model + two-stage assessment with
   full filing text, price reaction, per-assumption verdicts, confidence. Retroactive
   assessment at thesis creation. (All backend; the current UI keeps working.)
2. **Weeks 5–8 — Repositioning:** thesis-first inbox, nav restructure, kill commodity
   pages, AI-assisted thesis drafting, landing page rewrite around the one-liner.
3. **Weeks 9–13 — The analyst:** interactive per-position chat with tools; transcripts
   as the second source; billing.

### What would change this recommendation

If usage data showed `/feed` or `/movers` driving retention — but no analytics are
instrumented, so it can't. To de-risk the decision, instrument first. Otherwise:
pre-revenue with no distribution, conviction is the correct decision-making mode, and
the conviction case for the thesis engine is far stronger than for a prettier filing
feed.
