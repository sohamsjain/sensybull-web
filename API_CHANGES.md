# API Changes

Cumulative log of backend API changes. Check this when starting frontend work.
For full endpoint details, read the route files directly at `~/Projects/sensybull-api/services/api/app/routes/`.

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
