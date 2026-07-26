# Advanced charting system

Sprint 14 uses the canonical instrument registry and a hybrid provider model:

- TradingView public widgets provide third-party interactive charts with visible
  attribution. DayTradingPost does not own that data.
- The first-party SVG renderer consumes only normalized `ChartCandle` records.
  Production currently has quote snapshots, not licensed historical OHLC, so it
  shows an unavailable state instead of fabricating candles.
- `CHART_PROVIDER=development` enables deterministic delayed fixtures only
  outside production.

No TradingView Charting Library package, proprietary file, scraped endpoint,
broker connection, automated trading, or trade execution is included.

`GET /api/charts/bars` validates canonical instruments and timeframes, bounds
history and bar counts, rate-limits callers, and returns normalized data with
source, delayed, fixture and market-status metadata. Saved layouts are
provider-neutral JSON with payload limits. Owner-scoped API queries enforce
membership limits. Sharing is premium-only, uses opaque IDs, strips owner
identity/private alert state, and can be revoked.

Supported intervals are 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w and 1M, subject to
the provider. Indicators are SMA, EMA, Bollinger Bands, RSI, MACD, ATR, Volume
and VWAP. Pure calculations currently cover SMA, EMA, Bollinger Bands and RSI.

Editorial, economic and owned-alert normalizers preserve source IDs and
timestamps. Premium editorial and alert overlays require authorization.

Apply `docs/supabase-chart-layouts.sql` before enabling persistence. Legal and
product owners must review TradingView widget terms, attribution, symbol
availability and market-data entitlements.

Known limitations include no production historical OHLC adapter, drawing tools,
multi-chart layouts, screenshot export, live streaming candles or broker
integration. Downgrades retain layouts but block writes beyond the plan limit.
