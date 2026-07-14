# Testing strategy

## Current automated gates

```bash
npm run lint
npm run build
```

`npm run lint` runs ESLint across the project. `npm run build` performs the
optimized Next.js build, TypeScript checking, page-data collection, and route
generation. Both must pass before a sprint is complete.

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

| Case | Expected |
| --- | --- |
| New normalized email with consent | `201`, row inserted |
| Existing email with different casing | `200`, duplicate success message |
| Missing/false consent | `400` |
| Invalid email | `400` |
| Honeypot populated | Safe `200`, no row |
| Non-JSON content type | `415` |
| Oversized request | `413` |
| Excess attempts | `429` with `Retry-After` |
| Supabase unavailable | `503`, no secret details |

## Recommended Sprint 9 test tooling

- Add a fast unit runner for pure intelligence, validation, and normalization logic.
- Add integration tests for Route Handlers with mocked provider boundaries.
- Add Playwright for authentication redirects, premium gates, and critical pages.
- Add CI coverage thresholds for Sprint 9 domain logic, not generated UI markup.
- Add fixture builders for market snapshots, articles, profiles, and membership events.
