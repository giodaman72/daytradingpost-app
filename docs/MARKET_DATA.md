# Market Data Service

## Responsibility boundary

The Market Data Service owns provider-derived prices, previous close, daily
change, daily high/low, session status, provider identity, timestamps, delay,
and freshness. The Market Intelligence Engine separately owns editorial bias,
levels, momentum, volatility, scenarios, risk factors, and written outlooks.
Price cards must never imply that editorial bias was calculated from a quote.

## Architecture

`lib/market-data/marketDataService.ts` is the server-only application boundary.
It resolves an adapter, batches mapped instruments, normalizes responses, uses
the short-lived cache, and optionally writes trusted snapshots to Supabase.
Pages and APIs consume only `MarketQuote`, never raw provider payloads.

The centralized registry in `constants/instruments.ts` maps internal slugs and
symbols to provider-specific symbols. Components never contain provider symbols.
It covers XAUUSD, XAGUSD, NAS100, SPX500, DJ30, WTI, NATGAS, COPPER, BTCUSD,
ETHUSD, EURUSD, GBPUSD, and USDJPY.

## Provider modes

### Development fixtures

Set `MARKET_DATA_PROVIDER=development` only locally. Fixtures are deterministic
and every response is labeled `simulated`. The provider is disabled whenever
`NODE_ENV=production`; production renders Data unavailable instead of fabricated
prices.

### Generic HTTP adapter foundation

```dotenv
MARKET_DATA_PROVIDER=generic_http
MARKET_DATA_API_KEY=server-secret
MARKET_DATA_API_BASE_URL=https://provider.example/v1/
MARKET_DATA_TIMEOUT_MS=5000
MARKET_DATA_CACHE_SECONDS=60
```

The adapter calls `GET {baseUrl}/quotes?symbols=A,B`, sends a Bearer token, and
expects `{ "data": ProviderQuotePayload[] }`. It calls `GET {baseUrl}/health`
for health checks. A selected provider will likely require a dedicated adapter
for its authentication, symbols, fields, errors, status, and entitlement flags.
Do not enable `generic_http` until that contract is verified. Credentials remain
server-only; no raw response or key reaches a Client Component or public API.

## Freshness, delay, and caching

- In-memory TTL defaults to 60 seconds and is configurable from 15–300 seconds.
- Provider timestamps older than 120 seconds are classified as stale.
- Provider-declared delayed data is labeled delayed and includes delay minutes
  when supplied. It is never described as exchange real-time.
- Cache entries may serve as stale fallback for five times the configured TTL;
  the disclosure changes to stale and is never labeled live.
- APIs use 30-second CDN caching with 60-second stale-while-revalidate.
- Server Components batch once per render; there is no browser polling.

Timeouts use `AbortController`. Transient failures receive one retry with
backoff; invalid responses are not retried. Three consecutive service failures
open a 30-second cooldown. Outages produce a stale quote or a typed unavailable
quote with no fabricated price. Logs exclude credentials and raw payloads.

## Public APIs and limits

- `GET /api/market-data?instruments=gold,bitcoin` — maximum 10 registry values.
- `GET /api/market-data/[instrument]` — one slug or internal symbol.
- `GET /api/market-data/health` — configuration and health without secrets.

Errors use `{ "error": string, "details"?: string[] }`. Arbitrary provider
symbols are rejected. The existing in-process limiter allows 60 requests per
identity per minute; distributed limiting is recommended for multi-region use.

## Optional Supabase snapshots

Run `docs/supabase-market-data.sql` in the Supabase SQL Editor. RLS is enabled
and browser roles have no access. Only non-simulated usable quotes are written
through the service role. Schedule the documented seven-day deletion statement
if enabled. This is an operational cache, not a historical-price database.

## Production checklist

- Select a licensed provider and review API and exchange agreements.
- Confirm web display and redistribution rights by instrument and region.
- Confirm whether data is exchange real-time, delayed, or indicative.
- Implement and contract-test a dedicated adapter and symbol mappings.
- Configure server-only variables on the deployment platform.
- Apply the Supabase SQL only if snapshot persistence is wanted.
- Verify unavailable, stale, rate-limit, malformed, and outage behavior.
- Verify timestamps, delay, currency, precision, and market status.
- Run `npm run check` and inspect homepage, dashboard, and analysis pages.
- Add distributed rate limiting and production monitoring.

## Troubleshooting

- **Unavailable in production:** expected until a real provider and all required
  variables are valid. Development fixtures are intentionally blocked.
- **Provider unhealthy:** check base URL, key, health endpoint, and entitlement.
- **Stale label:** compare provider timestamp/server clock and documented delay.
- **No Supabase rows:** fixtures are never persisted; verify SQL and service role.
- **Unsupported instrument:** use a registry slug or internal symbol.

## Legal and licensing

No market-data redistribution rights are claimed by this code. Display rights,
exchange fees, attribution, caching/retention, geographic restrictions, audit
requirements, and derived-data terms remain unresolved until a provider
contract is selected and reviewed. Legal review is required before launch.
