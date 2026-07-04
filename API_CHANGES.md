# API Changes

## 2026-07-04

### Refresh token moved to an httpOnly cookie (breaking — coordinated web deploy required)

The refresh token is **no longer returned in the JSON body** of `POST /auth/login`,
`/auth/register`, `/auth/google`, `/auth/apple`. It is now set as an httpOnly,
CSRF-protected cookie (`refresh_token_cookie`, scoped to `/api/v1/auth`). The access
token is still returned in the body for the `Authorization: Bearer` header.

- `POST /auth/refresh` reads the refresh token from the cookie. Browser calls must use
  `credentials: 'include'` and send the CSRF header `X-CSRF-TOKEN` = value of the
  non-httpOnly `csrf_refresh_token` cookie. (A bearer `Authorization` refresh token is
  still accepted and bypasses CSRF, e.g. for non-browser clients.)
- **`POST /auth/logout` (new)** — revokes the current refresh token server-side
  (blocklisted by `jti`) and clears the auth cookies. Send with the refresh cookie +
  CSRF header (or bearer refresh token). Idempotent-ish: returns `{ "message": "Logged out" }`.
- Refresh-token lifetime shortened from 999 days to 60 (configurable via `JWT_REFRESH_DAYS`).
- CORS now sends `Access-Control-Allow-Credentials: true`; the frontend must include
  credentials on authed requests for the cookie to flow.

### Auth endpoints now rate-limited

`POST /auth/login`, `/auth/register`, `/auth/google`, `/auth/apple` return `429` past
`10/minute` (or `50/hour`) per IP.

### GET /users/ now admin-only

Returns `403` for non-admin authenticated users (was any authenticated user).

## 2026-06-24

### POST /auth/google

Now accepts either `{ "code": "..." }` (authorization code from OAuth popup flow) or `{ "token": "..." }` (ID token from old renderButton flow). The code flow is preferred — the frontend now uses `google.accounts.oauth2.initCodeClient` with a custom button.

## 2026-07-02

### User object (`/auth/*` responses, `GET /auth/me`)

Now includes `picture_url` (string | null) — the Google account photo, captured on Google login and refreshed when it rotates. Null for email/password and Apple users.

### GET /events/all/:eventId (new, public)

Single event by id without auth — backs the frontend's shareable `/e/:id` permalink pages. Response: `{ "event": <FilingEvent payload> }`, 404 if unknown.

## 2026-07-03

### Alpaca market data integration

New env vars on the API: `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`, `ALPACA_FEED` (default `iex`; set `sip` on paid plans).

### Event payload (`GET /events/*`, `filing_event` socket event)

Three new fields on every event:

- `market_cap` (number | null) — from the joined company (EDGAR shares outstanding × Alpaca last price, refreshed by the daily cron).
- `price_reactions` (object) — completed measurements keyed by interval (`5m`, `15m`, `30m`, `1h`, `1d`, `1w`), each `{ pct, price, measured_at, explosive }`. For after-hours filings, early intervals resolve to the next available print; `measured_at` records when it actually traded. Populates over time after the event lands.
- `explosive` (boolean) — true when any measured interval moved ≥ 2× the 14-day ATR.

### Socket event `price_reaction` (new, namespace `/feed`)

Emitted to the `public` and `ticker:<TICKER>` rooms whenever a measurement completes: `{ filing_event_id, ticker, price_reactions, explosive }`. Merge into already-rendered events by id.

### Company object (`GET /companies/*`)

Now includes `market_cap`, `last_price`, `shares_outstanding` (all nullable).

### GET /movers?limit=10 (new, public)

Event-driven top gainers/losers: companies with a filing event in the last 7 days, ranked by today's price change. Response: `{ as_of, gainers: [...], losers: [...] }`; each mover is `{ ticker, company_name, company_id, price, change_pct, event: { id, headline, significance, primary_event_type, filing_date } | null }`. Cached 2 minutes server-side; 503 if Alpaca is down with no cached copy.

### GET /companies/:id/bars (new, auth)

OHLCV bars for the company's ticker, proxying Alpaca with a 5-minute cache. Params: `timeframe` (`1D` | `1H` | `15Min`, default `1D`), `lookback` (`1M` | `3M` | `6M` | `1Y`, default `3M`). Response: `{ ticker, timeframe, lookback, bars: [{ t, o, h, l, c, v }] }`. 422 `{ "error": "no_ticker" }` for companies without a ticker.

## 2026-07-03 (later)

### Multi-form ingest — new `signal_type` values

