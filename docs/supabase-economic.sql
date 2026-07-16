-- DayTradingPost Economic Intelligence System.
-- Run this complete file in the Supabase SQL Editor.

create table if not exists public.economic_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null,
  title text not null,
  description text,
  country text not null,
  country_name text not null,
  currency text not null,
  impact text not null check (impact in ('high', 'medium', 'low', 'holiday')),
  scheduled_time timestamptz not null,
  forecast text,
  previous text,
  actual text,
  revised text,
  event_type text not null,
  category text not null,
  source text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'released', 'revised', 'cancelled')),
  is_fixture boolean not null default false check (is_fixture = false),
  historical_values jsonb not null default '[]'::jsonb,
  related_markets text[] not null default '{}',
  educational_explanation text,
  trading_considerations text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint economic_events_provider_source_unique unique (source, provider_event_id),
  constraint economic_events_title_not_blank check (length(trim(title)) > 0),
  constraint economic_events_country_code check (country in ('AU', 'CA', 'CN', 'EU', 'GB', 'JP', 'NZ', 'US')),
  constraint economic_events_currency_code check (currency in ('AUD', 'CAD', 'CNY', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'))
);

create index if not exists economic_events_scheduled_time_idx on public.economic_events (scheduled_time);
create index if not exists economic_events_impact_time_idx on public.economic_events (impact, scheduled_time);
create index if not exists economic_events_country_time_idx on public.economic_events (country, scheduled_time);
create index if not exists economic_events_currency_time_idx on public.economic_events (currency, scheduled_time);
create index if not exists economic_events_type_time_idx on public.economic_events (event_type, scheduled_time);
create index if not exists economic_events_status_time_idx on public.economic_events (status, scheduled_time);

create or replace function public.set_economic_events_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists economic_events_set_updated_at on public.economic_events;
create trigger economic_events_set_updated_at
before update on public.economic_events
for each row execute function public.set_economic_events_updated_at();

alter table public.economic_events enable row level security;

-- The Next.js server exposes approved normalized responses. Browser clients do not write or query this table directly.
revoke all on table public.economic_events from anon, authenticated;
grant select, insert, update, delete on table public.economic_events to service_role;

comment on table public.economic_events is
  'Normalized verified economic releases used by the DayTradingPost server. Development fixtures are prohibited.';

-- Keep historical releases only while they support product requirements and provider licensing.
-- Review retention and redistribution terms before importing a production provider archive.
