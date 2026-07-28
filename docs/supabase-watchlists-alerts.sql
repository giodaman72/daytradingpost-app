-- DayTradingPost watchlists, smart alerts, history, and notifications.
-- Run this complete file in Supabase SQL Editor after supabase-auth.sql.

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60), description text check (description is null or char_length(description) <= 240),
  is_default boolean not null default false, display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists watchlists_one_default_per_user_idx on public.watchlists(user_id) where is_default;
create index if not exists watchlists_user_order_idx on public.watchlists(user_id, display_order, created_at);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(), watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, instrument_slug text not null check (instrument_slug in ('gold','silver','nasdaq-100','sp-500','dow-jones','wti-crude-oil','natural-gas','copper','bitcoin','ethereum','eurusd','gbpusd','usdjpy')),
  display_order integer not null default 0 check (display_order >= 0), notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(watchlist_id, instrument_slug)
);
create index if not exists watchlist_items_user_idx on public.watchlist_items(user_id);
create index if not exists watchlist_items_watchlist_order_idx on public.watchlist_items(watchlist_id, display_order, created_at);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  watchlist_id uuid references public.watchlists(id) on delete set null, instrument_slug text check (instrument_slug is null or instrument_slug in ('gold','silver','nasdaq-100','sp-500','dow-jones','wti-crude-oil','natural-gas','copper','bitcoin','ethereum','eurusd','gbpusd','usdjpy')),
  alert_type text not null check (alert_type in ('price_above','price_below','percentage_change_above','percentage_change_below','market_bias_changed','support_level_reached','resistance_level_reached','new_market_analysis','new_market_intelligence','economic_event_upcoming','economic_event_released','webinar_upcoming')),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  condition_operator text not null check (condition_operator in ('gt','gte','lt','lte','changed','published','scheduled_within','released')),
  threshold_value numeric(30,10), comparison_reference text, economic_event_id text, market_intelligence_field text,
  channels text[] not null default array['dashboard']::text[] check (channels <@ array['dashboard','email']::text[] and cardinality(channels) > 0),
  status text not null default 'active' check (status in ('active','paused','triggered','expired','disabled')),
  cooldown_minutes integer not null default 60 check (cooldown_minutes between 15 and 10080),
  last_evaluated_at timestamptz, last_triggered_at timestamptz, expires_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists alerts_user_status_idx on public.alerts(user_id, status);
create index if not exists alerts_instrument_status_idx on public.alerts(instrument_slug, status);
create index if not exists alerts_type_status_idx on public.alerts(alert_type, status);
create index if not exists alerts_last_evaluated_idx on public.alerts(last_evaluated_at) where status = 'active';
create unique index if not exists alerts_economic_reminder_unique_idx on public.alerts(user_id, economic_event_id, alert_type, comparison_reference) where economic_event_id is not null and status in ('active','paused');

create table if not exists public.alert_history (
  id uuid primary key default gen_random_uuid(), alert_id uuid not null references public.alerts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, instrument_slug text, event_type text not null,
  trigger_value numeric(30,10), threshold_value numeric(30,10), source_timestamp timestamptz not null,
  notification_status text not null default 'pending' check (notification_status in ('pending','delivered','partial','failed','skipped')),
  notification_channels text[] not null default '{}', metadata jsonb not null default '{}'::jsonb,
  deduplication_key text not null, triggered_at timestamptz not null default now(), acknowledged_at timestamptz,
  created_at timestamptz not null default now(), unique(alert_id, deduplication_key)
);
create index if not exists alert_history_user_triggered_idx on public.alert_history(user_id, triggered_at desc);
create index if not exists alert_history_alert_triggered_idx on public.alert_history(alert_id, triggered_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null, title text not null check (char_length(title) between 1 and 160),
  message text not null check (char_length(message) between 1 and 1000), link text check (link is null or link ~ '^/'),
  severity text not null default 'info' check (severity in ('info','success','warning','critical')),
  read_at timestamptz, dismissed_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), expires_at timestamptz
);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, read_at, created_at desc);
create index if not exists notifications_created_idx on public.notifications(created_at desc);

