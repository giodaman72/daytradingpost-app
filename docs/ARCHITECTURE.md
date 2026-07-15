# DayTradingPost architecture

## System overview

DayTradingPost is a Next.js 16 App Router application. It combines a public
content site, embedded Sanity Studio, Supabase authentication and operational
data, Revolut membership payments, and a protected trader dashboard.

```text
Browser
  │
  ├── Next.js pages and Server Components
  │     ├── Sanity Content Lake (published articles)
  │     ├── Supabase Auth (identity and sessions)
  │     └── Supabase Postgres (profiles, newsletter, membership operations)
  │
  ├── Next.js Route Handlers
  │     ├── POST /api/newsletter
  │     └── POST /api/webhooks/revolut
  │
  └── Revolut hosted checkout or Merchant API
```

## Folder structure

```text
app/                    App Router pages, layouts, actions, and Route Handlers
components/             Reusable presentation components by feature
constants/              Stable routes, navigation, markets, colors, membership data
docs/                   Product and engineering documentation
.github/                CI, CodeQL, performance, dependency, and contribution automation
hooks/                  Opt-in client hooks
lib/                    Integration adapters, validation, services, and utilities
providers/              Opt-in client contexts; not mounted globally by default
public/                 Static public assets
sanity/                 Studio configuration and document schemas
types/                  Canonical domain and API contracts
proxy.ts                Next.js 16 session refresh and coarse route redirects
```

## Next.js App Router

- Pages and layouts under `app/` are Server Components unless marked with
  `"use client"`.
- Route Handlers are used for external HTTP boundaries such as newsletter
  submissions, authentication callbacks, and Revolut webhooks.
- Server Actions handle trusted form mutations initiated by the application.
- `loading.tsx`, `error.tsx`, and `not-found.tsx` provide route-level recovery.
- `proxy.ts` refreshes Supabase sessions and performs early redirects, but each
  protected Server Component verifies the user again.

## Server Components

Server Components remain the default for pages, headers, CMS cards, membership
status, and the trader dashboard. They can read secure cookies and private
tokens without shipping those values or integration libraries to the browser.

Keep a component on the server when it only:

- fetches Sanity or Supabase data;
- renders links and content;
- checks authentication or membership;
- formats a server-provided response.

## Client Components

Client Components are limited to browser interaction:

- authentication and newsletter forms;
- membership checkout pending state;
- route error reset buttons;
- embedded Sanity Studio;
- opt-in hooks and providers for future interactive features.

The providers in `providers/` are intentionally not mounted in the root layout.
Mount the smallest provider around the feature that needs it. This prevents an
unused global client boundary and keeps current pages server-rendered.

## Authentication flow

1. Supabase Auth validates email/password or an email confirmation token.
2. Route Handlers exchange the callback code or OTP for a cookie session.
3. `proxy.ts` refreshes cookies and redirects anonymous users away from
   protected prefixes.
4. The protected page calls `supabase.auth.getUser()` through the server client.
5. Supabase RLS limits profile and membership-request reads to the authenticated
   user.
6. A database trigger creates and synchronizes the one-to-one profile row.

Proxy redirects are convenience and defense in depth, not the authorization
boundary. Server Components and Route Handlers must verify identity themselves.

## CMS and Sanity

- `sanity/schemaTypes/` defines `article`, `author`, and `category` documents.
- `lib/sanity/` owns low-level GROQ, image URL creation, and client setup.
- `lib/cms/` is the application-facing CMS service boundary.
- Public lists retrieve article summaries only.
- Premium article bodies are fetched only after server-side membership checks.
- The production dataset must be private and read through a server-only Viewer
  token to prevent direct premium-content access.

## Supabase

Supabase provides Auth and Postgres. Browser clients use the publishable key and
RLS. Only server modules use the service-role key. Server clients are created
lazily so builds do not require live credentials at module evaluation time.

Current operational tables are documented in `DATABASE.md` and created by the
SQL files in `docs/`.

## Revolut

`PAYMENT_PROVIDER_MODE` selects one of two server-controlled flows:

- `revolut_api`: creates customers and subscriptions through the Merchant API;
- `revolut_payment_links`: creates a pending Supabase request, redirects to a
  hosted payment link, and requires administrator verification.

The webhook Route Handler reads the raw body, validates the timestamp and HMAC
signature, records an idempotency key, retrieves authoritative subscription
state, and updates Supabase.

## Trader Dashboard

