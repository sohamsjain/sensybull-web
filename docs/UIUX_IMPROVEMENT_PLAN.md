# Sensybull Web — UI/UX Improvement Plan (Investor/Analyst Perspective)

Audit of the current Chats and Feed experiences, framed around how a retail investor
or professional analyst actually uses a filing-intelligence product: **scan fast,
judge materiality, get context, act, come back tomorrow**. Items reference the
components that need to change.

---

## Guiding principles

1. **Density over decoration.** Analysts scan dozens of events; today roughly 1.5
   feed cards fit on a 1600px screen. Every vertical pixel of a card must earn its place.
2. **Color must carry meaning.** Green should mean *positive* — today it also means
   "unread", "any dollar value", "live", and "takeaway text", which dilutes the signal.
3. **Numbers are the product.** Format them like a terminal: compact notation,
   tabular figures, absolute timestamps on demand.
4. **Trust through provenance.** The "verify on SEC EDGAR" footer is great — extend
   that transparency to significance/sentiment scoring.

---

## Phase 1 — Correctness & credibility fixes (quick wins, ~1–2 days)

These are visible defects that undermine trust in a financial product.

### 1.1 Format financial numbers
- `share count: 1250000` renders raw (visible in both screenshots). Add a
  `formatQuantity()` / `formatMoney()` util (`src/lib/utils.ts`) using
  `Intl.NumberFormat` — `1,250,000` or `1.25M`, `$43.4M`, `$25B`.
- Apply in `DealTerms` (`src/components/feed/deal-terms.tsx`) with heuristics on the
  key name (`share_count`, `deal_value`, …). Apply `tabular-nums` to all numeric cells.

### 1.2 Stop coloring every $-value green
- `DealTerms.isFinancialValue()` paints any `$`/`%` value emerald. A warrant exercise
  price of "$3.25–$7.00" is not a gain; green implies one. Use high-emphasis neutral
  (white/near-white, semibold) for financial values. Reserve green/red strictly for
  sentiment-linked or directional data.

### 1.3 Fix light-mode-illegible components
Several analyst-critical blocks are hardcoded to dark palette and are unreadable in
light theme (the app ships a `ThemeToggle`):
- `deal-terms.tsx` — values use `text-slate-100`/`text-emerald-300` with no `dark:` split.
- `catalysts-table.tsx` — `bg-slate-900/40`, `text-slate-200`.
- `chat-message.tsx` takeaway — `text-emerald-200/80` (invisible on the light bubble).
Fix all three with proper light/dark pairs, or remove the light theme entirely.

### 1.4 One visual language for the "investor takeaway"
- Feed: amber ◆ + italic slate. Chats: plain emerald text. Pick one treatment and make
  its accent **sentiment-aware**: emerald for Positive, red for Negative, amber for
  Mixed, slate for Neutral. The takeaway is the single highest-value line for an
  analyst — it should look like a verdict, not a random color.

### 1.5 Canonical deal-term ordering
- Field order currently follows the LLM's JSON key order, so the same deal renders
  `counterparty → share count → price → status` in the feed and
  `consideration → status → share count` in chats. Define a priority list
  (`deal_value`, `price_per_share`, `consideration_type`, `counterparty`,
  `share_count`, `deal_status`, then rest alphabetical) and sort in `DealTerms`.
- Also title-case the labels ("Deal status", not "deal status").

### 1.6 Precise timestamps
- "1d ago" / "5:44 PM" is not enough when timing is tradeable information. Add
  `title=` tooltips with the full datetime everywhere (`FilingCard`, `ChatMessage`,
  `ChatListItem`), and switch to absolute dates ("Jul 1, 5:44 PM") past 24h.
- **After-hours chip**: 8-Ks filed outside 9:30–16:00 ET are disproportionately
  market-moving. Compute from `received_at` and show a small "AH" / "pre-market"
  chip next to the timestamp. Cheap to build, differentiating.

### 1.7 Demote the destructive action in the chat header
- "Remove" (from watchlist) sits permanently next to the bell in
  `chat-conversation.tsx`. Move it into a `⋯` overflow `DropdownMenu`
  (primitive already exists in `src/components/ui/`) alongside Mute; keep the
  inline confirm.

---

## Phase 2 — Scanning & density (the analyst workflow, ~3–5 days)

### 2.1 Compact-by-default feed cards
- Collapse `briefing.summary`, deal terms, and catalysts behind expansion for Medium
  events too (today only Low is collapsed) — default card = logo, ticker, badges,
  headline, takeaway, action row. Target 4–6 cards per screen instead of 1.5.
- Add a **density toggle** (Comfortable / Compact) persisted to `localStorage`.
- Replace the timid "Click to expand" text with a chevron affordance and rotate on open.

### 2.2 Use the empty gutters
- On ≥1280px the feed is a ~730px centered column with dead space either side. Add a
  **right rail: "Upcoming catalysts"** — the backend already exposes
  `/events/catalysts`. A date-sorted list of the next 2 weeks of catalysts across the
  user's watchlist is the single most requested analyst artifact (an events calendar).
  Each row links to its filing/company.

### 2.3 Day grouping + session continuity in the feed
- Insert sticky day separators ("Today", "Yesterday", "Jun 30") like the chat view
  already does, in `filing-list.tsx`.
