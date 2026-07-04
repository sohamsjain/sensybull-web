# Sensybull Web

The production frontend for Sensybull — a real-time SEC filing intelligence app.
Next.js (App Router) + TypeScript + Tailwind CSS, with a WhatsApp-style chat
inbox, a chronological filing feed, catalyst calendar, and live filing events
over Socket.IO.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + shadcn/ui primitives
- **Socket.IO client** for real-time `filing_event` delivery
- JWT auth: short-lived access token (bearer header) + refresh token in an
  httpOnly cookie

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | ESLint                               |

## Environment

See `.env.example`. All are `NEXT_PUBLIC_` (client-visible by design):

- `NEXT_PUBLIC_API_URL` — API base URL, including the `/api/v1` suffix.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_APPLE_CLIENT_ID` — OAuth client IDs.
- `NEXT_PUBLIC_LOGO_DEV_TOKEN` — logo.dev publishable token for company logos.

## Project layout

- `src/app/` — routes: `(auth)`, `(dashboard)` (`/chats`, `/feed`, `/calendar`,
  `/e/[id]`), `(legal)`.
- `src/components/` — by domain: `ui/`, `feed/`, `chat/`, `auth/`, `alerts/`,
  `watchlist/`, `layout/`, `company/`, `landing/`.
- `src/hooks/`, `src/lib/` (API client, socket, push), `src/types/`,
  `src/context/` (auth).

The backend API lives in the separate `sensybull-api` repo; endpoint changes are
tracked in [`API_CHANGES.md`](./API_CHANGES.md).
