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
- Chats: `GET /chats/` (inbox: watchlist companies + unread counts), `POST /chats/:companyId/read`, `PUT /chats/:companyId/mute`
- WebSocket: Socket.IO namespace `/feed`, auth via `{token}` dict, events: `filing_event`, `connected`

## Project Structure
- `src/types/` — API and event type definitions
- `src/lib/` — API client (auto-refresh on 401), Socket.IO wrapper, utilities
- `src/hooks/` — useAuth, useSocket, useEvents (REST+Socket merge), useWatchlists, useChats (inbox + live unread), useCompanyEvents (per-company history)
- `src/context/` — AuthProvider (login/register/google/logout)
- `src/components/ui/` — shadcn/ui primitives
- `src/components/feed/` — FilingCard, FilingList, badges
- `src/components/chat/` — WhatsApp-style chats: ChatList, ChatConversation, ChatMessage, ChatAvatar
- `src/components/layout/` — TopBar, Sidebar, MobileNav
- `src/components/watchlist/` — Watchlist CRUD components
- `src/components/auth/` — Login/register/forgot-password forms
- `src/app/(auth)/` — Auth pages (centered layout, no sidebar)
- `src/app/(dashboard)/` — Dashboard pages (topbar + sidebar + main)
  - `/chats` — default landing for signed-in users; two-pane chat UI (list + conversation), self-contained layout (no watchlist sidebar/feed filters)
  - `/feed` — chronological all-events feed (public for guests)
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
- Dual theme (class-based dark mode). Accent: indigo, reserved for interactive elements; red/amber = materiality, emerald/red = sentiment. Dark surfaces: #0b0d12 base, #12141b/#14161c cards, #1a1d25 hover
