# Deployment guide

## AI Assistant launch

Apply `docs/supabase-ai-assistant.sql`, then add server-only `AI_*` and
`OPENAI_*` values from `.env.example` to Vercel. Never use the development
provider in production. Review model, usage, timeout, retention, and optional
pricing values independently per environment.

## Environments

DayTradingPost uses three logical environments:

- **Local** — `.env.local`, local Next.js server, development Supabase/Sanity data
- **Preview** — one Vercel deployment per pull request
- **Production** — canonical domain deployed from `main`

Do not share production service-role, Sanity Viewer, Revolut API, or webhook
secrets with local or untrusted Preview environments.

## Git workflow

1. Use Node.js 24 from `.nvmrc` and run `npm ci` from the committed lockfile.
2. Start from the latest accepted branch or `main` as specified by the sprint.
3. Create a descriptive branch, for example `sprint-9-market-intelligence`.
4. Use Conventional Commits and keep commits scoped and reviewable.
5. Run `npm run check` plus relevant feature acceptance checks locally.
6. Push the branch and open a pull request into `main`.
7. Review GitHub checks and the Vercel Preview deployment.
8. Merge only after approval. Never commit directly to `main` for sprint work.

## GitHub

- Require a pull request before merging into `main`.
- Require the primary quality and CodeQL status checks.
- Require branches to be up to date before merging.
- Require all review conversations to be resolved.
- Block force pushes and branch deletion.
- Optionally require one approval when collaborators are added.
- Do not paste secrets, `.env.local`, payment payloads, or user data into issues.

These branch-protection settings require repository-administrator configuration
and are not changed by the workflow files.

### GitHub automation

- `ci.yml` runs format checking, ESLint, TypeScript, Vitest, and a production
  build for pull requests into `main` and pushes to `main`.
- `codeql.yml` analyzes JavaScript/TypeScript on pull requests, pushes, and every
  Monday. If GitHub CodeQL default setup is enabled, disable it before enabling
  the advanced workflow so scans are not duplicated.
- `performance.yml` builds and audits the public homepage with Lighthouse. It is
  advisory during the foundation phase because CMS responses, runner load, and
  cold starts introduce variance.
- Dependabot checks npm and GitHub Actions weekly. Compatible minor/patch updates
  are grouped; major updates remain separate for deliberate review.

GitHub Actions never receives deployment credentials and never deploys the app.

## Environment variables

Copy `.env.example` to `.env.local` and fill values locally. Never commit the
result.

### Supabase

| Variable                               | Exposure                            |
| -------------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public project URL                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public browser key protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only secret                  |

### Sanity

| Variable                         | Exposure                              |
| -------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Public identifier                     |
| `NEXT_PUBLIC_SANITY_DATASET`     | Public dataset name; use `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Public version date                   |
| `SANITY_API_READ_TOKEN`          | Server-only Viewer token              |

The production dataset containing premium bodies must be private.

### Revolut

| Variable                                   | Exposure                            |
| ------------------------------------------ | ----------------------------------- |
| `PAYMENT_PROVIDER_MODE`                    | Server configuration                |
| `REVOLUT_API_SECRET`                       | Server-only secret                  |
| `REVOLUT_WEBHOOK_SECRET`                   | Server-only signing secret          |
| `REVOLUT_API_BASE_URL`                     | Server API origin                   |
| `REVOLUT_MONTHLY_PLAN_ID`                  | Server plan variation ID            |
| `REVOLUT_ANNUAL_PLAN_ID`                   | Server plan variation ID            |
| `NEXT_PUBLIC_REVOLUT_MONTHLY_PAYMENT_LINK` | Public hosted URL                   |
| `NEXT_PUBLIC_REVOLUT_ANNUAL_PAYMENT_LINK`  | Public hosted URL                   |
| `NEXT_PUBLIC_SITE_URL`                     | Public canonical application origin |

### Economic intelligence

| Variable                 | Exposure                                       |
| ------------------------ | ---------------------------------------------- |
| `ECONOMIC_DATA_PROVIDER` | Server setting; use `development` locally only |
| `ECONOMIC_CACHE_SECONDS` | Server cache duration; defaults to 300 seconds |

### Smart alerts

| Variable                         | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| `ALERT_CRON_SECRET`              | Server-only evaluator bearer secret            |
| `ALERT_EVALUATION_BATCH_SIZE`    | Batch size, default 25 and maximum 100         |
| `ALERT_DATA_MAX_AGE_SECONDS`     | Maximum accepted quote age, default 900        |
| `ALERT_DEFAULT_COOLDOWN_MINUTES` | Default cooldown, 60 minutes                   |
| `ALERT_EMAIL_PROVIDER`           | Keep disabled until an approved adapter exists |

## Supabase preparation

For a new environment, run the SQL in this order:

1. `docs/supabase-auth.sql`
2. `docs/supabase-newsletter.sql`
3. `docs/supabase-revolut.sql`
4. `docs/supabase-economic.sql`
5. `docs/supabase-watchlists-alerts.sql`

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

The Vercel GitHub integration creates an isolated Preview deployment for each
pull request. Use that URL for responsive, authentication, CMS, and membership
acceptance checks. A merge to `main` remains the production deployment trigger.
GitHub Actions validates the same commit independently and does not replace the
Vercel build.

## Troubleshooting CI

1. Open the failed GitHub check and identify the first failing named step.
2. Check out the same commit and run `nvm use`, then `npm ci`.
3. Reproduce the specific script locally before running `npm run check`.
4. For format failures, run `npm run format` and review the diff.
5. For lint or type failures, fix the source rather than weakening rules.
6. For test failures, use `npm test -- <file>` while developing, then rerun
   `npm run test:run`.
7. For build failures, compare environment availability and confirm integrations
   degrade safely without private credentials.
8. For Lighthouse variance, inspect the uploaded report and rerun the advisory
   job; do not weaken serious console-error assertions without investigation.

Do not retry repeatedly when a deterministic quality step fails. Fix the cause
and push a new commit so concurrency cancels the obsolete run.

## Production deployment checklist

- [ ] Pull request approved and CI green
- [ ] `npm run check` passes
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
- [ ] Market-data display and redistribution rights are contractually confirmed
- [ ] Server-only market-data variables are configured; fixtures are absent
- [ ] Quote unavailable, stale, delayed, rate-limit, and health paths are tested
- [ ] Optional snapshot SQL and seven-day retention job are verified
- [ ] Economic event RLS, indexes, and fixture rejection are verified
- [ ] Production economic provider rights, attribution, and adapter are approved
- [ ] Economic fixtures are disabled and calendar timezone/filter flows pass
- [ ] Academy SQL is applied and every `academy_*` table has RLS enabled
- [ ] Sanity dataset is private before graded assessments are published
- [ ] Academy Viewer token, course projections, enrollment and grading work
- [ ] Cross-user Academy isolation and protected calculated fields are verified
- [ ] Academy configuration values are set for Preview and Production

## Rollback

Application rollback uses Vercel’s previous known-good deployment or a Git
revert. Database rollback requires an explicit tested migration; deploying old
application code does not automatically revert schema. Disable a failing
provider integration through safe configuration when possible, then investigate
without exposing user or payment data in logs.
