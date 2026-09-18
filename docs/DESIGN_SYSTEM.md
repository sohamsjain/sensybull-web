# Sensybull design system

Sensybull is a research terminal. It should feel like a tool someone spends
hours in: dense, calm, fast to scan, and consistent enough that a screen you
have never seen still behaves the way you expect.

The influences, and what was taken from each:

- **Luma** — typographic hierarchy, intentional whitespace, restraint.
- **Obsidian** — information density, panes, quiet chrome, keyboard workflows.
- **WhatsApp Web** — list + detail architecture, scannable rows, search first,
  persistent navigation, unmistakable selected states.

What it is *not*: a dashboard of rounded cards, a gradient-heavy AI SaaS, or a
crypto terminal. Decorative colour, decorative icons, and decorative motion are
all out.

## The rule that matters most

**Components never name a raw colour, a pixel font size, or an arbitrary
radius.** Everything comes from the tokens in `src/app/globals.css`, which
Tailwind turns into utilities. `bg-slate-800`, `text-[13px]` and
`rounded-2xl` do not belong in this codebase — if you need something the
tokens don't offer, the tokens are what change.

Two deliberate exceptions, both because the surface renders where our CSS
custom properties don't exist:

- `src/lib/chart-theme.ts` — the price chart draws to a canvas.
- `src/app/embed/[symbol]/route.ts`, `src/app/add/[symbol]/opengraph-image.tsx`
  and `TrackButton`'s forced `light`/`dark` palettes — these render inside
  someone else's page or an OG image.

Each mirrors the tokens by hand and says so in a comment. Change one, change
the other.

## Colour

Semantic roles, not palette names. Every token is defined for both themes;
nothing is hardcoded per-page.

| Role | Utility | Use |
| --- | --- | --- |
| `canvas` | `bg-canvas` | The page |
| `canvas-sunken` | `bg-canvas-sunken` | Chrome behind the page: rail, wells, inputs |
| `surface` | `bg-surface` | A raised plane: panel, row content |
| `surface-raised` | (via `bg-popover`) | Popovers, dialogs, toasts |
| `surface-hover` / `surface-active` | `bg-surface-hover` | Pointer feedback, pressed state |
| `line` / `line-subtle` / `line-strong` | `border-line-subtle` | Hairlines. `line-subtle` separates rows; `line` frames a plane |
| `ink` / `ink-muted` / `ink-faint` / `ink-dim` | `text-ink-muted` | Primary reading text → supporting prose → metadata → disabled |
| `brand`, `brand-hover`, `brand-soft`, `brand-ink`, `brand-on` | `bg-brand`, `text-brand-ink` | Interactive and selected states only |
| `success` / `warning` / `danger` / `info` (+ `-soft`) | `text-success` | Status only |

Colour discipline:

- The accent means *interactive or selected*. It is never decorative.
- `danger` is the Important marker and negative price data. Nothing else.
- `success` is positive price data (and a "connected"/"sent" status). Nothing else.
- Category and form tags are plain muted text — the taxonomy must not compete
  with the headline.

## Type

Roles, not sizes, so a dense table and a page heading can't drift apart.
Nothing in the product is smaller than 12px, and the ramp widens as it
climbs, so a headline leads its summary instead of tying with it.

| Utility | Size | Use |
| --- | --- | --- |
| `text-micro` | 12px | Timestamps, keycaps, counts, eyebrows |
| `text-meta` | 13px | Metadata, secondary list line |
| `text-label` | 14px | Labels, buttons, summaries |
| `text-body` | 15px | Default reading size |
| `text-body-lg` | 17px | Headlines, list primary line |
| `text-title` | 19px | Pane and section titles |
| `text-heading` | 22px | Page headings |
| `text-display` / `text-display-lg` | 32 / 48px | Marketing pages only |

There is no 10px tier. A count badge, a mobile tab label and a key cap all
sit at `text-micro` — if something genuinely cannot fit at 12px, the layout
is what changes.

The 12–15 end of the ramp steps in 1px, which looks arbitrary written down
and is not. Down there hierarchy is carried by **weight and ink colour**,
not size; a 2px jump between two adjacent metadata rows reads as a mistake
rather than as a level. The ramp opens up from `body-lg` on, where size is
doing the work.

