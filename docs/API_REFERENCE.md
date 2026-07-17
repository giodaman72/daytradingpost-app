# API and server boundary reference

This reference documents currently implemented HTTP routes and Server Actions.
Future route names are clearly marked as planned.

## Response conventions

JSON mutation routes set `Cache-Control: no-store`. Errors return a safe message
without credentials, provider payloads, SQL details, or stack traces.

## `POST /api/newsletter`

Creates a consent-backed newsletter subscriber.

Authentication: public.

Headers:

```http
Content-Type: application/json
```

Request:

```json
{
  "email": "trader@example.com",
  "consent": true,
  "company": ""
}
```

`company` is a honeypot and should remain empty.

Success response (`201` for new, `200` for duplicate):

```json
{
  "ok": true,
  "message": "You’re subscribed. Watch your inbox for the Daily Market Brief."
}
```

Errors:

| Status | Meaning                                                          |
| ------ | ---------------------------------------------------------------- |
| `400`  | Invalid JSON, email, or missing consent                          |
| `403`  | Explicit cross-site browser request                              |
| `413`  | Body exceeds 4,096 bytes                                         |
| `415`  | Content type is not JSON                                         |
| `429`  | More than five attempts in ten minutes for the local limiter key |
| `503`  | Subscriber storage unavailable                                   |

The in-memory limiter is best-effort per function instance. A distributed rate
limiter is recommended before high-volume production traffic.

## `GET /auth/callback`

Exchanges a Supabase PKCE `code` for a cookie session.

Authentication: public callback; a valid one-time code is required.

Query:

- `code`: Supabase authorization code.
- `next`: optional safe application-relative path. External and protocol-relative
  URLs are rejected.

Response: redirect to `next` or `/account`; invalid links redirect to `/login`
with a safe error message.

## `GET /auth/confirm`

Verifies a Supabase email OTP link.

Query:

- `token_hash`: confirmation token hash.
- `type`: valid Supabase email OTP type.

Response: redirect to `/account` on success or `/login` on failure.

## Authentication Server Actions

File: `app/(auth)/actions.ts`.

Implemented actions:

- registration;
- login;
- forgot-password email request;
- password reset;
- logout.

Requests use `FormData`, server-side normalization, field validation, Supabase
Auth, and safe internal redirect paths. They are not exposed as `/api/auth`.

## Membership checkout Server Action

File: `app/membership/actions.ts`.

Input:

```text
plan=monthly | annual
```

Authentication: required Supabase user.

Behavior:

- creates a pending `membership_requests` row;
- records a unique payment reference;
- in API mode, creates/reuses a Revolut customer and subscription;
- in payment-link mode, redirects to the configured hosted URL;
- never grants premium access from the redirect alone.

Errors are returned as action state and rendered by the client form.

## `POST /api/webhooks/revolut`

Receives Revolut subscription events.

Authentication: HMAC signature, not a user session.

Required headers:

```http
Revolut-Request-Timestamp: 1683650202360
Revolut-Signature: v1=<hex-hmac>
```

The signature covers `v1.<timestamp>.<raw-body>`. Requests outside the five
minute tolerance or without a matching signature return `401`.

Subscribed events:

- `SUBSCRIPTION_INITIATED`
- `SUBSCRIPTION_FINISHED`
- `SUBSCRIPTION_CANCELLED`
- `SUBSCRIPTION_OVERDUE`

Success:

```json
{ "received": true }
```

Duplicate deliveries return `200` with `duplicate: true`. Unsupported signed
events return `200` with `ignored: true`.

Errors:

| Status | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| `400`  | Invalid JSON payload                                                    |
| `401`  | Invalid signature or timestamp                                          |
| `500`  | Verified event could not be processed; event lock is released for retry |
| `503`  | Webhook secret or idempotency storage unavailable                       |

## CMS service API

Sanity content is consumed through server functions rather than public Next.js
API endpoints:

- `getArticles()`
- `getLatestArticles(limit)`
- `getArticleSummaryBySlug(slug)`
- `getArticleBySlug(slug)`
- `getArticleSlugs()`

Premium pages fetch the summary first, verify Supabase entitlement, and only
then request the full body.

## Planned routes

The following examples from the long-term architecture are **not implemented**:

