# TradingView Advanced Charting Library

> **Status:** Design, August 2026. Not yet implemented.
> **Backend counterpart:** `docs/vault/Market Data Layer.md` in sensybull-api.

The plan for replacing the full-pane `lightweight-charts` view with
TradingView's Advanced Charting Library, fed by the new `/api/v1/md/*`
market-data endpoints.

---

## Scope: two charts, not one

Keep **both** charting libraries. They solve different problems:

| Surface | Library | Why |
|---|---|---|
| `CompanySheet` inline strip (220px) | `lightweight-charts` | ~45 KB, already integrated, no license |
| `/watchlist` full-pane chart | Advanced Charting Library | drawings, indicators, timeframe switching, marks |

The ACL is roughly 2 MB of JavaScript. Loading it to render a 220px sparkline
is the wrong trade. Loading it for a chart the user is actively working in is
the right one.

---

## Licensing — start here, it blocks everything

The Advanced Charting Library is **not on npm**. It requires:

1. Signing TradingView's free license agreement at tradingview.com/advanced-charting-library
2. Being granted access to the private `tradingview/charting_library` repo
3. Vendoring the built files into this repo — they are **not redistributable**,
   so the directory needs a `.gitignore` decision (commit-and-keep-private vs.
   fetch-at-build-time) before any code is written

Approval is not instant. Apply before the backend work starts, not after.

Requirements that come with the license and affect the UI:

- The TradingView attribution/logo must remain visible.
- The data source must be attributed.
- **Delayed data must be labeled as delayed.** Stocks Starter is 15-minute
  delayed, so this applies to us from day one — see below.

---

## Layout

```
public/
  charting_library/          # vendored, licensed
  datafeeds/udf/             # TradingView's reference UDF adapter
src/
  components/company/
    tv-chart.tsx             # client component, dynamic(ssr:false)
  lib/datafeed/
    sensybull-datafeed.ts    # UDFCompatibleDatafeed + streaming override
    streaming.ts            # Socket.IO /md subscription bookkeeping
    theme.ts                 # widget overrides matching the app palette
```

### Why the UDF adapter rather than a hand-written datafeed

The backend serves UDF-shaped JSON specifically so this side can subclass
TradingView's reference `UDFCompatibleDatafeed`. That adapter already implements
range merging, request chunking, and its own bar cache. Writing the raw JS
datafeed API by hand means reimplementing all of it. We override exactly two
methods — `subscribeBars` and `unsubscribeBars` — to swap polling for the
Socket.IO stream.

```ts
class SensybullDatafeed extends UDFCompatibleDatafeed {
  subscribeBars(symbolInfo, resolution, onTick, uid, onResetCacheNeeded) {
    subscribeToStream(symbolInfo.ticker, resolution, uid, onTick);
  }
  unsubscribeBars(uid) {
    unsubscribeFromStream(uid);
  }
}
```

### Next.js integration

The library is a plain script, not an ES module, and it touches `window` at
load. So:

- `tv-chart.tsx` is `"use client"` and imported via
  `dynamic(() => import("./tv-chart"), { ssr: false })`.
- The library loads with `next/script` from `/charting_library/charting_library.js`,
  and the widget is constructed in a `useEffect` after `onLoad` fires.
- `next.config.ts` needs no change — the files are static assets under `public/`.

---

## Streaming

The `/md` Socket.IO namespace is **separate from `/feed`**. `SocketProvider`
owns `/feed` for the whole dashboard; market data gets its own connection,
opened lazily when a chart first mounts and closed when the last one unmounts.
Filing alerts must not queue behind a burst of bar updates.

```
tv-chart mounts
  → datafeed.subscribeBars(NVDA, "5")
  → socket /md emit "subscribe" {symbol:"NVDA", resolution:"5"}
  → server joins room md:NVDA:5
  → on "bar" → onTick({time, open, high, low, close, volume})
```

The **server** does the resolution bucketing, so `onTick` always receives a bar
already aligned to the resolution the chart is displaying. This matters: the
common failure mode in TradingView integrations is a client that folds 1-minute
ticks into higher timeframes itself and drifts out of agreement with the
historical bars, which shows up as the last candle jumping when the user
switches timeframe.

---

## Filing marks — the reason to do this

`price-chart.tsx` currently pins filing events to bars by hand, walking the bar
array to find the last bar at or before each `filing_date`. `getMarks` is
TradingView's native slot for exactly this, and it is strictly better: hover
text, per-mark color, proper z-ordering, and it survives pan and zoom without
recomputation.

The backend serves `GET /md/marks?symbol=&from=&to=&resolution=` from
`filing_event`. Carry over the existing conventions unchanged:

- Colour by `briefing.sentiment` — emerald / red / slate-400
- Label text from `briefing.primary_event_type` for important events
- Use `isImportant()` from `src/lib/event-actions.ts` for the important test

Clicking a mark should scroll the conversation pane to that update. That
interaction — chart and filing history as two views of one timeline — is the
thing a generic charting integration cannot do, and it is worth building in the
same phase as the chart rather than deferring.

---

## Delayed data labelling

Stocks Starter is 15-minute delayed. The backend sets
`data_status: "delayed_streaming"` on the symbol info, which makes the library
render its standard delayed badge. Do not override or hide it.

If the plan is later upgraded to a real-time tier, this becomes `"streaming"`
from the backend and nothing changes here.

---

## Theming

The widget takes `overrides` and a `custom_css_url`. Match the existing palette
(see CLAUDE.md):

| Element | Light | Dark |
|---|---|---|
| Background | transparent | transparent |
| Up candle | `#10b981` | `#10b981` |
| Down candle | `#ef4444` | `#ef4444` |
| Grid | `rgba(15,23,42,0.05)` | `rgba(255,255,255,0.04)` |
| Toolbar / panes | white | `#12141b` |

Theme switching follows `next-themes`: the widget is recreated on theme change
rather than restyled, which is what TradingView's API supports cleanly.

Keep `disabled_features` tight — the goal is a working chart, not a trading
terminal. Start by disabling `header_symbol_search` (we have our own search),
`header_compare`, and `use_localstorage_for_settings` until saved layouts are a
deliberate feature.

---

## Rollout

Ship behind a feature flag, side by side with the current chart:

1. Vendor the library, get `tv-chart.tsx` rendering static history from
   `/md/history`.
2. Add `/md/marks` and mark→conversation click-through.
3. Add streaming via `/md`.
4. Flip the flag, delete the full-pane `lightweight-charts` branch of
   `price-chart.tsx`, keep the inline strip.

---

## API surface this depends on

All new, all under `/api/v1/md` — see `API_CHANGES.md` once implemented.

| Endpoint | Used by |
|---|---|
| `GET /md/config` | `onReady` |
| `GET /md/symbols?symbol=` | `resolveSymbol` |
| `GET /md/search?query=` | `searchSymbols` |
| `GET /md/history?symbol&resolution&from&to&countback` | `getBars` |
| `GET /md/marks?symbol&from&to&resolution` | `getMarks` |
| `GET /md/time` | `getServerTime` |
| `GET /md/quotes?symbols=` | watchlist header (replaces `/companies/:id/quote`) |
| Socket.IO `/md`, event `bar` | `subscribeBars` |
