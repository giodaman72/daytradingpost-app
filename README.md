# DayTradingPost

DayTradingPost is a Next.js 16 market-intelligence and trading-education
application with Sanity CMS, Supabase authentication and operational data,
Revolut-compatible premium membership, and a protected trader dashboard.

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- Sanity Studio and Content Lake
- Supabase Auth and Postgres
- Revolut Merchant API or hosted payment links
- Vercel deployment target

## Local development

Requirements:

- Node.js 24, pinned in `.nvmrc`
- npm
- Supabase and Sanity projects for connected features

Install dependencies:

```bash
nvm use
npm ci
```

Use `npm install` only when intentionally changing dependencies and updating
`package-lock.json`.

Copy the environment template and add local values:

```bash
cp .env.example .env.local
```

Start the development server on the project’s documented local port:

```bash
npm run dev -- --port 3001
```

Open `http://localhost:3001`.

## Validation

```bash
npm run check
```

This checks formatting, lint, TypeScript, unit/component tests, and the production
build. See [Testing](docs/TESTING.md) for individual commands and coverage.

## Project structure

```text
app/          Routes, layouts, Route Handlers, and Server Actions
components/   Reusable feature and UI components
constants/    Routes, navigation, design, market, and membership constants
docs/         Product and engineering documentation
hooks/        Opt-in client hooks
lib/          Services, provider adapters, validation, and utilities
providers/    Opt-in client contexts
sanity/       Studio configuration and document schemas
types/        Canonical TypeScript domain contracts
```

Server Components are the default. Do not add `"use client"` unless a component
requires state, effects, event handlers, or browser APIs. Client checks never
replace server-side authorization.

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API reference](docs/API_REFERENCE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Content guide](docs/CONTENT_GUIDE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)
- [Changelog](docs/CHANGELOG.md)
- [Sanity setup](docs/sanity-setup.md)
- [Revolut setup](docs/revolut-setup.md)
- [Market Intelligence Engine](docs/MARKET_INTELLIGENCE.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Security rules

- Never commit `.env.local` or real credentials.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `SANITY_API_READ_TOKEN`,
  `REVOLUT_API_SECRET`, or `REVOLUT_WEBHOOK_SECRET` to client code.
- Keep premium Sanity datasets private.
- Enforce RLS for browser-accessible Supabase data.
- Verify authentication and premium entitlement in Server Components or Route
  Handlers, even when proxy redirects are configured.

## Git workflow

Create a branch for each sprint, run validation, and open a pull request. Do not
merge sprint work directly into `main` without review and a successful Preview
deployment.
