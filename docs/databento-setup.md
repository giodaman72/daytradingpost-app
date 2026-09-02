# Databento historical-data setup

The research workbench supports daily OHLCV bars for a bounded CME Globex
universe: ES, NQ, YM, CL, NG, GC, SI, and HG. Each selection uses Databento's
calendar front-month continuous symbol (for example, `ES.c.0`) with the
`GLBX.MDP3` dataset and `ohlcv-1d` schema.

## Production configuration

Set `DATABENTO_API_KEY` as a server-only environment variable in the hosting
platform. Never prefix it with `NEXT_PUBLIC_`, commit it, or send it to browser
code. Set `DATABENTO_MAX_REQUEST_COST_USD` to the maximum permitted estimated
cost for one request; the default is `$1`.

The API calls `metadata.get_cost` before requesting bars and rejects requests
over the ceiling. Successful responses are cached for one hour, ranges are
limited to 30 days through 10 years, and the returned record count is capped.

Public redistribution or display of exchange data may require separate market
data licensing. This integration is intended for historical research and
backtesting; confirm exchange entitlements before expanding it into live or
public quote distribution.