| Route                      | Planned responsibility                                                     | Target sprint      |
| -------------------------- | -------------------------------------------------------------------------- | ------------------ |
| `/api/articles`            | Programmatic article read/search if a non-Next client requires it          | Define when needed |
| `/api/revolut`             | No generic endpoint planned; use narrow checkout actions and webhook route | N/A                |
| `/api/market-intelligence` | Normalized intelligence outputs                                            | Sprint 9           |
| `/api/market-data`         | Licensed quote and session data                                            | Sprint 10          |
| `/api/watchlists`          | Authenticated CRUD with RLS                                                | Sprint 12          |
| `/api/notifications`       | Authenticated notification reads/updates                                   | Future             |

Do not create generic pass-through APIs merely to hide a provider URL. Add an
HTTP route only when an external client, webhook, cache boundary, or streaming
requirement needs it.

## Market intelligence (read only)

| Method | Route                                   | Notes                                                                   |
| ------ | --------------------------------------- | ----------------------------------------------------------------------- |
| GET    | `/api/market-intelligence`              | Published summaries; filters: `date`, `assetClass`, `featured`, `limit` |
| GET    | `/api/market-intelligence/[instrument]` | Latest published supported instrument or `404`                          |
| GET    | `/api/market-brief`                     | Daily brief and published editorial bias distribution                   |

`date` uses `YYYY-MM-DD`; `assetClass` is `commodities`, `indices`,
`forex`, or `crypto`; `featured` is `true`/`false`; `limit` is 1–50.
Success responses include `meta.generatedAt` and `sampleData: false`. Errors use
`{ "error": string, "details"?: string[] }`. Responses expose no audit user
IDs, drafts, secrets, or administrative fields. CDN caching uses 60-second
freshness plus stale-while-revalidate; rate-limit responses use `429` and
`Retry-After`.

## Market data (read only)

| Method | Route                           | Notes                                                 |
| ------ | ------------------------------- | ----------------------------------------------------- |
| GET    | `/api/market-data`              | Optional `instruments` CSV; registry only; maximum 10 |
| GET    | `/api/market-data/[instrument]` | One internal slug or normalized symbol                |
| GET    | `/api/market-data/health`       | Provider configuration/health without credentials     |

Responses use `{ data: MarketQuote[], meta }`; metadata includes generation
time, provider, delayed, and simulated status. Quotes carry freshness and a
provider timestamp. Errors use `{ "error": string, "details"?: string[] }`.
CDN caching is 30 seconds plus 60 seconds stale-while-revalidate.

## Economic intelligence (read only)

| Method | Route                      | Notes                                                          |
| ------ | -------------------------- | -------------------------------------------------------------- |
| GET    | `/api/economic`            | Date range, search, filters, sorting, offset/limit pagination  |
| GET    | `/api/economic/today`      | Current calendar day in the selected IANA timezone             |
| GET    | `/api/economic/week`       | Current calendar week in the selected IANA timezone            |
| GET    | `/api/economic/upcoming`   | Next scheduled events; optional `limit` up to 100              |
| GET    | `/api/economic/statistics` | High/medium impact, tomorrow/week, country and currency counts |

The general route accepts `from`, `to`, `search`, `country`, `currency`,
`impact`, `eventType`, `status`, `limit`, and `offset`. Comma-separated filters
are normalized and unsupported values return a typed `400` response. Successful
event responses contain `data`, `total`, `pagination`, and `meta`; `meta`
includes generation time and the simulated-data flag. Responses are cached for
120 seconds with stale-while-revalidate and rate-limit responses include
`Retry-After`. No endpoint exposes provider credentials or raw provider shapes.

## Smart feature server boundaries

Watchlist, alert, and notification member mutations use authenticated Server Actions under `app/watchlists/actions.ts`, `app/alerts/actions.ts`, and `app/notifications/actions.ts`. Ownership and membership limits are rechecked server-side without duplicating REST endpoints.

`POST /api/internal/alerts/evaluate` requires a server-only bearer secret, accepts no browser-supplied trigger data, evaluates a bounded batch, and returns statistics. `401` means invalid scheduler authentication, `409` means the current instance is already evaluating, and `500` reports a safely contained batch failure.
