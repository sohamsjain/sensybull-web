# Sensybull Web Frontend

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Socket.IO client for real-time filing events
- JWT auth (access + refresh tokens in localStorage)

## API
- Base URL: `NEXT_PUBLIC_API_URL` (default: `https://api.sensybull.com/api/v1`)
- Auth: `POST /auth/login`, `/auth/register`, `/auth/google`, `/auth/refresh`, `GET /auth/me`
- Events: `GET /events/` (auth, watchlist-filtered), `/events/all` (public), `/events/types` (small canonical category list — backs the feed's event-type chips), `/events/company/:id` (auth, per-company history). Every event carries a boolean `important` (backs the feed's All/Important toggle — use `isImportant()` from `src/lib/event-actions.ts`, which handles legacy payloads) and `event_types` (use `matchesEventType()` from `src/hooks/use-events.ts`). Only the 8-K family is ingested among SEC forms since the July 2026 rollback; older events keep other `signal_type` values. Press releases arrive as `signal_type="PR"` (`source` = wire name, `edgar_url` = article URL; use `filedPhrase()` from `src/lib/forms.ts` for "filed/issued" copy). A PR event gains `filing_url` once its SEC filing arrives — delivered via socket event `filing_event_update` (same payload shape; replace by `id` in state)
- Watchlists: CRUD at `/watchlists/`, company management at `/watchlists/:id/companies`
- Companies: `GET /companies/?q=...` (search by ticker or name), `GET /companies/search?q=` (typeahead), `GET /companies/:id/bars` (chart OHLCV), `GET /companies/:id/quote` (last price + day change; `change_pct` is null when there's no previous close, `stale: true` when it's the daily-synced price rather than a live one)
- Alerts: `GET/PUT /alerts/preferences`, `GET /alerts/notifications`, `GET /alerts/channels`, Web Push at `/alerts/push/*` (see `src/lib/push.ts` + `public/sw.js`). The sensitivity UI is binary (Important only ↔ Everything) mapped onto the API's `max_tier` (1 ↔ 3)
- Events (single): `GET /events/all/:id` (public, permalinks)
- Watchlist inbox: `GET /watchlist/` (companies + unread counts under `items`), `POST /watchlist/:companyId/read`, `PUT /watchlist/:companyId/mute`. Bulk counterparts back multi-select — `POST /watchlist/read`, `PUT /watchlist/mute`, `POST /watchlist/remove`, all taking `{company_ids}` — and drop ids the user no longer follows instead of failing the batch (trust the echoed `company_ids`)
- Share links: `GET /share/:symbol` (public share info, no internal IDs), `POST /watchlists/track` (auth, idempotent add-by-ticker), `POST /share/events` (public funnel analytics). See `docs/TRACK_LINKS.md`
- WebSocket: Socket.IO namespace `/feed`, auth via `{token}` dict, events: `filing_event`, `filing_event_update`, `connected`, `price_reaction`. The `/feed` socket is owned once at the dashboard layout by `SocketProvider` (`useSocket`) and shared by all pages — it persists across client-side navigation
- Removed (July 2026 hard rollback — do not re-add without an explicit decision): all `/positions/*` endpoints, the `thesis_alert` socket event, `GET /events/catalysts`, and `GET /movers`

