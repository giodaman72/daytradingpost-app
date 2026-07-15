# Testing strategy

## Local setup

Use Node.js 24 from `.nvmrc`:

```bash
nvm use
npm ci
```

`npm ci` reproduces the committed lockfile and is used by CI. Use `npm install`
only when deliberately adding, removing, or updating a package.

## Automated quality scripts

| Command                 | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run format`        | Apply Prettier to supported source and documentation                 |
| `npm run format:check`  | Verify formatting without changing files                             |
| `npm run lint`          | Run Next.js, TypeScript, hooks, accessibility, and unused-code rules |
| `npm run lint:fix`      | Apply safe ESLint fixes                                              |
| `npm run typecheck`     | Run strict `tsc --noEmit` validation                                 |
| `npm test`              | Start Vitest in watch mode for local development                     |
| `npm run test:run`      | Run the deterministic test suite once                                |
| `npm run test:coverage` | Run tests with text, JSON, and HTML coverage reports                 |
| `npm run build`         | Create the optimized Next.js production build                        |
| `npm run check`         | Run format, lint, typecheck, tests, and build in order               |

Coverage reporting is configured without an artificial global threshold. Add
targeted thresholds when Sprint 9 introduces the market-intelligence domain.

Tests must not call live Supabase, Sanity, Revolut, or other external services.
Mock provider boundaries and keep domain tests deterministic.

## Git hooks

The `prepare` script installs Husky after dependency installation.

- `pre-commit` runs lint-staged: ESLint fixes and Prettier only on staged files.
- `commit-msg` validates Conventional Commits through Commitlint.
- Full tests and production builds are intentionally left to `npm run check` and
  CI so commits remain fast and unrelated unstaged files are unaffected.

Examples:

```text
feat(dashboard): add market outlook widget
fix(auth): preserve session during redirect
docs: update deployment guide
```

## GitHub checks

The primary workflow runs each gate as a named step after `npm ci`. CodeQL runs
independently for JavaScript/TypeScript security analysis. Dependabot proposes
weekly npm and GitHub Actions updates.

The Lighthouse GitHub workflow builds and starts the production app locally,
then audits `/` through the isolated Lighthouse action. The CLI is intentionally
not a project dependency because its current dependency tree introduces a high
severity development advisory. The workflow is initially non-blocking because
Sanity availability and shared runner timing can affect scores. Console errors
remain a serious assertion and reports are retained as workflow artifacts for
14 days.

## Baseline audit — 2026-07-14

Before Sprint 8.6 changes:

- `npm ci`, `npm run lint`, and `npm run build` passed;
- the remote `main` workflow ran only lint and build with Node.js 24;
- there was no committed formatter, test runner, coverage, hooks, Commitlint,
  Dependabot, CodeQL, or Lighthouse setup;
- TypeScript was strict but unnecessarily allowed JavaScript;
- npm reported a transitive Sanity/Portable Text React peer-version mismatch,
  deprecated transitive UUID packages, install-script approval notices, and 14
  moderate audit findings.

These dependency warnings were recorded rather than hidden or force-fixed.
Major/transitive upgrades require isolated compatibility review.

There is not yet a dedicated unit, integration, or end-to-end test runner. That
is tracked as technical debt and should be introduced with Sprint 9 domain logic.

## Static checks

- Run `git diff --check` for whitespace errors.
- Confirm `.env.local` is ignored.
- Search the diff for service-role, Sanity Viewer, Revolut, and webhook secrets.
- Confirm client files do not import server-only modules.
- Confirm all new domain contracts use TypeScript and absolute `@/*` imports.
- Review generated route output and verify personalized routes are dynamic.

## Manual smoke test

Start the application:

```bash
npm run dev -- --port 3001
```

Verify:

- `/` loads without console errors;
- navigation and footer links preserve their existing appearance/order;
- `/analysis` loads published Sanity summaries;
- a valid article route loads and an invalid slug shows the designed 404;
- newsletter success, duplicate, invalid, missing-consent, and loading states;
- unknown content routes render the intended placeholder pages.

## Responsive testing

Test 320, 375, 768, 1024, and 1440 px widths.

- No horizontal page overflow.
- Header actions remain usable.
- Dashboard section navigation scrolls horizontally when required.
- Two-column layouts stack in reading order.
- Buttons remain visible and touch-friendly.
- Long emails, titles, symbols, and payment references wrap safely.
- Test browser zoom at 200%.

## Accessibility testing

- Navigate all interactive elements using keyboard only.
- Confirm visible focus indication.
- Check heading order and landmark labels.
- Ensure icon-only actions have accessible names.
- Confirm loading, success, and error messages use appropriate live regions.
- Confirm color is not the only status indicator.
- Run an automated accessibility scanner when available, then manually verify
  issues because automated checks are incomplete.

## Authentication testing

Test with a new email and an existing confirmed account:

1. Register with invalid and valid input.
2. Confirm the email and verify the profile trigger.
3. Log in and verify the header account state.
4. Open `/account` and `/dashboard` directly.
5. Log out and confirm protected routes redirect to login.
6. Request password recovery and complete reset.
7. Attempt external/protocol-relative `next` values and confirm they are rejected.
8. Confirm one member cannot read another profile or membership request through
   the Supabase client.

Proxy redirect tests do not replace page-level authorization tests.

## CMS testing

- Publish an author and category before the article.
- Verify required-field validation in Studio.
- Publish free and premium articles with current dates.
- Verify future-dated articles are not listed.
- Verify image crop, alt text, metadata, and Portable Text rendering.
- Verify an empty dataset displays designed empty states.
- Confirm premium summary fields do not contain protected body details.
- Confirm the private dataset rejects unauthenticated direct reads.

## Membership testing

### Shared cases

- Anonymous checkout redirects to login.
- Invalid plan is rejected.
- A pending request does not unlock premium content.
- Active status without `payment_verified_at` does not unlock content.
- Expired `current_period_end` does not unlock content.
- Billing history shows only the signed-in user’s requests.

### Revolut API mode

- Monthly and annual subscription creation.
- Customer ID reuse after retry.
- Valid webhook signature.
- Invalid signature, modified body, and timestamp older than five minutes.
- Multiple signatures during secret rotation.
- Duplicate delivery is idempotent.
- Initiated, overdue, cancelled, and finished states update Supabase correctly.

### Payment-link mode

- Pending row exists before redirect.
- Missing configured link returns a clear error.
- Return/pending page never grants access.
- Administrator approval updates request and profile together.
- Rejection does not grant access.

## Newsletter API testing

| Case                                 | Expected                         |
| ------------------------------------ | -------------------------------- |
| New normalized email with consent    | `201`, row inserted              |
| Existing email with different casing | `200`, duplicate success message |
| Missing/false consent                | `400`                            |
| Invalid email                        | `400`                            |
| Honeypot populated                   | Safe `200`, no row               |
| Non-JSON content type                | `415`                            |
| Oversized request                    | `413`                            |
| Excess attempts                      | `429` with `Retry-After`         |
| Supabase unavailable                 | `503`, no secret details         |

## Sprint 9 test expansion

- Deterministic Sprint 9 suites cover validation, normalization, the instrument
  registry, published filtering, bias distribution, API envelopes, newsletter
  formatting, role checks, empty states, and reusable components.
- `test/fixtures/marketIntelligence.ts` provides non-live editorial fixture data.
- Tests do not call Supabase, Sanity, Revolut, or market providers.
- Future work: Route Handler integration mocks and Playwright authentication,
  editor, premium-gate, and critical-page coverage.