Numbers use `font-mono` with `tabular-nums` so figures compare vertically.
Tickers are mono too — they read as identifiers, not prose.

`.eyebrow` is the one way to title a group: 12px, semibold, uppercase,
tracked, `ink-faint`.

One deliberate off-scale value: `Input` is `text-base` (16px) below the `md`
breakpoint. iOS zooms the viewport when a focused field is smaller than
16px, and that is worse than one breakpoint being off-token.

## Space, radius, elevation

- **Spacing** — Tailwind's 4px scale, but keep to a small vocabulary:
  `0.5 1 1.5 2 2.5 3 3.5 4 5 6 8`. Rows are `px-3/px-4` with `py-3/py-4`.
- **Radius** — `rounded-xs` 4px (inline chips, code, tiny marks),
  `rounded-sm` 6px (buttons, chips, icon buttons), `rounded-md` 8px (inputs,
  panels, rows, marks), `rounded-lg` 12px (dialogs, popovers, sheets).
  `rounded-full` is for a count badge, a status dot, a switch, or an avatar —
  nothing else.

  Every step is at least 1.33x the one below it. The previous 3 / 4 / 6 / 8
  ramp was four steps nobody could tell apart: differences below the
  threshold of perception don't read as hierarchy, they read as sloppiness.
  If a new radius is needed, widen the ramp rather than squeezing a value
  between two existing ones.
- **Hit targets** — nothing interactive is under 28px, and the default
  control height is 36px (`Button` default, `Input`, `SearchInput`,
  `IconButton lg`). `Button size="xs"` (28px) is only for a control sitting
  inline inside a row of text.
- **Elevation** — `shadow-popover` and `shadow-overlay`, and only on things
  that actually float. Separation on the page comes from a hairline or a
  background change, never a shadow.

## Primitives

`src/components/ui/`:

| Component | Notes |
| --- | --- |
| `Button` | One solid variant (the accent) per screen; otherwise `outline` / `secondary` / `ghost` / `link` |
| `Input`, `SearchInput` | Sunken well, accent border on focus. `SearchInput` carries the glyph, clear button, and shortcut hint |
| `Chip`, `ChipRow`, `SegmentedControl` | Filters. Selected is solid accent — the current filter must be obvious at a glance |
| `IconButton` | Icon-only control; quiet until hovered, accent fill only when *on* |
| `Badge`, `CountBadge`, `ImportantMarker`, `StatusDot`, `MetaLabel` | Every status and count in the product |
| `Section`, `GroupLabel`, `Card` | Titled groups. A `Card` is for something that is genuinely one unit |
| `Table` + `THead`/`TH`/`TR`/`TD` | Research tables: hairline rules, sticky header, `numeric` right-aligns and sets tabular mono |
| `EmptyState`, `Skeleton`, `SkeletonRows` | Zero, loading and error states. `EmptyState` takes an optional `icon` and an `action` — see "Nothing is a dead end" |
| `Switch`, `Tip`, `Kbd`, `Dialog`, `Sheet`, `DropdownMenu`, `AppToaster` | — |
| `icons.tsx` | **The** icon set. Import icons from here, never from `lucide-react` directly, and never hand-roll an `<svg>` |

## Layout

```
┌──────┬───────────────────┬──────────────────────────────┐
│      │ list              │ detail                       │
│ rail │ (companies,       │ (filing history, feed,       │
│ 76px │  search, filters) │  settings)                   │
└──────┴───────────────────┴──────────────────────────────┘
```

- The rail is persistent, 76px wide, and never scrolls. **Every destination
  in it carries a visible text label under its glyph.** Three destinations
  do not justify hiding their names behind a hover delay, and no glyph is
  self-evident enough to stand alone — a star reads as "favourite"
  everywhere on the web, so it cannot also mean "the companies I follow".
  Destinations at the top, settings and shortcuts at the foot, search
  reachable by pointer or `⌘K`.
- Destinations are named for what they contain, not for the feature behind
  them: **Companies** (by company) and **Updates** (by time). They come from
  `NAV_ITEMS`, which also carries a one-line `hint` used as the tooltip —
  the label says what it is, the hint says what it's for.
