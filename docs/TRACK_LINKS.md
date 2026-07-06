# Shareable "Track on Sensybull" links

Anyone on the internet can send a reader straight into Sensybull and add a
company to their watchlist with one click:

```
https://sensybull.com/add/MU
```

This document covers the URL surface, the intent-preserving auth flow, the
embed/share tooling, analytics, and how to extend the system to new action
types.

## URL surface

| URL | What it does |
| --- | --- |
| `/add/:symbol` | **Canonical.** Adds `:symbol` to the visitor's watchlist (after auth if needed), then lands on the company page. |
| `/watchlist/add?symbol=MU` | Legacy/long form — 307-redirects to `/add/MU` (see `next.config.ts`). |
| `/embed/:symbol` | Lightweight, iframe-able button that links to `/add/:symbol?ref=embed`. |

Attribution params ride along and persist through authentication:
`/add/MU?ref=substack`, `/add/MU?utm_source=newsletter&utm_campaign=q3`.
Accepted keys: `ref`, `utm_source`, `utm_medium`, `utm_campaign` (validated:
`[\w.-]+`, ≤64 chars).

## The flow

**Logged in:** `/add/MU` → `POST /watchlists/track` (idempotent) → success
toast ("Added Micron Technology to your watchlist. You'll now receive material
updates.") → redirect to `/watchlist?c=<companyId>`.

**Logged out:**

1. `/add/MU` stores a *pending action* in localStorage
   (`src/lib/pending-action.ts`):
   `{ v: 1, type: "add_watchlist", params: { symbol: "MU" }, attribution, resumePath, createdAt }`
2. Redirects to `/register?next=/add/MU?...` (login is one click away).
3. Every auth entry point (login, register, Google, Apple, magic link) calls
   `resolvePostAuthPath()` after success: a safe `?next=` wins, then the
   stored pending action's `resumePath`, then the caller's default. Magic
   links lose the query string in the email round-trip — localStorage doesn't.
4. Back on `/add/MU`, the page (the *single execution point* for this action
   type) consumes the pending action, fires the add, shows the toast, and
   redirects. The user never clicks "Add".

### Idempotency & refresh safety

- `POST /watchlists/track` is idempotent: re-posting returns
  `{ status: "already_tracking" }` and never duplicates.
- The pending action is cleared the moment execution starts; a mid-add
  refresh simply re-runs the idempotent call and shows "already tracking".
- Stored intents expire after 1 hour (abandoned signups don't fire later).
- `resumePath` / `?next=` only accept site-relative paths (no open redirects).

### Page states (`src/components/share/add-flow.tsx`)

`loading` (Adding company…) → `success` / `already` → auto-redirect;
`invalid` (unknown/delisted ticker) offers the public feed; `error` (network)
offers a retry. Server render supplies SEO metadata, JSON-LD (`Corporation`
with ticker, sector, market cap) and a dynamic OG image
(`opengraph-image.tsx`: logo/monogram + ticker + "Track Company" CTA).

## Share tooling

- **Share dialog** — every company sheet has a Share button
  (`src/components/share/share-dialog.tsx`) with copy-able Link, HTML,
  Markdown, and iframe embed snippets, built by `src/lib/share.ts` (the same
  strings `GET /api/v1/share/:symbol` returns).
- **`<TrackButton symbol="MU" />`** (`src/components/share/track-button.tsx`)
  — reusable CTA. Props: `size` (`sm|md|lg`), `variant`
  (`primary|outline|minimal|dark`), `theme` (`light|dark|auto`), `showLogo`,
  `rounded` (`true|false|"full"`), `label`, `refSource`, `className`.
- **Embed** — `GET /embed/MU?theme=dark&label=Track%20Micron&radius=12&width=240&height=48&fontSize=15`.
  All params validated/clamped and HTML-escaped; `theme=auto` (default)
  follows `prefers-color-scheme`. Served with `frame-ancestors *` (safe: the
  document is a single outbound link, no auth/cookies), while the rest of the
  site keeps `frame-ancestors 'none'` + `X-Frame-Options: DENY`
  (carve-out in `next.config.ts`).

## API (see API_CHANGES.md 2026-07-06 for full shapes)

- `GET /api/v1/share/:symbol` — public share info; no internal IDs.
- `POST /api/v1/watchlists/track` — authed, idempotent add-by-ticker.
- `POST /api/v1/share/events` — public analytics sink.

## Analytics

Funnel events land in the API's `share_event` table with attribution
(`ref`/`utm_*`), `referrer`, and server-derived `device`, `browser`,
`country`, `logged_in`, `user_id`:

- Client-reported (`src/lib/share-analytics.ts`, fire-and-forget):
  `link_opened`, `button_clicked`, `auth_started`, `auth_completed`, `failed`.
- Server-recorded (authoritative, on `/watchlists/track`):
  `watchlist_added`, `already_in_watchlist`.

## Extending to new action types

The pending-action store is generic. To add e.g. "follow analyst":

1. Add the action type to `PendingActionType` in `src/lib/pending-action.ts`.
2. Create the deep-link page (e.g. `/follow/analyst/:id`) that (a) stores
   `{ type, params, attribution, resumePath }` for anonymous visitors and
   redirects to auth, and (b) executes + clears the action when authed —
   that page is the single execution point for its type.
3. Back it with an idempotent API endpoint.

No auth-flow changes are needed — `resolvePostAuthPath()` already returns
users to any action's `resumePath`.

## Tests

- API: `services/api/tests/test_share.py` (share info, analytics sanitization,
  track idempotency, no-ID leakage).
- Web: `npm test` (vitest) — `src/lib/__tests__/share.test.ts`,
  `src/lib/__tests__/pending-action.test.ts`,
  `src/app/embed/[symbol]/route.test.ts`.
