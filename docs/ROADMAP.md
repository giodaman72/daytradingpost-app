# DayTradingPost product roadmap

This roadmap records delivered foundations and the intended sequence for future
work. A sprint is complete only after lint, production build, and its acceptance
checks pass. Future scope may be refined before implementation.

## Completed

### Sprint 1 — Homepage

- Dark fintech landing experience
- Hero, market snapshot, research, academy, premium, and newsletter sections
- Responsive header and footer

### Sprint 2 — Reusable components

- Shared layout and analysis presentation components
- Reusable buttons, cards, scenarios, and market sections
- Consistent responsive design tokens

### Sprint 3 — Analysis pages

- Analysis landing page
- Individual Gold, Nasdaq, Crude Oil, and Bitcoin briefings
- SEO metadata and educational disclaimers

### Sprint 4 — Newsletter

- Reusable newsletter form
- Server-side validation and normalization
- Supabase subscriber storage, duplicate prevention, consent, and abuse controls

### Sprint 5 — Sanity CMS

- Embedded Sanity Studio
- Article, author, and category schemas
- Dynamic analysis routes and article metadata
- Empty, loading, and not-found states

### Sprint 6 — Authentication

- Supabase email/password authentication
- Registration, login, recovery, reset, account, and logout flows
- Secure cookie-based sessions and protected account routes
- Profile creation and Row Level Security

### Sprint 7 — Payments

- Revolut Merchant API and hosted payment-link modes
- Monthly and annual membership requests
- Signed, idempotent webhook processing
- Manual payment-link verification workflow
- Server-protected premium Sanity articles

### Sprint 8 — Trader Dashboard

- Protected trader workspace
- Sanity analysis feed and Supabase membership summary
- Market outlook, calendar, webinar, watchlist, academy, and notification widgets
- Responsive sidebar, loading, error, and empty states

### Sprint 8.5 — Developer infrastructure

- Architecture, database, API, design, content, deployment, testing, and roadmap documentation
- Canonical domain types, constants, services, hooks, and provider contracts
- Reduced duplicated validation, navigation, membership, and formatting logic
- Preserved Server Component boundaries and existing visual output

### Sprint 8.6 — CI and code quality

- Prettier, strengthened ESLint, strict TypeScript checks, and unified local gates
- Vitest and Testing Library foundation with validation, membership, and UI tests
- Husky, lint-staged, Commitlint, and Conventional Commits
- GitHub Actions for primary CI, CodeQL, and advisory Lighthouse reviews
- Dependabot, contribution templates, repository hygiene, and security guidance

## Upcoming

### Sprint 9 — Market Intelligence Engine

- Define normalized market-intelligence inputs and outputs
- Generate deterministic market outlooks from validated source data
- Add provenance, timestamps, confidence, and educational-safety controls

### Sprint 10 — Market Data Service

- Integrate a licensed market-data provider
- Normalize instruments, quotes, sessions, and provider errors
- Add caching, stale-data indicators, observability, and provider failover

### Sprint 11 — Economic Intelligence System

- Centralized provider-neutral economic event service and normalized types
- Supabase event schema, indexes, RLS, and production fixture safeguards
- Homepage, dashboard, market page, Market Brief, and newsletter integration
- Filterable responsive calendar, event detail routes, statistics, and APIs
- Timezone-aware schedules, caching, pagination, rate limiting, and tests
- Future alert contracts without notification delivery

### Sprint 12 — Watchlists

- Persist member watchlists in Supabase
- Add RLS, ordering, defaults, and instrument validation

### Sprint 13 — AI Assistant

- Ground answers in published content and approved market data
- Add citations, premium entitlements, safety limits, and usage controls

### Sprint 14 — Academy 2.0

- Structured courses, lessons, completion tracking, and member progress

### Sprint 15 — Community

- Moderated member discussions, profiles, reporting, and conduct controls

### Sprint 16 — PWA

- Installable application shell, offline fallbacks, and safe notification opt-in

### Sprint 17 — Admin Portal

- Role-based content, membership, notification, and operational workflows

### Sprint 18 — SEO & Performance

- Structured data, Core Web Vitals, bundle budgets, crawl controls, and content audits

## Delivery principles

1. Server authorization is authoritative; client state is presentation only.
2. Market and payment data always include source and freshness information.
3. Premium Sanity datasets remain private.
4. Secrets never use a `NEXT_PUBLIC_` prefix.
5. New integrations require loading, empty, error, and degraded states.
6. Every sprint ends with formatting, lint, typecheck, tests, build, responsive,
   accessibility, and security checks.

## Sprint 9 — Market Intelligence Engine

Centralize Supabase-backed editorial outlooks, editor workflow, public APIs,
homepage/dashboard/analysis integration, Daily Market Brief, newsletter
formatter, and economic-calendar provider contract. No live data provider.

## Recommended Sprint 10

Add end-to-end editor/auth tests, production migration tooling, distributed API
rate limiting, alert preference/data models, and a licensed-provider evaluation
with provenance and stale-data requirements before any quote integration.

## Sprint 10 — Market Data Service

Added the provider-neutral quote boundary, centralized mappings, local fixtures,
generic adapter foundation, caching/resilience, optional snapshots, public APIs,
and separately labeled page integrations. Production remains blocked on a
licensed provider and confirmed display/redistribution terms.

## Recommended Sprint 12

Implement authenticated watchlists while separately evaluating licensed
economic and market-data providers. Add distributed limiting, ingestion
observability, migration automation, provider contract tests, and end-to-end
Route Handler coverage before enabling production economic ingestion.
