# Market Intelligence Engine

## Purpose

The Market Intelligence Engine is the single source for structured,
date-specific DayTradingPost outlooks. It keeps bias, levels, momentum,
volatility, scenarios, and risk factors consistent across the homepage,
dashboard, analysis pages, Daily Market Brief, APIs, and future newsletters or
alerts. It is an editorial system, not a live quote feed.

## Data ownership

- Supabase owns structured daily outlook fields in `market_intelligence`.
- Sanity owns long-form articles, images, authors, categories, SEO, and Portable
  Text.
- `related_article_slug` joins an outlook to a Sanity article without copying its
  body.
- `constants/instruments.ts` is the only supported-instrument registry.
- No service-role credential is imported by a Client Component.

## Database setup

Run `docs/supabase-auth.sql` first, then paste the complete contents of
`docs/supabase-market-intelligence.sql` into Supabase SQL Editor and run it.
The script adds `profiles.app_role`, creates the table, checks, partial unique
index, lookup indexes, timestamp trigger, grants, and RLS policies.

The partial unique index permits drafts but prevents two published records for
the same instrument and valid date. Public roles can only select published
records. Editors and admins can create, update, and delete records.

Grant a user editor access from SQL Editor:

```sql
update public.profiles
set app_role = 'editor'
where email = 'YOUR_EDITOR_EMAIL';
```

Members cannot promote themselves because browser update grants remain limited
to `full_name`. Reserve `admin` for future operations beyond editorial access.

## Editorial and publishing workflow

1. Sign in with an editor/admin profile.
2. Open `/admin/market-intelligence` and choose **New outlook**.
3. Select the instrument and valid date, then enter all structured fields.
4. Keep **Publish to readers** off while drafting.
5. Use **Preview layout** to review the current form values.
6. Add the exact Sanity article slug when long-form analysis exists.
7. Publish. The Server Action validates and normalizes the record, writes the
   authenticated user to audit fields, invalidates the cache, and revalidates
   public surfaces.

All support/resistance values are editorial entries. Authors must never copy an
unverified quote into a field or describe a stored bias as real time.

## Runtime architecture

- `marketIntelligenceRepository.ts` maps Supabase rows and contains database
  queries.
- `marketIntelligenceService.ts` supplies server-only use cases.
- `marketIntelligenceTransforms.ts` contains deterministic summarization,
  distribution, API, and brief transformations.
- `marketIntelligenceValidation.ts` normalizes forms and validates query/input
  values.
- `marketIntelligenceCache.ts` owns the shared cache tag and invalidation.
- Reusable components live in `components/market-intelligence/`.

Published latest and featured reads use Next.js data cache entries with a
five-minute revalidation window. Authorized writes expire the shared
`market-intelligence` tag immediately and revalidate the homepage, dashboard,
analysis tree, brief, and editor. Filtered reads use bounded database queries.
If Supabase is not configured or temporarily unavailable, public services return
an empty collection and the UI renders a professional empty state.

## Product integrations

- Homepage: featured published records, including levels and freshness; no
  fabricated prices or “live” label.
- Dashboard: latest records with watchlist symbols prioritized, then featured
  records.
- Analysis: Sanity article body plus the matching Supabase structured outlook by
  related article slug or instrument slug.
- `/market-brief`: published outlooks and bias counts calculated only from those
  records.
- Newsletter: `formatMarketBriefForNewsletter()` returns structured content; it
  does not send email.
- Future alerts: consume summaries through the service or API and persist a
  delivery-specific snapshot before notifying users.

## Read-only APIs

- `GET /api/market-intelligence`
- `GET /api/market-intelligence/[instrument]`
- `GET /api/market-brief`

Collection filters are `date`, `assetClass`, `featured`, and `limit` (1–50).
Responses contain public summaries only, carry CDN cache headers, and use a
best-effort per-instance request limit. A durable distributed limiter can
replace the in-memory adapter when traffic requires it.

## Fixture and disclosure policy

No live provider is connected in Sprint 9. The economic-calendar development
adapter emits an explicitly marked fixture only outside production. Production
returns an empty list. Every public outlook includes an educational risk
disclaimer and editorial bias wording. Do not calculate sentiment or
fear-and-greed statistics without a documented source.

## Future provider work

A later sprint can add a licensed market-data adapter behind a new provider
interface, including provenance, market timestamp, stale-data rules, usage
limits, and licensing review. It must not overwrite editorial fields silently.
The economic-calendar provider can similarly gain a verified adapter returning
the existing normalized event contract. Future alerts should use durable jobs,
idempotency keys, user preferences, and explicit freshness checks.

## Troubleshooting

- Empty public cards: confirm the record is published and its valid date is not
  in the future.
- Editor redirect: confirm `profiles.app_role` is `editor` or `admin` in the same
  Supabase project used by `.env.local`.
- Duplicate publish error: edit or unpublish the existing instrument/date row.
- Article does not show structured data: make `related_article_slug` exactly
  match the Sanity slug.
- SQL error near `docs`: paste the SQL file contents, not its filesystem path.
- Schema-cache errors: confirm the SQL completed, then restart the Next.js dev
  server if environment variables changed.
