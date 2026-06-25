# API Changes

## 2026-06-25

### Second-order analysis + per-company thesis

**Filing events now carry deep analysis.** Every `FilingEvent` payload (REST
`/events/*`, per-company `/events/company/:id`, and the `filing_event` WebSocket
message) gains two fields:

- `analysis_status`: `"pending" | "done" | "failed"`.
- `analysis`: `null`, or an object:
  ```jsonc
  {
    "status": "done",
    "metrics": {
      "playbook": "debt_financing",
      "ratios": { "debt_to_equity": 0.5, "interest_coverage": 4.0, ... },
      "lines": ["Existing total debt: $1.00B; equity: $2.00B → D/E 0.50x", ...],
      "snapshot": { "as_of": "2025-03-31", "metrics": {...}, "missing": [...] }
    },
    "insight": {
      "insight": "…", "bull_points": ["…"], "bear_points": ["…"],
      "confidence": "medium", "caveats": ["…"]
    },
    "fundamentals_as_of": "2025-03-31",
    "thesis_revision_id": "…"
  }
  ```
  Ratios are computed deterministically from SEC XBRL companyfacts; the LLM only
  interprets them. Delivery is a "single combined message" — the event is fanned
  out once analysis is attached (a few seconds–minutes after filing). On failure
  the event still arrives with `analysis_status: "failed"` and `analysis: null`.

### GET /companies/:id/thesis  (auth)

Returns the company's evolving, unbiased investment thesis.

```jsonc
{
  "company_id": "…", "ticker": "AAPL", "name": "Apple Inc.",
  "current": {
    "id": "…", "version": 3, "narrative": "…(full self-contained story)…",
    "change_summary": "…", "points": { "bull": [], "bear": [], "uncertainties": [] },
    "as_of": "2025-03-31T00:00:00+00:00", "filing_event_id": "…", "created_at": "…"
  },
  "revisions": [ /* same shape, newest first — the story arc over time */ ]
}
```

Optional `?limit=` (default 50, max 200). `current` is `null` until the company
has its first material filing.

## 2026-06-24

### POST /auth/google

Now accepts either `{ "code": "..." }` (authorization code from OAuth popup flow) or `{ "token": "..." }` (ID token from old renderButton flow). The code flow is preferred — the frontend now uses `google.accounts.oauth2.initCodeClient` with a custom button.
