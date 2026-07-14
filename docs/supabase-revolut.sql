-- DayTradingPost Revolut membership storage and administrative verification.
-- Run this file after docs/supabase-auth.sql in Supabase Dashboard > SQL Editor.

alter table public.profiles
  add column if not exists payment_provider text,
  add column if not exists payment_customer_id text,
  add column if not exists payment_subscription_id text,
  add column if not exists payment_reference uuid,
  add column if not exists current_period_end timestamptz,
  add column if not exists payment_verified_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_membership_status_check;
update public.profiles
set membership_status = 'cancelled'
where membership_status = 'canceled';
alter table public.profiles
  add constraint profiles_membership_status_check
  check (membership_status in ('free', 'pending', 'trialing', 'active', 'past_due', 'cancelled', 'failed'));

alter table public.profiles
  drop constraint if exists profiles_membership_plan_check;
alter table public.profiles
  add constraint profiles_membership_plan_check
  check (membership_plan in ('free', 'monthly', 'annual'));

create unique index if not exists profiles_payment_subscription_id_key
  on public.profiles (payment_subscription_id)
  where payment_subscription_id is not null;
create unique index if not exists profiles_payment_reference_key
  on public.profiles (payment_reference)
  where payment_reference is not null;

create table if not exists public.membership_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  membership_plan text not null check (membership_plan in ('monthly', 'annual')),
  provider_mode text not null check (provider_mode in ('revolut_api', 'revolut_payment_links')),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'cancelled', 'failed')),
  payment_reference uuid not null unique,
  payment_subscription_id text,
  verified_at timestamptz,
  verified_by uuid references auth.users (id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists membership_requests_user_created_idx
  on public.membership_requests (user_id, created_at desc);
create unique index if not exists membership_requests_subscription_key
  on public.membership_requests (payment_subscription_id)
  where payment_subscription_id is not null;

create table if not exists public.payment_webhook_events (
  event_key text primary key,
  event_type text not null,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

alter table public.membership_requests enable row level security;
alter table public.payment_webhook_events enable row level security;

revoke all on table public.membership_requests from anon, authenticated;
revoke all on table public.payment_webhook_events from anon, authenticated;
grant select on table public.membership_requests to authenticated;

drop policy if exists "Members can view their membership requests" on public.membership_requests;
create policy "Members can view their membership requests"
on public.membership_requests
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.set_membership_request_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_membership_requests_updated_at on public.membership_requests;
create trigger set_membership_requests_updated_at
before update on public.membership_requests
for each row execute procedure public.set_membership_request_updated_at();

-- Dashboard-only workflow for Revolut Payment Link verification. The function
-- cannot be invoked by anon or authenticated browser clients.
create or replace function public.verify_membership_request(
  request_id uuid,
  approve boolean,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.membership_requests%rowtype;
  verified_time timestamptz := timezone('utc', now());
begin
  select * into target
  from public.membership_requests
  where id = request_id
  for update;

  if target.id is null then
    raise exception 'Membership request not found';
  end if;

  if target.provider_mode <> 'revolut_payment_links' then
    raise exception 'Only payment-link requests use manual verification';
  end if;

  update public.membership_requests
  set
    status = case when approve then 'verified' else 'rejected' end,
    verified_at = case when approve then verified_time else null end,
    admin_notes = notes
  where id = target.id;

  if approve then
    update public.profiles
    set
      membership_status = 'active',
      membership_plan = target.membership_plan,
      payment_provider = 'revolut',
      payment_reference = target.payment_reference,
      current_period_end = verified_time +
        case
          when target.membership_plan = 'annual' then interval '1 year'
          else interval '1 month'
        end,
      payment_verified_at = verified_time
    where id = target.user_id;
  elsif exists (
    select 1 from public.profiles
    where id = target.user_id and payment_reference = target.payment_reference
  ) then
    update public.profiles
    set membership_status = 'failed', payment_verified_at = null
    where id = target.user_id;
  end if;
end;
$$;

revoke all on function public.verify_membership_request(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.verify_membership_request(uuid, boolean, text) to service_role;

-- Verification query: browser roles should have no access to webhook rows and
-- members should only see their own membership requests through RLS.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'membership_requests', 'payment_webhook_events')
order by tablename;