create or replace function public.set_smart_feature_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists watchlists_updated_at on public.watchlists;
create trigger watchlists_updated_at before update on public.watchlists for each row execute function public.set_smart_feature_updated_at();
drop trigger if exists watchlist_items_updated_at on public.watchlist_items;
create trigger watchlist_items_updated_at before update on public.watchlist_items for each row execute function public.set_smart_feature_updated_at();
drop trigger if exists alerts_updated_at on public.alerts;
create trigger alerts_updated_at before update on public.alerts for each row execute function public.set_smart_feature_updated_at();

create or replace function public.set_default_watchlist(p_user_id uuid, p_watchlist_id uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if not exists (select 1 from public.watchlists where id = p_watchlist_id and user_id = p_user_id) then raise exception 'watchlist not found'; end if;
  update public.watchlists set is_default = (id = p_watchlist_id) where user_id = p_user_id;
end; $$;
revoke all on function public.set_default_watchlist(uuid, uuid) from public, anon, authenticated;
grant execute on function public.set_default_watchlist(uuid, uuid) to service_role;

alter table public.watchlists enable row level security; alter table public.watchlist_items enable row level security;
alter table public.alerts enable row level security; alter table public.alert_history enable row level security; alter table public.notifications enable row level security;
revoke all on public.watchlists, public.watchlist_items, public.alerts, public.alert_history, public.notifications from anon;
revoke all on public.watchlists, public.watchlist_items, public.alerts, public.alert_history, public.notifications from authenticated;
grant select, insert, update, delete on public.watchlists, public.watchlist_items to authenticated;
grant select, insert, delete on public.alerts to authenticated;
grant update (watchlist_id, instrument_slug, alert_type, name, condition_operator, threshold_value, comparison_reference, economic_event_id, market_intelligence_field, channels, status, cooldown_minutes, expires_at) on public.alerts to authenticated;
grant select on public.alert_history, public.notifications to authenticated;
grant update (acknowledged_at) on public.alert_history to authenticated;
grant update (read_at, dismissed_at) on public.notifications to authenticated;
grant all on public.watchlists, public.watchlist_items, public.alerts, public.alert_history, public.notifications to service_role;

drop policy if exists "members own watchlists" on public.watchlists;
drop policy if exists "members own watchlist items" on public.watchlist_items;
drop policy if exists "members read own alerts" on public.alerts;
drop policy if exists "members create own alerts" on public.alerts;
drop policy if exists "members update manageable alerts" on public.alerts;
drop policy if exists "members delete own alerts" on public.alerts;
drop policy if exists "members read own alert history" on public.alert_history;
drop policy if exists "members acknowledge own alert history" on public.alert_history;
drop policy if exists "members read own notifications" on public.notifications;
drop policy if exists "members update own notifications" on public.notifications;
create policy "members own watchlists" on public.watchlists for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "members own watchlist items" on public.watchlist_items for all to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.watchlists w where w.id = public.watchlist_items.watchlist_id and w.user_id = (select auth.uid()))) with check (user_id = (select auth.uid()) and exists (select 1 from public.watchlists w where w.id = public.watchlist_items.watchlist_id and w.user_id = (select auth.uid())));
create policy "members read own alerts" on public.alerts for select to authenticated using (user_id = (select auth.uid()));
create policy "members create own alerts" on public.alerts for insert to authenticated with check (user_id = (select auth.uid()) and status in ('active','paused'));
create policy "members update manageable alerts" on public.alerts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and status in ('active','paused','disabled'));
create policy "members delete own alerts" on public.alerts for delete to authenticated using (user_id = (select auth.uid()));
create policy "members read own alert history" on public.alert_history for select to authenticated using (user_id = (select auth.uid()));
create policy "members acknowledge own alert history" on public.alert_history for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "members read own notifications" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "members update own notifications" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
comment on table public.alert_history is 'Retain free-member history for 30 days and premium history for 365 days through a trusted scheduled cleanup job.';
