# Data model and storage

DayTradingPost uses two persistence systems:

- **Supabase Postgres** for identity-linked operational data.
- **Sanity Content Lake** for editorial documents.

This document distinguishes implemented storage from planned Sprint 9+ tables.
Names such as `articles` are logical collections in Sanity, not Postgres tables.

## Implemented Supabase tables

### `economic_events`

Source: `docs/supabase-economic.sql`.

Stores normalized, verified macroeconomic schedules and released values. Core
columns include provider identity, title, country, currency, impact,
`scheduled_time`, forecast/previous/actual/revised values, event type, category,
source, status, and audit timestamps. Additional JSON/text fields support
historical values, educational context, trading considerations, and related
markets without exposing provider payloads.

Indexes cover schedule time, impact plus time, currency plus time, country plus
time, status plus time, and unique provider/event identity. RLS is enabled,
browser roles have no direct table privileges, and trusted service-role access
is explicit. A check constraint rejects fixture rows so development data cannot
be persisted as production events.

### `profiles`

Source: `docs/supabase-auth.sql` and `docs/supabase-revolut.sql`.

| Column                    | Type          | Rules                                                                                   |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `id`                      | `uuid`        | Primary key; foreign key to `auth.users.id`; cascade delete                             |
| `full_name`               | `text`        | Nullable; member-editable                                                               |
| `email`                   | `text`        | Required; synchronized from Auth                                                        |
| `membership_status`       | `text`        | Required; `free`, `pending`, `trialing`, `active`, `past_due`, `cancelled`, or `failed` |
| `membership_plan`         | `text`        | Required; `free`, `monthly`, or `annual`                                                |
| `payment_provider`        | `text`        | Nullable; currently `revolut`                                                           |
| `payment_customer_id`     | `text`        | Nullable; Revolut customer identifier                                                   |
| `payment_subscription_id` | `text`        | Nullable; unique when present                                                           |
| `payment_reference`       | `uuid`        | Nullable; unique when present                                                           |
| `current_period_end`      | `timestamptz` | Nullable                                                                                |
| `payment_verified_at`     | `timestamptz` | Nullable; required for premium access                                                   |
| `created_at`              | `timestamptz` | Required; UTC default                                                                   |
| `updated_at`              | `timestamptz` | Required; trigger maintained                                                            |

Indexes:

- primary key on `id`;
- unique partial index on `payment_subscription_id`;
- unique partial index on `payment_reference`.

Relationships:

- one-to-one with `auth.users`;
- one-to-many with `membership_requests` through `user_id`.

Security:

- RLS enabled;
- authenticated members can select only their own row;
- authenticated members can update only `full_name`;
- payment and membership fields are server-controlled.

### `newsletter_subscribers`

Source: `docs/supabase-newsletter.sql`.

| Column       | Type          | Rules                                                 |
| ------------ | ------------- | ----------------------------------------------------- |
| `id`         | `uuid`        | Primary key; generated UUID                           |
| `email`      | `text`        | Required; 3–254 characters and basic email constraint |
| `consent`    | `boolean`     | Required and must be true                             |
| `source`     | `text`        | Required; defaults to `homepage`                      |
| `created_at` | `timestamptz` | Required                                              |

Indexes:

- primary key on `id`;
- unique expression index on `lower(btrim(email))`.

Security:

- RLS enabled;
- browser roles have no table access;
- the server-only service role performs inserts.

### `membership_requests`

This is the implemented operational **memberships** workflow table. The current
membership entitlement is stored on `profiles`; each checkout attempt or manual
verification request is stored here.

| Column                    | Type          | Rules                                                       |
| ------------------------- | ------------- | ----------------------------------------------------------- |
| `id`                      | `uuid`        | Primary key; generated UUID                                 |
| `user_id`                 | `uuid`        | Required foreign key to `auth.users.id`; cascade delete     |
| `membership_plan`         | `text`        | `monthly` or `annual`                                       |
| `provider_mode`           | `text`        | `revolut_api` or `revolut_payment_links`                    |
| `status`                  | `text`        | `pending`, `verified`, `rejected`, `cancelled`, or `failed` |
| `payment_reference`       | `uuid`        | Required and unique                                         |
| `payment_subscription_id` | `text`        | Nullable; unique when present                               |
| `verified_at`             | `timestamptz` | Nullable                                                    |
| `verified_by`             | `uuid`        | Nullable foreign key to `auth.users.id`; set null on delete |
| `admin_notes`             | `text`        | Nullable; never exposed publicly                            |
| `created_at`              | `timestamptz` | Required; UTC default                                       |
| `updated_at`              | `timestamptz` | Required; trigger maintained                                |

Indexes:

- primary key on `id`;
- composite index on `(user_id, created_at desc)`;
- unique index on `payment_reference`;
- unique partial index on `payment_subscription_id`.

Security:

- members can select only their own requests;
- browser roles cannot insert or update payment state;
- `verify_membership_request` is executable only by the service role.

### `payment_webhook_events`

| Column         | Type          | Rules                                |
| -------------- | ------------- | ------------------------------------ |
| `event_key`    | `text`        | Primary key; SHA-256 idempotency key |
| `event_type`   | `text`        | Required Revolut event name          |
| `received_at`  | `timestamptz` | Required; UTC default                |
| `processed_at` | `timestamptz` | Nullable until successful processing |

