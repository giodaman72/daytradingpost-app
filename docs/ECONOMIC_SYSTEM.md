# Economic Intelligence System

## Purpose and boundaries

The Economic Intelligence System is the normalized source for scheduled
macroeconomic releases used by the homepage, dashboard, market pages, Daily
Market Brief, newsletter formatting, future assistants, alerts, and mobile
clients. It owns schedules, countries, currencies, impact labels, expectations,
released values, revisions, and educational event context.

It does not calculate Market Intelligence editorial bias and does not supply
market prices. Economic events are context, not trading signals.

## Architecture

```text
Verified provider/import
        │
        ▼
EconomicProvider interface ── development fixture provider (local only)
        │
        ▼
normalization and validation
        │
        ├── short server cache
        └── Supabase economic_events (trusted server access)
                    │
                    ▼
            economicService.ts
        ┌───────────┼─────────────┐
        ▼           ▼             ▼
   Server pages   Public APIs   Brief/newsletter
```

`lib/economic/economicService.ts` is server-only. Components receive normalized
`EconomicEvent` objects and never provider payloads or credentials. Filters,
statistics, countdowns, time conversion, and API formatting are pure modules so
they can be tested without external calls.

## Provider contract and fixtures

An adapter implements `getEvents`, `getToday`, `getWeek`, `getUpcoming`,
`getHistorical`, `getCountries`, and `getCurrencies`. Results preserve provider
event IDs and source identity.

No commercial provider is connected in Sprint 11. Production reads verified,
non-fixture rows from Supabase. Set `ECONOMIC_DATA_PROVIDER=development` only
locally; the factory ignores development mode in production.

Fixtures are deterministic weekly examples covering CPI, central-bank
decisions, FOMC minutes, NFP, retail sales, PPI, GDP, and ISM. Every fixture is
visibly labeled simulated, and fixture rows are prohibited by the database.

## Caching, pagination, and timezones

- Server cache defaults to 300 seconds through `ECONOMIC_CACHE_SECONDS`.
- APIs use 120-second CDN freshness and 300-second stale-while-revalidate.
- Server Components batch data without browser polling.
- API pagination is limited to 100 rows.
- URL-based filter forms need no client hydration and remain keyboard friendly.
- Events are stored as UTC; display converts to a selected IANA timezone.
- Day/week boundaries account for the selected timezone and daylight saving.

## APIs

- `GET /api/economic`
- `GET /api/economic/today`
- `GET /api/economic/week`
- `GET /api/economic/upcoming?limit=10`
- `GET /api/economic/statistics`

The general endpoint accepts `from`, `to`, `search`, `country`, `currency`,
`impact`, `eventType`, `status`, `limit`, and `offset`. Responses contain data,
total, pagination, generation time, and simulated status. Shared public rate
limiting returns `429` when exceeded.

## Supabase setup

Run `docs/supabase-economic.sql` in the Supabase SQL Editor. It creates indexed
`economic_events`, enables RLS, revokes browser access, grants trusted service
role operations, and rejects fixtures. Paste SQL contents, not a path or shell
command.

## Future alert contract

`EconomicAlertPreference` supports `15_minutes`, `1_hour`, and `24_hours` lead
times. Sprint 11 intentionally does not schedule or send notifications.

## Production checklist

- Select a calendar provider and confirm commercial display rights.
- Build a dedicated adapter and provider contract tests.
- Confirm attribution, revision semantics, schedule updates, and latency.
- Import normalized events through a trusted server process only.
- Leave development mode disabled in production.
- Verify rescheduling, cancellation, revision, and provider outage behavior.
- Run the complete check and inspect desktop/mobile calendar accessibility.
- Add distributed rate limiting and monitoring before scale.

## Remaining limitations

- No live provider, automatic ingestion job, alert delivery, or event editor.
- Provider refresh and webhook behavior remain provider-dependent.
- Educational explanations require editorial review before production use.
