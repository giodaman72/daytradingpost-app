# Revolut membership setup

DayTradingPost supports one payment mode at a time. Both modes require the
Supabase authentication setup and the membership tables in
`docs/supabase-revolut.sql`.

## 1. Prepare Supabase

1. Open the same Supabase project used by the application.
2. Run `docs/supabase-auth.sql` first if the profiles table is not installed.
3. Open **SQL Editor**, paste the contents of `docs/supabase-revolut.sql`, and
   run it.
4. Confirm that `profiles`, `membership_requests`, and
   `payment_webhook_events` have Row Level Security enabled.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. It is used by checkout and the
   webhook because browser users cannot write payment status.

## 2. Common environment variables

Set these in `.env.local` for development and in the production hosting
environment. Restart the development server after changes.

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3001
PAYMENT_PROVIDER_MODE=revolut_payment_links
```

Use the exact production origin for `NEXT_PUBLIC_SITE_URL` in production. Do
not add a trailing slash.

## Mode A: Revolut Merchant API

1. Obtain a Merchant API secret from the Revolut Business merchant settings.
2. Create monthly and annual subscription plans in Revolut. The values used by
   this application are the **plan variation IDs** accepted by the subscription
   creation endpoint.
3. Use the correct API host for the environment. The production base is
   normally `https://merchant.revolut.com/api`; use the sandbox host supplied by
   Revolut while testing.
4. Configure:

```dotenv
PAYMENT_PROVIDER_MODE=revolut_api
REVOLUT_API_SECRET=
REVOLUT_API_BASE_URL=https://merchant.revolut.com/api
REVOLUT_MONTHLY_PLAN_ID=
REVOLUT_ANNUAL_PLAN_ID=
REVOLUT_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
```

5. In Revolut, create a webhook pointing to:
   `https://YOUR_DOMAIN/api/webhooks/revolut`
6. Subscribe it to `SUBSCRIPTION_INITIATED`, `SUBSCRIPTION_FINISHED`,
   `SUBSCRIPTION_CANCELLED`, and `SUBSCRIPTION_OVERDUE`.
7. Copy the webhook signing secret into `REVOLUT_WEBHOOK_SECRET`.

The Route Handler reads the unmodified request body, checks the timestamp is
within five minutes, validates any `v1` HMAC-SHA256 signature, records a unique
event key, retrieves the current subscription from Revolut, and then updates
Supabase. Failed processing removes the event lock so Revolut can retry.

The application uses Merchant API version `2026-04-20`. Review Revolut's
version migration notes before changing it.

## Mode B: Revolut Payment Links

1. Create one hosted payment link for the monthly offer and one for the annual
   offer in Revolut Business.
2. Configure each hosted link's completion/return instructions to send members
   back to `https://YOUR_DOMAIN/membership/pending` when Revolut supports a
   return URL for that link.
3. Configure:

```dotenv
PAYMENT_PROVIDER_MODE=revolut_payment_links
NEXT_PUBLIC_REVOLUT_MONTHLY_PAYMENT_LINK=
NEXT_PUBLIC_REVOLUT_ANNUAL_PAYMENT_LINK=
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
```

Before redirecting, DayTradingPost creates a `pending` request with a unique
payment reference. A hosted payment-link return never activates premium access.

### Verify a payment-link request

1. In Supabase **SQL Editor**, list the pending verification queue with:

```sql
select
  membership_requests.id,
  profiles.email,
  membership_requests.membership_plan,
  membership_requests.payment_reference,
  membership_requests.created_at
from public.membership_requests
join public.profiles on profiles.id = membership_requests.user_id
where membership_requests.status = 'pending'
order by membership_requests.created_at;
```

2. Compare the Revolut transaction, member email, selected plan, amount, and
   approximate payment time with the pending request. Personal payment links
   may not copy the application's internal payment reference into Revolut, so
   do not approve a request using the reference alone.
3. Copy the request's `id`.
4. In Supabase **SQL Editor**, approve it with:

```sql
select public.verify_membership_request(
  'MEMBERSHIP_REQUEST_UUID',
  true,
  'Verified against Revolut transaction REFERENCE'
);
```

To reject an unmatched request, run the same function with `false`. The
function is unavailable to normal browser users and updates the request and
profile together.

## Production checks

- Complete one monthly and one annual checkout in the selected environment.
- Confirm the profile remains `pending` until a signed webhook or administrator
  verification succeeds.
- Confirm duplicate webhook deliveries do not create duplicate changes.
- Confirm a free user sees only a premium preview and an active, verified user
  can read the full article.
- Keep the Sanity dataset private and configure `SANITY_API_READ_TOKEN`; a public
  dataset would let visitors bypass the application and query article bodies.
- Confirm cancelling or overdue subscription events remove premium access.
- Never place `REVOLUT_API_SECRET`, `REVOLUT_WEBHOOK_SECRET`, or
  `SUPABASE_SERVICE_ROLE_KEY` in client components or `NEXT_PUBLIC_` variables.
