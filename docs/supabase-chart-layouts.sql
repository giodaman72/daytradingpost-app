-- DayTradingPost chart preferences and provider-neutral saved layouts.
-- Apply after docs/supabase-auth.sql.
create table if not exists public.chart_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  instrument_slug text not null check (char_length(instrument_slug) between 1 and 80),
  preferred_provider text not null check (preferred_provider in ('tradingview','first_party','development')),
  preferred_timeframe text not null check (preferred_timeframe in ('1m','5m','15m','30m','1h','4h','1d','1w','1M')),
  show_volume boolean not null default true,
  show_editorial_overlays boolean not null default true,
  show_economic_events boolean not null default false,
  show_alert_levels boolean not null default false,
  theme text not null default 'dark' check (theme in ('dark','light')),
  timezone text not null default 'Etc/UTC' check (char_length(timezone) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, instrument_slug)
);
create table if not exists public.chart_layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  instrument_slug text not null check (char_length(instrument_slug) between 1 and 80),
  provider text not null check (provider in ('tradingview','first_party','development')),
  timeframe text not null check (timeframe in ('1m','5m','15m','30m','1h','4h','1d','1w','1M')),
  indicators jsonb not null default '[]'::jsonb check (jsonb_typeof(indicators) = 'array' and pg_column_size(indicators) <= 16384),
  annotations jsonb not null default '[]'::jsonb check (jsonb_typeof(annotations) = 'array' and pg_column_size(annotations) <= 32768),
  viewport jsonb not null default '{}'::jsonb check (jsonb_typeof(viewport) = 'object' and pg_column_size(viewport) <= 8192),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object' and pg_column_size(settings) <= 16384),
  is_default boolean not null default false,
  is_shared boolean not null default false,
  share_id text unique,
  share_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_opened_at timestamptz
);
create index if not exists chart_preferences_user_idx on public.chart_preferences(user_id);
create index if not exists chart_layouts_user_updated_idx on public.chart_layouts(user_id, updated_at desc);
create index if not exists chart_layouts_instrument_idx on public.chart_layouts(instrument_slug);
create index if not exists chart_layouts_shared_idx on public.chart_layouts(share_id) where is_shared;
create unique index if not exists chart_layouts_one_default_idx on public.chart_layouts(user_id, instrument_slug) where is_default;
create or replace function public.set_chart_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists chart_preferences_updated_at on public.chart_preferences;
create trigger chart_preferences_updated_at before update on public.chart_preferences
  for each row execute function public.set_chart_updated_at();
drop trigger if exists chart_layouts_updated_at on public.chart_layouts;
create trigger chart_layouts_updated_at before update on public.chart_layouts
  for each row execute function public.set_chart_updated_at();
alter table public.chart_preferences enable row level security;
alter table public.chart_layouts enable row level security;
revoke all on public.chart_preferences, public.chart_layouts from anon, authenticated;
grant select, insert, delete on public.chart_preferences, public.chart_layouts to authenticated;
grant update (preferred_provider, preferred_timeframe, show_volume, show_editorial_overlays, show_economic_events, show_alert_levels, theme, timezone) on public.chart_preferences to authenticated;
grant update (name, instrument_slug, provider, timeframe, indicators, annotations, viewport, settings, is_default, last_opened_at) on public.chart_layouts to authenticated;
grant all on public.chart_preferences, public.chart_layouts to service_role;
create policy "members read own chart preferences" on public.chart_preferences
  for select to authenticated using (user_id = (select auth.uid()));
create policy "members insert own chart preferences" on public.chart_preferences
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "members update own chart preferences" on public.chart_preferences
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "members delete own chart preferences" on public.chart_preferences
  for delete to authenticated using (user_id = (select auth.uid()));
create policy "members read own chart layouts" on public.chart_layouts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "members insert private chart layouts" on public.chart_layouts
  for insert to authenticated with check (user_id = (select auth.uid()) and is_shared = false and share_id is null);
create policy "members update own chart layouts" on public.chart_layouts
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "members delete own chart layouts" on public.chart_layouts
  for delete to authenticated using (user_id = (select auth.uid()));
comment on table public.chart_preferences is 'Private per-user chart preferences; no provider credentials or executable state.';
comment on table public.chart_layouts is 'Provider-neutral layouts. Public shares are projected by a server route and never expose user_id.';
comment on column public.chart_layouts.share_id is 'Opaque server-generated identifier; browser roles cannot update sharing columns.';
