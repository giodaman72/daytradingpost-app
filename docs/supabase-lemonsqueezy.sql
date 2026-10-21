-- Lemon Squeezy checkout support.
-- Run once in the Supabase SQL editor before setting
-- PAYMENT_PROVIDER_MODE=lemonsqueezy. Safe to run more than once.

alter table public.membership_requests
  drop constraint if exists membership_requests_provider_mode_check;

alter table public.membership_requests
  add constraint membership_requests_provider_mode_check
  check (provider_mode in ('lemonsqueezy', 'revolut_api', 'revolut_payment_links'));
