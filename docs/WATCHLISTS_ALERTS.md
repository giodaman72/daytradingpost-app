# Watchlists and Smart Alerts

## Architecture audit

Sprint 12 found that the prior watchlist and notification types, dashboard widgets, hooks, and notification formatter were future-facing placeholders rather than persistence boundaries. There was no email-delivery provider. The implementation preserves the static dashboard type separately, replaces the persisted types, extends the existing Supabase/auth/membership boundaries, and adds a provider-neutral disabled email channel rather than inventing delivery credentials.

```text
Authenticated Server Component / Server Action
  -> ownership and membership limits
  -> watchlist or alert service
  -> server-only Supabase repository
  -> RLS-protected member rows

Protected scheduler endpoint
  -> bounded active-alert batch
  -> Market Data / Market Intelligence / Economic Intelligence / Sanity
  -> pure evaluator (freshness, cooldown, expiry, dedupe)
  -> alert_history
  -> dashboard notification + optional email channel
```

## Ownership and membership limits

Every management operation resolves the verified Supabase user and includes `user_id` in repository predicates. RLS repeats that boundary. Administrators receive no implicit private-watchlist policy. Free members receive one watchlist, five instruments, three active alerts, dashboard notifications, and 30-day history. Premium members receive ten watchlists, 25 instruments per list, 50 active alerts, dashboard/email channels, advanced alert types, and 365-day history.

On downgrade, existing records are not deleted. New creation and resume operations enforce the lower limit; email and advanced alert creation are unavailable until entitlement returns. A future reconciliation job should pause over-limit alerts explicitly.

## Alert evaluation

Supported types include price/percentage thresholds, bias changes, support/resistance levels, new analysis/intelligence, economic reminders/releases, and webinar reminders. Conditions support `gt`, `gte`, `lt`, `lte`, `changed`, `published`, `scheduled_within`, and `released`.

Decimal strings become fixed-scale integers before comparison. Missing, stale, expired, cooling-down, or simulated inputs never trigger. Delayed verified data may trigger but is disclosed. Each source event creates a stable deduplication key and unique history row. One failed alert does not abort its batch.

Economic reminders retain the provider event ID and re-read its current scheduled time during evaluation, so schedule revisions are respected. Cancelled or missing events do not trigger.

## Notifications and email

Dashboard notifications are persisted and member-readable. Header data is server-rendered without polling. Email is provider-neutral and disabled by default. `ALERT_EMAIL_PROVIDER=mock` is allowed only outside production; production returns `skipped` until a real adapter is approved. Delivery failure remains visible in history and never removes the trigger record. Templates escape dynamic content, disclose delayed data, link to preferences, and include an educational disclaimer.

## Scheduler

`POST /api/internal/alerts/evaluate` requires `Authorization: Bearer $ALERT_CRON_SECRET`. It bounds batches to 100, times out after 50 seconds, rejects overlapping runs on the same instance, logs identifiers/statistics without secrets, and returns `no-store` results. Invoke every 15 minutes initially; do not schedule faster until provider rights and rate limits are confirmed. Multi-instance locking requires a future database advisory lock.

## Database and RLS

Run `docs/supabase-watchlists-alerts.sql` after the auth migration. It creates `watchlists`, `watchlist_items`, `alerts`, `alert_history`, and `notifications`; indexes ownership/evaluation/history paths; enables RLS; limits browser update columns; prohibits browser history/notification insertion; and grants trusted evaluation to `service_role`.

Recommended retention is 30 days for free users and 365 days for Premium. Implement cleanup through a trusted scheduled database function after confirming audit requirements.

## Production checklist

- Apply SQL and verify every new table reports RLS enabled.
- Test two accounts cannot read or mutate each other's records.
- Configure a long random cron secret in Vercel only.
- Keep batch 25 and maximum data age 900 seconds initially.
- Leave email disabled until a provider, sender domain, unsubscribe policy, and retry adapter are approved.
- Confirm the market-data provider permits automated alert evaluation.
- Verify simulated quotes and fixtures never trigger.
- Monitor duration, failure counts, provider usage, and delivery status.
- Test downgrade, expiration, cooldown, duplicates, cancelled events, and provider outages.

## Troubleshooting and limitations

If tables are missing, apply the migration before opening member pages. If alerts never evaluate, verify the cron secret and endpoint logs. If price alerts skip, inspect quote freshness, simulated status, and provider timestamp. Browser push, distributed rate limits/locks, drag-and-drop, automatic downgrade reconciliation, production email delivery, and provider-specific retry queues remain future work; the service exposes keyboard-compatible ordering methods.
