-- DayTradingPost centralized market-intelligence storage.
-- Run this entire file in Supabase Dashboard > SQL Editor after
-- docs/supabase-auth.sql. It is safe to run again.

alter table public.profiles
  add column if not exists app_role text not null default 'member'
  check (app_role in ('member', 'editor', 'admin'));

comment on column public.profiles.app_role is
  'Server-managed authorization role. Only editor and admin may manage market intelligence.';

create table if not exists public.market_intelligence (
  id uuid primary key default gen_random_uuid(),
  instrument_slug text not null,
  symbol text not null,
  instrument_name text not null,
  asset_class text not null
    check (asset_class in ('commodities', 'indices', 'forex', 'crypto')),
  bias text not null
    check (bias in ('bullish', 'bearish', 'neutral', 'mixed')),
  short_summary text not null check (char_length(short_summary) between 20 and 320),
  technical_overview text not null,
  support_levels jsonb not null default '[]'::jsonb
    check (jsonb_typeof(support_levels) = 'array'),
  resistance_levels jsonb not null default '[]'::jsonb
    check (jsonb_typeof(resistance_levels) = 'array'),
  momentum text not null default 'neutral'
    check (momentum in ('positive', 'negative', 'neutral', 'mixed')),
  volatility text not null default 'moderate'
    check (volatility in ('low', 'moderate', 'high')),
  bullish_scenario text not null,
  bearish_scenario text not null,
  risk_factors text[] not null default '{}',
  related_article_slug text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  valid_for_date date not null,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.market_intelligence is
  'Editorial, date-specific market outlooks. Values are manually entered and are not a live price feed.';

create index if not exists market_intelligence_published_date_idx
  on public.market_intelligence (is_published, valid_for_date desc, updated_at desc);
create index if not exists market_intelligence_instrument_idx
  on public.market_intelligence (instrument_slug, valid_for_date desc);
create index if not exists market_intelligence_valid_date_idx
  on public.market_intelligence (valid_for_date desc);
create index if not exists market_intelligence_featured_idx
  on public.market_intelligence (is_featured)
  where is_featured;
create index if not exists market_intelligence_article_idx
  on public.market_intelligence (related_article_slug)
  where related_article_slug is not null;
create unique index if not exists market_intelligence_one_published_daily_idx
  on public.market_intelligence (instrument_slug, valid_for_date)
  where is_published;

drop trigger if exists set_market_intelligence_updated_at on public.market_intelligence;
create trigger set_market_intelligence_updated_at
before update on public.market_intelligence
for each row execute procedure public.set_profile_updated_at();

alter table public.market_intelligence enable row level security;

revoke all on table public.market_intelligence from anon, authenticated;
grant select on table public.market_intelligence to anon, authenticated;
grant insert, update, delete on table public.market_intelligence to authenticated;

drop policy if exists "Published intelligence is public" on public.market_intelligence;
create policy "Published intelligence is public"
on public.market_intelligence
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Editors can view all intelligence" on public.market_intelligence;
create policy "Editors can view all intelligence"
on public.market_intelligence
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.app_role in ('editor', 'admin')
  )
);

drop policy if exists "Editors can create intelligence" on public.market_intelligence;
create policy "Editors can create intelligence"
on public.market_intelligence
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.app_role in ('editor', 'admin')
  )
);

drop policy if exists "Editors can update intelligence" on public.market_intelligence;
create policy "Editors can update intelligence"
on public.market_intelligence
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.app_role in ('editor', 'admin')
  )
)
with check (
  updated_by = (select auth.uid())
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.app_role in ('editor', 'admin')
  )
);

drop policy if exists "Admins can delete intelligence" on public.market_intelligence;
drop policy if exists "Editors can delete intelligence" on public.market_intelligence;
create policy "Editors can delete intelligence"
on public.market_intelligence
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.app_role in ('editor', 'admin')
  )
);

-- Give an existing user editor access (replace the email before running):
-- update public.profiles set app_role = 'editor' where email = 'editor@example.com';

-- Verification query:
select
  instrument_slug,
  symbol,
  bias,
  valid_for_date,
  is_published,
  updated_at
from public.market_intelligence
order by valid_for_date desc, instrument_slug;