`/dashboard` is personalized and dynamically server-rendered. Sanity article
summaries and verified Supabase membership data load in parallel. Calendar,
watchlist, academy, webinar, and notification widgets currently use clearly
identified placeholder or foundation data pending their dedicated sprints.

## API routes

Implemented HTTP boundaries:

- `POST /api/newsletter`
- `POST /api/webhooks/revolut`
- `GET /auth/callback`
- `GET /auth/confirm`

Authentication forms and membership checkout use Server Actions rather than
inventing duplicate REST endpoints. See `API_REFERENCE.md`.

## Caching strategy

| Data                       | Strategy                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| Personalized Supabase data | Dynamic request-time read; never shared across users                   |
| Sanity published articles  | Next.js revalidation every 60 seconds with `sanity` and `article` tags |
| Newsletter and webhooks    | `no-store`; mutations must never be cached                             |
| Static assets              | Hashed immutable assets managed by Next.js                             |
| Placeholder constants      | Module constants with no network request                               |

Future market data must define a short provider-specific freshness window and
must expose stale timestamps in the UI.

## Image optimization

- Sanity images use `next/image` and the configured `cdn.sanity.io` remote pattern.
- Sanity’s image URL builder requests cropped dimensions appropriate to each use.
- Meaningful images require alternative text in the Sanity schema.
- Decorative images use empty alternative text or `aria-hidden`.
- Do not add raw remote `<img>` elements without an explicit reason.

## Font strategy

Geist Sans and Geist Mono are loaded through `next/font/google`. Font variables
are applied to `<html>` and inherited by the application. The browser does not
make a runtime Google Fonts request in production; Next.js self-hosts generated
font assets after build.

## Deployment architecture

The intended production target is Vercel:

```text
GitHub branch/PR
    ├── GitHub Actions quality checks
    │     ├── format and lint
    │     ├── typecheck and Vitest
    │     └── production build
    ├── CodeQL JavaScript/TypeScript analysis
    ├── optional Lighthouse homepage review
    └── Vercel preview deployment
    → merge to main
    → Vercel production deployment
        ├── Next.js Functions and Route Handlers
        ├── Sanity Content Lake
        ├── Supabase Auth/Postgres
        └── Revolut HTTPS webhook and checkout
```

Environment variables are configured separately for local, Preview, and
Production environments. Production webhook and callback URLs must use the
canonical HTTPS origin.

GitHub Actions validates source code but never calls the Vercel CLI or deploys
artifacts. The Vercel GitHub integration remains the sole deployment owner:
feature branches and pull requests receive Preview deployments, while accepted
changes on `main` produce Production deployments.

## Quality architecture

- Node.js 24 is pinned in `.nvmrc` and used by GitHub Actions.
- Prettier owns formatting; ESLint owns correctness, React hooks, accessibility,
  Next.js, TypeScript, and unused-code checks.
- Vitest uses jsdom for pure domain and focused component tests. External
  Supabase, Sanity, and Revolut boundaries are not contacted.
- Husky runs lint-staged before commits and Commitlint for commit messages.
- The primary CI workflow runs deterministic local gates after `npm ci`.
- CodeQL performs semantic JavaScript/TypeScript security analysis. Repository
  default setup must be disabled if it conflicts with this advanced workflow;
  only one CodeQL setup should run.
- Dependabot groups compatible minor and patch updates while leaving majors for
  individual review.
- Lighthouse runs separately against the locally built public homepage. It is
  initially advisory because CMS content, runner variance, and cold-start timing
  can affect scores.

## Architectural boundaries

- `types/` contains data contracts, not runtime integration code.
- `constants/` contains stable values and no secrets.
- `lib/<domain>/` exposes service boundaries.
- Low-level providers remain under `lib/sanity`, `lib/supabase`, and `lib/revolut`.
- Client hooks never grant authorization; server checks remain authoritative.
- Future integrations should be introduced behind an interface before pages
  depend on provider-specific response shapes.

## Market Intelligence Engine

Supabase stores structured editorial outlooks while Sanity remains responsible
for long-form articles and media. Server-only repository/service modules publish
small typed summaries to pages and APIs. Shared cached queries use the
`market-intelligence` tag; authorized Server Actions invalidate that tag after a
write. See [Market Intelligence Engine](MARKET_INTELLIGENCE.md).

## Market Data Service

The server-only provider-neutral service under `lib/market-data` owns quote and
session facts. Adapters map through the centralized instrument registry and
return normalized decimal strings. A short cache, stale fallback, timeout,
retry limits, and circuit breaker protect rendering. Market Intelligence remains
the independent owner of editorial judgments. See [Market Data](MARKET_DATA.md).
