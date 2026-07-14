# Deployment guide

## Environments

DayTradingPost uses three logical environments:

- **Local** — `.env.local`, local Next.js server, development Supabase/Sanity data
- **Preview** — one Vercel deployment per pull request
- **Production** — canonical domain deployed from `main`

Do not share production service-role, Sanity Viewer, Revolut API, or webhook
secrets with local or untrusted Preview environments.

## Git workflow

1. Start from the latest accepted branch or `main` as specified by the sprint.
2. Create a descriptive branch, for example `sprint-9-market-intelligence`.
3. Keep commits scoped and reviewable.
4. Run lint, build, and feature acceptance checks locally.
5. Push the branch and open a pull request into `main`.
6. Review the Vercel Preview deployment and automated checks.
7. Merge only after approval. Never commit directly to `main` for sprint work.

## GitHub

- Protect `main` from force pushes and direct unreviewed changes.
- Require passing CI checks and at least one review when collaborators are added.
- Do not paste secrets, `.env.local`, payment payloads, or user data into issues.
- Use GitHub environment protection for production deployment secrets if CI
  performs deployments.

## Environment variables

Copy `.env.example` to `.env.local` and fill values locally. Never commit the
result.

### Supabase

| Variable | Exposure |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public browser key protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret |

### Sanity

| Variable | Exposure |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public identifier |
| `NEXT_PUBLIC_SANITY_DATASET` | Public dataset name; use `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Public version date |
| `SANITY_API_READ_TOKEN` | Server-only Viewer token |

The production dataset containing premium bodies must be private.

### Revolut

| Variable | Exposure |
| --- | --- |
| `PAYMENT_PROVIDER_MODE` | Server configuration |
| `REVOLUT_API_SECRET` | Server-only secret |
| `REVOLUT_WEBHOOK_SECRET` | Server-only signing secret |
| `REVOLUT_API_BASE_URL` | Server API origin |
| `REVOLUT_MONTHLY_PLAN_ID` | Server plan variation ID |
| `REVOLUT_ANNUAL_PLAN_ID` | Server plan variation ID |
| `NEXT_PUBLIC_REVOLUT_MONTHLY_PAYMENT_LINK` | Public hosted URL |
| `NEXT_PUBLIC_REVOLUT_ANNUAL_PAYMENT_LINK` | Public hosted URL |
| `NEXT_PUBLIC_SITE_URL` | Public canonical application origin |

## Supabase preparation

For a new environment, run the SQL in this order:

1. `docs/supabase-auth.sql`
2. `docs/supabase-newsletter.sql`
3. `docs/supabase-revolut.sql`

Then verify:

- profile trigger creates one row per Auth user;
- RLS is enabled;
- anon/authenticated roles cannot write protected membership fields;
- service-role operations run only from server code;
- local and production Auth callback URLs are allow-listed.

Treat future schema changes as versioned migrations. Back up production and test
reversible changes before applying destructive SQL.

## Sanity preparation

1. Set the project ID, dataset, and API version.
2. Add the deployment origin to Sanity CORS with credentials when required.
3. Create a least-privileged Viewer token for server reads.
4. Open `/studio`, authenticate, and publish a test author, category, and article.
5. Verify free and premium rendering on the Preview deployment.

See `docs/sanity-setup.md` for the full workflow.

## Revolut preparation

Choose one mode and follow `docs/revolut-setup.md`.

For Merchant API mode:

- use the production API origin only in Production;
- configure the public HTTPS webhook URL;
- subscribe only to required events;
- store the current signing secret;
- complete monthly, annual, cancelled, overdue, and duplicate-event tests.

For payment-link mode:

- create separate monthly and annual links;
- verify every payment manually before granting access;
- test the pending and administrator approval workflow.

## Vercel setup

1. Import the GitHub repository into Vercel.
2. Confirm framework detection selects Next.js.
3. Add variables separately for Development, Preview, and Production.
4. Use `npm run build` as the build command.
5. Confirm the production domain and `NEXT_PUBLIC_SITE_URL` match exactly.
6. Update Supabase, Sanity, and Revolut allow-lists/webhooks for the domain.

## Production deployment checklist

- [ ] Pull request approved and CI green
- [ ] `npm run lint` passes
- [ ] `npm run build` passes with no actionable warning
- [ ] No secrets or `.env.local` in the diff
- [ ] Database migrations applied and verified
- [ ] Sanity dataset is private and Viewer token works
- [ ] Auth registration, confirmation, login, logout, recovery, and reset pass
- [ ] Newsletter insert and duplicate behavior pass
- [ ] Membership pending/verified/cancelled behavior passes
- [ ] Revolut webhook signature and idempotency pass in API mode
- [ ] Premium article cannot be read without server entitlement
- [ ] Desktop/mobile layouts and keyboard navigation pass
- [ ] Error and empty states are understandable
- [ ] Monitoring owner and rollback commit are identified

## Rollback

Application rollback uses Vercel’s previous known-good deployment or a Git
revert. Database rollback requires an explicit tested migration; deploying old
application code does not automatically revert schema. Disable a failing
provider integration through safe configuration when possible, then investigate
without exposing user or payment data in logs.
