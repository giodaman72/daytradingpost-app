-- DayTradingPost purchase confirmation and audited manual approval support.
-- Run after docs/supabase-revolut.sql in Supabase Dashboard > SQL Editor.

alter table public.membership_requests
  add column if not exists provider_transaction_reference text,
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists confirmation_email_id text;

create unique index if not exists membership_requests_provider_transaction_key
  on public.membership_requests (lower(provider_transaction_reference))
  where provider_transaction_reference is not null;

-- Replace the original dashboard-only helper with an operator-attributed,
-- one-way verification function. A repeated approval cannot extend access.
drop function if exists public.verify_membership_request(uuid, boolean, text);

create or replace function public.verify_membership_request(
  request_id uuid,
  approve boolean,
  notes text,
  provider_reference text,
  operator_id uuid
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
  if not exists (
    select 1
    from public.profiles
    where id = operator_id and app_role = 'admin'
  ) then
    raise exception 'Administrator access is required';
  end if;

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

  if target.status <> 'pending' then
    raise exception 'Only pending membership requests can be verified';
  end if;

  if approve and (
    provider_reference is null
    or length(trim(provider_reference)) < 3
    or length(trim(provider_reference)) > 200
  ) then
    raise exception 'A valid Revolut transaction reference is required';
  end if;

  update public.membership_requests
  set
    status = case when approve then 'verified' else 'rejected' end,
    verified_at = case when approve then verified_time else null end,
    verified_by = operator_id,
    provider_transaction_reference =
      case when approve then trim(provider_reference) else null end,
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
    if not found then
      raise exception 'Membership profile not found';
    end if;
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

revoke all on function public.verify_membership_request(uuid, boolean, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.verify_membership_request(uuid, boolean, text, text, uuid)
  to service_role;

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'membership_requests'
  and column_name in (
    'provider_transaction_reference',
    'confirmation_email_sent_at',
    'confirmation_email_id'
  )
order by column_name;