- Add a "— last visit —" divider using a stored last-seen timestamp so returning users
  see what's new at a glance.

### 2.4 Live updates that don't yank the scroll
- New socket events currently prepend into the list. When the user is scrolled down,
  buffer them and show a floating "↑ 3 new events" pill that scrolls to top on click
  (Twitter pattern). In `useEvents` + `FilingList`.

### 2.5 Filters in the URL
- Significance/event-type/search/watchlist state lives only in React state
  (`(dashboard)/layout.tsx`). Mirror it to query params so views are shareable and
  bookmarkable, and survive refresh.

### 2.6 Keyboard navigation
- `j`/`k` to move between cards, `Enter`/`o` to expand, `e` to open EDGAR, `w` to
  watchlist, `/` to focus search. Analysts live on keyboards; this is cheap and makes
  the product feel professional.

### 2.7 Chat list power features
- Unread-only filter toggle at the top of `ChatList`.
- Pin companies to the top (persist per user or localStorage).
- Show the significance color as a 2px left accent on `ChatListItem` for the last
  event, so the inbox itself communicates materiality, not just recency.

---

## Phase 3 — Context & navigation (what's missing entirely, ~1–2 weeks)

### 3.1 Company page / profile sheet
- Tickers and company names are not clickable in the feed. Add a company route (or a
  slide-over `Sheet`, primitive exists) with: header (name, ticker, CIK, EDGAR link),
  watchlist/mute controls, upcoming catalysts, and the filing timeline (backend:
  `/events/company/:id` already exists — the chat conversation is this data).
- Cross-link both ways: chat header ticker → company page; feed ticker → company page;
  company page → "Open chat".

### 3.2 Market context on cards
- The first question an analyst asks about any 8-K: *what did the stock do?* Even
  without a realtime quote vendor, show market cap / last price (delayed or
  prior-close) next to the ticker, and eventually a price sparkline around the filing
  time. This is the biggest single upgrade to perceived value; requires a backend
  data source, so plan it as its own workstream.

### 3.3 Catalyst calendar view
- Promote the Phase 2 right rail into a full `/calendar` page: month/agenda view of
  all catalysts across the watchlist, filterable by significance, each entry linking
  back to the source filing. "TBD" catalysts grouped at the bottom.

### 3.4 Command palette (⌘K)
- Global company jump using the existing `/companies/search` typeahead: type a ticker
  → open its chat/company page, or add to watchlist inline. Also expose actions
  ("toggle high only", "go to alerts").

### 3.5 Scoring transparency
- MED/HIGH badges are unexplained. Add a tooltip/popover on `SignificanceBadge`:
  what the level means and why this event earned it (item codes present, event type
  tier). Keeps the AI honest and teaches new users the taxonomy.

### 3.6 Sharing
- "Copy link" on each event (needs a per-event permalink route) so analysts can paste
  an event into Slack/notes. The card is the product's viral surface.

---

## Phase 4 — Polish & accessibility (ongoing)

### 4.1 Sentiment needs more than a 6px dot
- `SentimentDot` is color-only (inaccessible, and invisible in the screenshots).
  On expanded cards, pair it with a text label ("Positive") or directional glyph
  (▲/▼/◆) with `aria-label`s. Keep the dot in compact rows.

### 4.2 Contrast & type
- Audit `text-slate-500`-on-`#0a0a12` (10–11px meta text is below WCAG AA). Bump
  meta text to 11–12px minimum and slate-400.
- `tabular-nums` on every timestamp, price, count (feed timestamp already has it;
  deal terms and catalysts don't).

### 4.3 Mobile
- Replace the hamburger + drawer with a bottom tab bar (Chats / Feed / Alerts) —
  this app is a "check it 10× a day" product; navigation must be thumb-reachable.
- Make the significance filter available on mobile (currently `hidden sm:flex`).

### 4.4 Empty/loading states
- Feed skeletons exist; add guest-mode nudges ("Sign in to filter by your watchlist")
  and a first-run pointer to add companies (empty chat list is currently a dead end).

### 4.5 Unify unread color with brand
- Emerald unread badges + emerald timestamps in `ChatListItem` read as "positive
  news" in a product where green must mean sentiment. Switch unread affordances to
  violet (the established brand/action color used for buttons and links).

---

## Suggested sequencing

| Order | Item | Effort | Impact |
|---|---|---|---|
| 1 | 1.1–1.6 correctness fixes | S | Trust — a finance product can't show `1250000` |
| 2 | 2.1 compact cards + 2.3 day grouping | M | Core scanning workflow |
| 3 | 2.4 new-events pill + 2.5 URL filters | S | Feels professional, shareable |
| 4 | 2.2 catalyst rail → 3.3 calendar | M | Unique analyst value, backend exists |
| 5 | 3.1 company page + cross-links | M | Fixes the navigation dead ends |
| 6 | 2.6 keyboard nav + 3.4 ⌘K | S–M | Power-user retention |
| 7 | 3.2 market context | L | Biggest perceived-value jump; needs data vendor |
| 8 | Phase 4 accessibility/mobile | M | Ongoing |

S = ≤1 day, M = 2–4 days, L = 1–2 weeks (includes backend work).
