# Sensybull Web Frontend

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Socket.IO client for real-time filing events
- JWT auth (access + refresh tokens in localStorage)

## API
- Base URL: `NEXT_PUBLIC_API_URL` (default: `https://api.sensybull.com/api/v1`)
- Auth: `POST /auth/login`, `/auth/register`, `/auth/google`, `/auth/refresh`, `GET /auth/me`
- Events: `GET /events/` (auth, watchlist-filtered), `/events/all` (public), `/events/types`, `/events/catalysts`, `/events/company/:id` (auth, per-company history)
- Watchlists: CRUD at `/watchlists/`, company management at `/watchlists/:id/companies`
- Companies: `GET /companies/?q=...` (search by ticker or name), `GET /companies/search?q=` (typeahead)
- Alerts: `GET/PUT /alerts/preferences`, `GET /alerts/notifications`, `GET /alerts/channels`, Web Push at `/alerts/push/*` (see `src/lib/push.ts` + `public/sw.js`)
- Events (single): `GET /events/all/:id` (public, permalinks)
- Watchlist inbox: `GET /watchlist/` (companies + unread counts under `items`), `POST /watchlist/:companyId/read`, `PUT /watchlist/:companyId/mute`
- Positions: CRUD at `/positions/` (holdings + thesis, free text or structured `{core_claim, assumptions, kill_criteria, horizon}`), `GET /positions/assessments` (recent thesis-break assessments; retroactive backtests excluded by default), `GET /positions/:id/assessments` (per-position history incl. backtests), `GET /positions/:id/versions` (thesis revisions), `POST /positions/draft-thesis` (AI: raw notes → structured thesis), `POST /positions/:id/analyst` (per-position analyst chat, stateless — send full history), `GET /positions/scorecard` (verdicts vs subsequent 1d/1w price moves). Assessments are two-stage: cheap triage, then a deep pass (full filing text + price reaction) with per-assumption verdicts, confidence, and verbatim citations.
- WebSocket: Socket.IO namespace `/feed`, auth via `{token}` dict, events: `filing_event`, `connected`, `thesis_alert` (a filing moved a held thesis). The `/feed` socket is owned once at the dashboard layout by `SocketProvider` (`useSocket`) and shared by all pages — it persists across client-side navigation. `thesis_alert` surfaces a global toast anywhere in the app and live-refreshes the Positions page.

## Project Structure
- `src/types/` — API and event type definitions
- `src/lib/` — API client (auto-refresh on 401), Socket.IO wrapper, utilities
- `src/hooks/` — useAuth, useSocket, useEvents (REST+Socket merge), useWatchlists, useWatchlistInbox (inbox + live unread), useCompanyEvents (per-company history), usePositions (holdings + thesis + thesis-break assessments), usePaneWidth (resizable pane)
- `src/context/` — AuthProvider (login/register/google/logout), SocketProvider (session-wide `/feed` socket + `useSocket` + global thesis-alert toaster)
- `src/components/ui/` — shadcn/ui primitives
- `src/components/feed/` — FilingCard, FilingList, badges
- `src/components/watchlist/` — WatchlistPanel, WatchlistItem, Conversation, FilingMessage, CompanyAvatar
- `src/components/movers/` — MoverList/MoverRow (shared by /movers page)
- `src/components/positions/` — AddPosition (typeahead + thesis capture), ThesisEditor (structured thesis + "Structure with AI" drafting), PositionCard (assumption verdicts, citations, versions, next catalyst), AnalystPanel (per-position chat), ScorecardStrip, ThesisBadge/ImpactLabel
- `src/components/layout/` — NavRail, BottomTabs
- `src/components/auth/` — Login/register/forgot-password forms
- `src/app/(auth)/` — Auth pages (centered layout, no sidebar)
- `src/app/(dashboard)/` — Dashboard pages (nav rail + main)
  - `/watchlist` — default landing for signed-in users; two-pane UI (resizable/collapsible company list + filing history), chart toggle swaps the right pane for a full-size price chart (`/chats` redirects here)
  - `/positions` — holdings + investment thesis per company (structured: core claim, assumptions, kill criteria; AI drafting assist). Filings are judged against each thesis by the API in two stages (triage → deep read of the full filing), positions whose thesis is threatened/broken float to the top, each assumption carries its latest verdict, and new theses are backtested against recent filings. Includes the track-record strip and a per-position analyst chat. Held companies also surface their thesis in the watchlist inbox (status badge on the conversation header, verdict line on judged filings)
  - `/feed` — public live stream of all events in received order (no watchlist filtering)
  - `/movers` — today's gainers/losers among recent filers
  - `/calendar` — upcoming-catalyst agenda across all tracked filings
  - `/e/[id]` — public per-event permalink (backed by GET /events/all/:id)

## Related Projects
- Backend API: ~/Projects/sensybull-api (Flask)
- API changes log: see API_CHANGES.md in this repo
- When unsure about an endpoint's shape, read the backend route file directly

## Conventions
- Files: kebab-case. Exports: PascalCase for components, camelCase for hooks/utils
- All dashboard/auth components are client components (`"use client"`)
- Filter state lives in `(dashboard)/layout.tsx` via React context
- Dual theme (class-based dark mode). Accent: indigo, reserved for interactive elements. Decorative color is avoided: category/form tags are plain muted text, only High materiality gets a restrained red, emerald/red appear only on price/sentiment data. Dark surfaces: #0b0d12 base, #12141b/#14161c cards, #1a1d25 hover
- The UI presents a single watchlist (adds go to the user's first list via `src/lib/default-watchlist.ts`); the API still supports multiple lists