RLS is enabled and browser roles have no privileges.

## Implemented Sanity document collections

### `articles`

Sanity schema name: `article`.

| Field              | Type                | Relationship or rule                      |
| ------------------ | ------------------- | ----------------------------------------- |
| `_id`              | Sanity document ID  | Primary document identity                 |
| `title`            | string              | Required, 8–120 characters                |
| `slug`             | slug                | Required and used by `/analysis/[slug]`   |
| `excerpt`          | text                | Required, 40–260 characters               |
| `featuredImage`    | image               | Required; hotspot and alt text            |
| `author`           | reference           | Required reference to `author`            |
| `category`         | reference           | Required reference to `category`          |
| `instrumentSymbol` | string              | Required uppercase symbol                 |
| `marketBias`       | string              | Bullish, Neutral, or Bearish              |
| `supportLevels`    | string array        | Required, unique, 1–8 entries             |
| `resistanceLevels` | string array        | Required, unique, 1–8 entries             |
| `body`             | Portable Text array | Required rich content and images          |
| `riskFactors`      | string array        | Required, unique, 1–10 entries            |
| `publishedAt`      | datetime            | Required; controls publication visibility |
| `accessLevel`      | string              | `free` or `premium`                       |
| `seoTitle`         | string              | Optional, maximum 60 characters           |
| `seoDescription`   | text                | Optional, maximum 160 characters          |

Indexes are managed by Sanity. GROQ queries filter on `_type`, `slug.current`,
and `publishedAt`, and order by `publishedAt` descending.

### `categories`

Sanity schema name: `category`.

| Field         | Type               | Rule                           |
| ------------- | ------------------ | ------------------------------ |
| `_id`         | Sanity document ID | Primary document identity      |
| `title`       | string             | Required                       |
| `slug`        | slug               | Required                       |
| `description` | text               | Optional editorial description |

Relationship: one category can be referenced by many articles.

### `authors`

Sanity schema name: `author`.

| Field   | Type               | Rule                                 |
| ------- | ------------------ | ------------------------------------ |
| `_id`   | Sanity document ID | Primary document identity            |
| `name`  | string             | Required                             |
| `slug`  | slug               | Required                             |
| `role`  | string             | Optional; defaults to market analyst |
| `bio`   | text               | Optional                             |
| `image` | image              | Optional profile image and alt text  |

Relationship: one author can be referenced by many articles.

## Planned tables

These contracts are documented for sequencing but **do not exist yet**. Their
SQL, RLS, migrations, and API implementations belong to their dedicated sprints.

### `watchlists` — planned for Sprint 12

Proposed columns: `id uuid` primary key, `user_id uuid` foreign key,
`name text`, `created_at timestamptz`, `updated_at timestamptz`.

Proposed indexes: `(user_id, updated_at desc)` and unique `(user_id, name)`.

Proposed relationship: one profile to many watchlists. A separate
`watchlist_items` table should hold `watchlist_id`, normalized `symbol`,
`position`, and timestamps. RLS must restrict all rows to `auth.uid()`.

### `notifications` — planned

Proposed columns: `id uuid` primary key, `user_id uuid` foreign key, `title`,
`message`, `severity`, `channel`, `read_at`, `created_at`.

Proposed indexes: `(user_id, read_at, created_at desc)` for unread queries.

RLS must restrict member reads and updates to their own notifications; only
trusted server workflows should insert operational notifications.

## Relationship summary

```text
auth.users 1 ─── 1 profiles
auth.users 1 ─── * membership_requests

Sanity author   1 ─── * article
Sanity category 1 ─── * article

profiles 1 ─── * watchlists      (planned)
profiles 1 ─── * notifications   (planned)
```

## Migration discipline

- SQL files are idempotent setup scripts, not a substitute for ordered
  production migrations.
- Before Sprint 9 production work, adopt a migration directory and record each
  applied version.
- Never change membership state from a browser client.
- Test every new RLS policy with anonymous, authenticated-owner,
  authenticated-non-owner, and service-role contexts.

## Market intelligence

`docs/supabase-market-intelligence.sql` adds the editorial `app_role` to
profiles and creates `market_intelligence`. A partial unique index prevents two
published rows for one instrument/date while preserving drafts. Anonymous and
authenticated readers see published rows only; editor/admin writes remain
role-protected. Audit user IDs reference `profiles`.

## Market-data snapshots

`docs/supabase-market-data.sql` creates an optional normalized snapshot cache.
RLS is enabled; browser roles have no table or sequence privileges and no write
policies. The service-role client writes only usable non-simulated quotes.
Indexes support instrument/provider timestamp lookup. Apply the documented
seven-day retention job; this is not a historical market database.

## Watchlists, alerts, history, and notifications

`docs/supabase-watchlists-alerts.sql` creates `watchlists`, `watchlist_items`, `alerts`, `alert_history`, and `notifications`. One profile owns all private records; watchlist items store centralized instrument slugs and prevent duplicates. Alert history uses unique source deduplication keys. RLS restricts records to `auth.uid()`, while column grants prevent browsers from writing trigger state, history insertion, or notification insertion.
