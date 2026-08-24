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

Roles, not sizes, so a dense table and a page heading can't drift apart. The
whole product lives between 10px and 18px; hierarchy comes from weight and
ink colour first, size last.

| Utility | Size | Use |
| --- | --- | --- |
| `text-nano` | 10px | Count badges, mobile tab labels |
| `text-micro` | 11px | Timestamps, keycaps, eyebrows |
| `text-meta` | 12px | Metadata, secondary list line |
| `text-label` | 13px | Labels, buttons, summaries |
| `text-body` | 14px | Default reading size |
| `text-body-lg` | 15px | Headlines, list primary line |
| `text-title` | 16px | Pane and section titles |
| `text-heading` | 18px | Page headings |
| `text-display` / `text-display-lg` | 28 / 40px | Marketing pages only |

Numbers use `font-mono` with `tabular-nums` so figures compare vertically.
Tickers are mono too — they read as identifiers, not prose.

`.eyebrow` is the one way to title a group: 11px, semibold, uppercase,
tracked, `ink-faint`.

## Space, radius, elevation

- **Spacing** — Tailwind's 4px scale, but keep to a small vocabulary:
  `0.5 1 1.5 2 2.5 3 4 5 6 8`. Rows are `px-3/px-4` with `py-2/py-3`.
- **Radius** — `rounded-xs` 3px (inline chips, code), `rounded-sm` 4px
  (buttons, chips, icon buttons), `rounded-md` 6px (inputs, panels, marks),
  `rounded-lg` 8px (dialogs, popovers). `rounded-full` is for a count badge,
  a status dot, a switch, or an avatar — nothing else.
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
| `EmptyState`, `Skeleton`, `SkeletonRows` | Zero and loading states |
| `Switch`, `Tip`, `Kbd`, `Dialog`, `Sheet`, `DropdownMenu`, `AppToaster` | — |
| `icons.tsx` | **The** icon set. Import icons from here, never from `lucide-react` directly, and never hand-roll an `<svg>` |

## Layout

```
┌────┬───────────────────┬──────────────────────────────┐
│    │ list              │ detail                       │
│rail│ (companies,       │ (filing history, feed,       │
│    │  search, filters) │  settings)                   │
└────┴───────────────────┴──────────────────────────────┘
```

- The rail is persistent, icon-width, and never scrolls. Destinations at the
  top, settings at the foot, search reachable by pointer or `⌘K`.
- Panes own their own headers (12 rows tall, hairline underneath). There is no
  global header bar competing for vertical space.
- Reading columns cap at `max-w-3xl`; settings at `max-w-2xl`.
- Mobile swaps the rail for `BottomTabs` — same destinations, same icons, same
  order, from the same `NAV_ITEMS`.

## Lists and density

A list row states: entity, what happened, when, and status. Two lines, ~52px,
hairline between rows, indented past the mark like WhatsApp Web. Rows are not
cards. The selected row gets `bg-brand-soft` plus a 2px accent bar on its
leading edge.

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

## Visual QA checklist

Before shipping a change, on both themes and at 390px / 1440px:

- No raw palette class or hex outside the two documented exceptions.
- No arbitrary font size or radius.
- Rows align on a consistent grid; hairlines are `line-subtle`.
- Selected states are unmistakable; hover states are quiet.
- Wide content scrolls inside its own container — the page never scrolls
  sideways.
- Nothing new is wrapped in a card just because it is a group of information.
