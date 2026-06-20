# API Changes

Cumulative log of backend API changes. Check this when starting frontend work.
For full endpoint details, read the route files directly at `~/Projects/sensybull-api/services/api/app/routes/`.

---

## 2026-06-20: Company Logos — Switched to Logo.dev

- `company.logo_url` field still exists in API responses but is **no longer
  populated** (Benzinga sync removed)
- Frontend now constructs logo URLs client-side via Logo.dev:
  `https://img.logo.dev/ticker/{TICKER}?token={TOKEN}&format=webp&size=128`
- Requires `NEXT_PUBLIC_LOGO_DEV_TOKEN` env var (publishable key from
  logo.dev/dashboard)
- Falls back to colored initials when Logo.dev has no image or token is unset

---

## 2026-06-11: Browser Web Push Channel

### New channel: "push"
- `GET /alerts/channels` now returns `["email", "push"]`; enable per user via
  the existing `PUT /alerts/preferences` channels dict
- Delivery payload: `{title, body, url, tag}` JSON; expired browser
  subscriptions are pruned automatically

### New: GET /api/v1/alerts/push/public-key
- Returns `{ public_key }` (VAPID); null when push isn't configured server-side

### New: POST /api/v1/alerts/push/subscriptions
- Body: `{ endpoint, keys: { p256dh, auth } }` (PushSubscription.toJSON() shape)
- Re-posting an existing endpoint re-claims it for the current user

### New: DELETE /api/v1/alerts/push/subscriptions
- Body: `{ endpoint }` — removes this browser's subscription

### Server env required
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, optional `VAPID_SUBJECT`
  (generate with `npx web-push generate-vapid-keys`)

---

## 2026-06-10: Chat-style Watchlist Endpoints

### New: GET /api/v1/chats/
- Every company across the user's watchlists, presented as a chat inbox
- Returns: `{ chats: [...], total_unread }` where each chat is
  `{ company: {id, ticker, name, cik}, last_event, last_activity_at, unread_count, muted, last_read_at }`
- `last_event` is a compact preview: `{ id, headline, significance, sentiment, primary_event_type, max_tier, signal_type, filing_date, received_at }`
- Sorted server-side: unread chats first, then most recent activity
- Unread = filing events received after `last_read_at` (no read state = full history)
- Auth: JWT required

### New: POST /api/v1/chats/:company_id/read
- Marks the company's history as read (sets `last_read_at` to now)
- Returns: `{ read_state: { company_id, last_read_at, muted } }`
- 403 if company not on the user's watchlists

### New: PUT /api/v1/chats/:company_id/mute
- Body: `{ muted: boolean }` — mutes/unmutes alert delivery for one company
- Muted companies are skipped by the alert dispatcher (all channels)
- 403 if company not on the user's watchlists

### Changed: POST /api/v1/watchlists/:id/companies
- Adding a company now initializes its read state (`last_read_at = now`),
  so pre-existing filing history doesn't show as unread for a fresh add.
  Re-adding never resets existing read/mute state.

---

## 2026-06-10: Company Search Improvements

### Changed: GET /api/v1/companies/
- New `?q=` param searches both ticker AND name (replaces ticker-only filter)
- Results ranked: exact ticker match > ticker prefix > name contains
- `?ticker=` still works (backward compat)
- Results paginated as before (`page`, `per_page`)

### New: GET /api/v1/companies/search?q=
- Typeahead endpoint for autocomplete dropdowns
- Returns: `{ results: [{ id, name, ticker }] }`
- Params: `q` (required, min 1 char), `limit` (default 10, max 50)
- Auth: JWT required

---

## 2026-06-10: Alert Notification System

### New: GET /api/v1/alerts/preferences
- Returns current user's alert preferences (auto-creates defaults on first call)
- Response: `{ preferences: { id, enabled, max_tier, channels, created_at, updated_at } }`
- `channels` is an object like `{ "email": true }`
- `max_tier` (1-3): alerts fire for events with tier <= this value (1=high priority only, 3=all)

### New: PUT /api/v1/alerts/preferences
- Update alert preferences (partial updates supported)
- Body: `{ enabled?: bool, max_tier?: 1|2|3, channels?: { email: bool } }`
- Validates channel names against available channels

### New: GET /api/v1/alerts/notifications
- Paginated notification history for the current user
- Params: `page`, `per_page`, `channel` (filter), `status` (filter: pending/sent/failed)
- Response: `{ notifications: [{ id, filing_event_id, channel, status, error_message, sent_at, created_at, filing_event: { id, ticker, company_name, max_tier, event_types, received_at } }], total, page, per_page }`

### New: GET /api/v1/alerts/channels
- Lists available notification channel names
- Response: `{ channels: ["email"] }`

### Behavior: Alerts auto-enabled on signup
- New users (both email registration and Google OAuth) get default alert preferences: `enabled=true, max_tier=3, channels={"email": true}`
