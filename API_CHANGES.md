# API Changes

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
