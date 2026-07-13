-- DayTradingPost newsletter subscriber storage
-- Run this script once in the Supabase SQL editor before enabling signups.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  consent boolean not null default false,
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_length
    check (char_length(email) between 3 and 254),
  constraint newsletter_subscribers_email_format
    check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint newsletter_subscribers_consent_required
    check (consent is true)
);

-- The API normalizes email addresses before insertion. This expression index
-- is the final atomic guard against duplicates regardless of letter casing or
-- accidental surrounding whitespace.
create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(btrim(email)));

alter table public.newsletter_subscribers enable row level security;

-- Browser roles receive no table access. The Next.js API route inserts using
-- SUPABASE_SERVICE_ROLE_KEY, which must remain server-only and bypasses RLS.
revoke all on table public.newsletter_subscribers from anon, authenticated;
grant insert on table public.newsletter_subscribers to service_role;

comment on table public.newsletter_subscribers is
  'Consent-backed subscribers to the DayTradingPost Daily Market Brief.';
