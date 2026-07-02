# API Changes

## 2026-06-24

### POST /auth/google

Now accepts either `{ "code": "..." }` (authorization code from OAuth popup flow) or `{ "token": "..." }` (ID token from old renderButton flow). The code flow is preferred — the frontend now uses `google.accounts.oauth2.initCodeClient` with a custom button.

## 2026-07-02

### User object (`/auth/*` responses, `GET /auth/me`)

Now includes `picture_url` (string | null) — the Google account photo, captured on Google login and refreshed when it rotates. Null for email/password and Apple users.