Events are no longer 8-K-only. `signal_type` on event payloads (and the `signal_type` query param on `GET /events/*`) now also takes: `SC 13D`, `SC 13D/A`, `SC 13G`, `SC TO-T`, `SC TO-I`, `SC 14D9`, `SC 13E3`, `S-4`, `PREM14A`, `DEFM14A`, `PREC14A`, `DEFC14A`, `DFAN14A`, `25`, `25-NSE`, `15-12B`, `15-12G`, `15F-12B`, `NT 10-K`, `NT 10-Q`, `CB`, `4` (Form 4 insider buys). Non-8-K events have `items: []` and a form-level `max_tier`; they get price reactions and market-cap data like any other event. Use `formPhrase`/`formTag` from `src/lib/forms.ts` for display.

### GET /events/types

Two new labels in the canonical list: `"Insider Buying"`, `"Late Filing"`.

### Event payload

New optional field `filed_by` (string, ingest-side) — the filer's name when it differs from the subject company (13D reporting person, tender bidder, proxy dissident). Not yet persisted/exposed by the API model; reserved for future use.

## 2026-07-04

### Chats renamed to Watchlist inbox

- `GET /watchlist/`, `POST /watchlist/:companyId/read`, `PUT /watchlist/:companyId/mute` replace the `/chats` endpoints. The inbox list moved from the `chats` response key to `items` (same entry shape).
- The old `/api/v1/chats/*` prefix and the `chats` response key still work as a temporary compat alias; they will be removed after this frontend deploys.
- Alert channel deep links now point at `/watchlist`.

### GET /events/all — ordering change

Now ordered by `created_at` (when the event was received) instead of `filing_date`, so REST pages line up with the live socket stream. `/events/` and `/events/company/:id` keep `filing_date` ordering.

### Briefing headlines

The ingest prompt no longer asks for semicolon-separated facts; new headlines are single plain-English sentences. Stored headlines are unchanged and age out naturally.

### Positions — holdings + investment thesis (new)

New `Position` resource: a user's stake in a company plus the *thesis* for
holding it. This is the primitive that lets the platform reason for an
investor (thesis-break detection, personalized materiality) rather than only
inform. One position per (user, company).

- `GET  /positions/` — list the user's positions; optional `?thesis_status=intact|watch|broken` filter. Returns `{ positions: [...] }`, each with a nested `company` and thesis fields.
- `POST /positions/` — open a position. Body: `company_id` (required), plus optional `direction` (`long`|`short`, default `long`), `shares`, `cost_basis`, `thesis`, `opened_at`, `notes`. Idempotent per company: re-posting the same `company_id` updates the existing position (200) instead of creating a duplicate (201).
- `GET  /positions/:id` — single position (owner only).
- `PUT  /positions/:id` — update `direction`/`shares`/`cost_basis`/`thesis`/`thesis_status`/`opened_at`/`notes`. Setting `thesis_status` stamps `thesis_reviewed_at`.
- `DELETE /positions/:id` — close (delete) a position.

Position fields: `id`, `company_id`, `direction`, `shares` (string decimal), `cost_basis` (string decimal), `thesis`, `thesis_status` (`intact`|`watch`|`broken`, server-managed), `thesis_reviewed_at`, `opened_at`, `notes`, `created_at`, `updated_at`, nested `company`.

`thesis_status` is the anchor for the forthcoming thesis-break engine: incoming filings for a held company will be evaluated against the thesis and can flip the status to `watch`/`broken`, firing a distinct alert.

### Thesis-break engine — filings judged against your thesis (new)

When a filing event is stored for a company a user holds (has a `Position`
with a non-empty `thesis`), the API now evaluates the filing against that
thesis via Groq and records a `ThesisAssessment`. Runs independently of
watchlist membership — a held position is watched by definition — and off
the real-time path, so it never delays event delivery.

**Impact verdicts:** `supports` | `neutral` | `threatens` | `breaks`.
The engine only ever *escalates* `thesis_status` (never auto-heals):
`threatens` → `watch`, `breaks` → `broken`; `supports`/`neutral` record an
assessment but leave status unchanged.

New read endpoints (on the positions blueprint):
- `GET /positions/assessments` — recent thesis assessments across all your positions. Optional `?impact=` filter and `?limit=` (default 50, max 200). Returns `{ assessments: [...] }`.
- `GET /positions/:id/assessments` — assessment history for one position, newest first.

Assessment shape: `id`, `position_id`, `filing_event_id`, `impact`, `rationale` (one sentence citing the filing), `prior_status`, `new_status`, `created_at`.

**New socket event** (namespace `/feed`): `thesis_alert`, emitted to the
owner's `user:<id>` room when a filing `threatens` or `breaks` a thesis.
Payload: `position_id`, `company_id`, `ticker`, `company_name`, `impact`,
`rationale`, `thesis_status`, `filing_event_id`, `headline`.

Server-side dependency: the engine self-disables (records nothing, never
errors) when Groq keys (`GROQ_API_KEYS`/`GROQ_API_KEY`) are unset, so no
client change is required to deploy the API safely.