- Panes own their own headers (14 rows tall, hairline underneath). There is
  no global header bar competing for vertical space.
- Reading columns cap at `max-w-3xl`; settings at `max-w-2xl`.
- Mobile swaps the rail for `BottomTabs` — same destinations, same icons,
  same labels, same order, from the same `NAV_ITEMS`.

## Lists and density

A list row states: entity, where the stock is, what happened, when, and
status. Hairline between rows, indented past the mark like WhatsApp Web.
Rows are not cards. The selected row gets `bg-brand-soft` plus a 2px accent
bar on its leading edge.

The headline gets **two lines**, not one: deciding whether to open something
is mostly deciding whether that sentence is interesting, and a row that
truncates it makes the reader click to find out.

Numbers align in a column. Where a price sits next to a timestamp, the
timestamp is given a fixed width so prices form a straight edge down the
list rather than drifting with "8m ago" vs "3h ago".

## Interaction

Quiet and quick: `transition-colors` only, 150ms or less, no transforms on
press, no bouncing. One focus treatment, defined once in `globals.css`
(2px accent outline, keyboard only). `prefers-reduced-motion` is honoured
globally.

Keyboard shortcuts are part of the interface, so they are shown (`Kbd`):
`⌘K` search, `/` focus search, `↑`/`↓` move between companies, `j`/`k` move in
the feed, `o`/`Enter` expand, `e` open the source, `w` track, `Esc` close.

## `cn()` and tailwind-merge

`src/lib/utils.ts` extends tailwind-merge with the design system's type scale
and colour names. Without that, `cn("text-label", "text-ink")` silently drops
`text-label` — both look like `text-*` and tailwind-merge assumes a conflict.
**Any new `--text-*` or `--color-*` token has to be added to the lists in
`utils.ts`**, and `src/lib/__tests__/cn.test.ts` guards the behaviour.

## Nothing is a dead end

Every empty, zero-result and error state says three things, in order: what
would be here, why it isn't, and the one action that would fix it. "No
results" on its own makes the reader guess whether the app is broken,
whether they mistyped, or whether there is genuinely nothing.

- A zero-result state caused by filters offers to clear them.
- A reader with nothing followed yet gets `FirstRun`, not an instruction
  they cannot follow. ("Pick a company to read its history" is useless to
  someone with no companies.)
- **"Couldn't reach the server" is never "not found".** `api()` throws an
  `ApiError` carrying `status`, and `status === 0` (also `err.isOffline`)
  means the request never landed. Telling a reader their link is dead when
  their connection dropped sends them to the wrong fix.
- A failed action never looks like a completed one: report it with
  `toast({ tone: "danger" })`. An empty `catch {}` around a mutation is a
  bug.

## Shortcuts are documented in the product

`?` opens `ShortcutsSheet`, which lists every shortcut the app listens for,
grouped by surface. It is the documentation: if a key handler is added or
removed in `filing-list.tsx` or `watchlist/page.tsx`, the list changes in
the same commit. A shortcut nobody can discover is a shortcut nobody has.

## Visual QA checklist

Before shipping a change, on both themes and at 390px / 1440px:

- No raw palette class or hex outside the two documented exceptions.
- No arbitrary font size or radius, and no Tailwind default size
  (`text-sm`, `text-lg`) — those are not tokens.
- Nothing interactive is smaller than 28px.
- Rows align on a consistent grid; hairlines are `line-subtle`.
- **Check borders in both themes.** `line-subtle` is 6% white in dark mode:
  on a dark card it vanishes, and a field with no visible edge reads as a
  hole rather than somewhere to type. Fields use `border-line`.
- Selected states are unmistakable; hover states are quiet.
- Wide content scrolls inside its own container — the page never scrolls
  sideways. A pointer cannot swipe a hidden overflow: anything that scrolls
  horizontally on desktop must either wrap or show its own control.
- Popovers, tooltips and toasts sit on `surface-raised` — an overlay that
  lets the page show through is a bug, not a style.
- Nothing new is wrapped in a card just because it is a group of information.
