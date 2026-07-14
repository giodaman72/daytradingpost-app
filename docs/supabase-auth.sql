-- DayTradingPost authentication and membership profile foundation.
-- Run this entire file in Supabase Dashboard > SQL Editor for the same project
-- configured by NEXT_PUBLIC_SUPABASE_URL.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  membership_status text not null default 'free'
    check (membership_status in ('free', 'trialing', 'active', 'past_due', 'canceled')),
  membership_plan text not null default 'free',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is
  'DayTradingPost member profiles linked one-to-one with Supabase Auth users.';

alter table public.profiles enable row level security;

-- Remove broad browser privileges. Members may read their own profile and only
-- edit full_name. Membership fields remain server-controlled.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

drop policy if exists "Members can view their own profile" on public.profiles;
create policy "Members can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Members can update their own profile" on public.profiles;
create policy "Members can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id)
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

create or replace function public.set_profile_updated_at()
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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_profile_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    membership_status,
    membership_plan
  )
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    coalesce(new.email, ''),
    'free',
    'free'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.handle_user_identity_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    email = coalesce(new.email, email),
    full_name = coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      full_name
    )
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_identity_updated on auth.users;
create trigger on_auth_user_identity_updated
after update of email, raw_user_meta_data on auth.users
for each row execute procedure public.handle_user_identity_update();

-- Backfill profiles for users created before this SQL was installed.
insert into public.profiles (id, full_name, email, membership_status, membership_plan)
select
  users.id,
  nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
  coalesce(users.email, ''),
  'free',
  'free'
from auth.users as users
on conflict (id) do nothing;

-- Verification query: every Auth user should have exactly one profile.
select
  users.id,
  users.email,
  profiles.membership_status,
  profiles.membership_plan
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
order by users.created_at desc;

-- Dashboard configuration required after running this SQL:
-- 1. Authentication > URL Configuration
--    Site URL (local): http://localhost:3001
--    Redirect URLs:
--      http://localhost:3000/auth/callback
--      http://localhost:3001/auth/callback
--      https://YOUR_PRODUCTION_DOMAIN/auth/callback
-- 2. Authentication > Email Templates > Confirm signup
--    Use this confirmation URL:
--    {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
-- 3. Authentication > Providers > Email
--    Keep email/password enabled and choose whether confirmation is required.
-- 4. Configure custom SMTP before production; the default sender is rate-limited.