## Project Structure
- `src/types/` — API and event type definitions
- `src/lib/` — API client (auto-refresh on 401), Socket.IO wrapper, utilities; `event-actions.ts` (isImportant, AI-chat copy prompt, share/permalink helpers); `deal-terms.ts` (label/value/order rules for `briefing.deal_terms` — Title Case values, snake_case keys; mirrors the API's `app/utils/deal_terms.py`, keep in sync. Both the Deal Terms panel and the AI-chat prompt read terms through `dealTermEntries()`)
- `src/hooks/` — useAuth, useSocket, useEvents (REST+Socket merge), useWatchlists, useWatchlistInbox (inbox + live unread + bulk actions), useWatchlistSelection (multi-select mode; range logic in `src/lib/selection.ts`), useCompanyEvents (per-company history), usePaneWidth (resizable pane), useBars (chart data), useQuote (header price; polls 60s, pauses on hidden tabs)
- `src/context/` — AuthProvider (login/register/google/logout), SocketProvider (session-wide `/feed` socket + `useSocket`)
- `src/components/ui/` — shadcn/ui primitives
- `src/components/feed/` — FilingCard (flat row, no box), FilingList (divider-separated), FeedToolbar (All/Important + search + event-type chips), UpdateActions (Read the filing / Copy for AI chat / Share — shown only on expanded updates), CatalystsTable ("Key dates"), DealTerms, PriceReactionStrip, CompanyLogo
- `src/components/watchlist/` — WatchlistPanel, WatchlistItem, WatchlistBulkBar, Conversation, FilingMessage, CompanyAvatar
- `src/components/company/` — CompanySheet, PriceChart, StockQuote (price + day change in the conversation header; formatters in `src/lib/quote.ts`)
- `src/components/layout/` — NavRail, BottomTabs
- `src/components/auth/` — Login/register/forgot-password forms
- `src/app/(auth)/` — Auth pages (centered layout, no sidebar)
- `src/app/(dashboard)/` — Dashboard pages (nav rail + main)
  - `/watchlist` — default landing for signed-in users; two-pane UI (resizable/collapsible company list + filing history), chart toggle swaps the right pane for a full-size price chart (`/chats` redirects here). The company list has a "Select" mode for acting on several companies at once (mute/unmute, mark read, remove); it lives in WatchlistPanel because ranges and "select all" follow the panel's own filters, and the page only learns whether the mode is on so its ↑/↓/Esc shortcuts stand down
  - `/feed` — public live stream of all events in received order; All/Important toggle, event-type chips, and search, no sidebar. Substack/Twitter-style flat list: rows separated by simple dividers, no card boxes
  - `/e/[id]` — public per-event permalink (backed by GET /events/all/:id), rendered expanded
- `src/app/add/[symbol]/` — public "Track on Sensybull" deep link (`/add/MU`): SEO/OG page + client flow that adds the ticker to the watchlist, preserving intent through auth via `src/lib/pending-action.ts` (see `docs/TRACK_LINKS.md`)
- `src/app/embed/[symbol]/` — iframe-able track button (route handler, frameable by design; header carve-out in next.config.ts)
- `src/components/share/` — TrackButton, ShareDialog (company sheet), AddFlow
- `src/lib/share.ts` (canonical link/snippet builders) + `src/lib/share-analytics.ts` (funnel events); global toast in `src/components/ui/app-toaster.tsx` (mounted in root layout)
- Removed pages (July 2026): `/positions` (thesis feature, hard rollback), `/calendar` (catalyst calendar; key dates live inside updates and the company sheet), `/movers` (today's gainers/losers among recent filers — removed with the `GET /movers` API endpoint)

## Product rules (see PRODUCT_VISION.md)
- Updates collapse to headline-only; summary, key dates, and action buttons appear only when expanded. No per-update "investor takeaway" bullets, no significance explainers
- Priority is binary: an update is Important or it isn't. Never reintroduce HIGH/MED/LOW in the UI
- Every expanded update gets UpdateActions (source link, copy-for-AI-chat, share) — keep feed cards and watchlist messages identical here

## Related Projects
- Backend API: ~/Projects/sensybull-api (Flask)
- API changes log: see API_CHANGES.md in this repo
- When unsure about an endpoint's shape, read the backend route file directly

## Conventions
- Files: kebab-case. Exports: PascalCase for components, camelCase for hooks/utils
- All dashboard/auth components are client components (`"use client"`)
- Filter state (All/Important + event type + search) lives in `(dashboard)/layout.tsx` via React context (URL params `f`, `t`, `q`)
- Dual theme (class-based dark mode). Accent: indigo, reserved for interactive elements; selected states are solid indigo with white text/icon — selection contrast must be obvious at a glance. Decorative color is avoided: category/form tags are plain muted text, red is reserved for the Important marker and negative price data, emerald appears only on positive price data. Dark surfaces: #0b0d12 base, #12141b/#14161c cards, #1a1d25 hover
- The UI presents a single watchlist (adds go to the user's first list via `src/lib/default-watchlist.ts`); the API still supports multiple lists
- Brand assets: `public/logo.png` is the bull mark on a transparent background, black ink — surfaces flip it to white with Tailwind's `invert`/`dark:invert`, which leaves the alpha alone. `public/logo-tile.png` is the opaque counterpart (dark tile, white bull) for surfaces that paint their own background: the OG/Twitter card image and the Web Push notification icon in `public/sw.js`. `src/app/favicon.ico` (16→256 frames) and `src/app/apple-icon.png` are the same tile, wired up by Next's file conventions — the mark is ~1.9:1, so it reads as a soft silhouette in a 16px tab. Never give the mark a baked-in background
- Unit tests: `npm test` (vitest, `src/**/*.test.ts`)
