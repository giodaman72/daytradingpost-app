# Trading Academy 2.0 — Volume 1 compatibility report

This report applies the Trading Academy 2.0 Master Implementation Guide,
Volume 1, to the repository at Sprint 15 Part 2A. It records the implemented
foundation, identifies compatibility risks, and defines the boundary for later
volumes. The repository remains the source of truth.

## Executive status

**Status: compatible with documented follow-up work.**

The application already implements the intended layered LMS architecture:

```text
Academy pages and client interaction islands
  -> protected Route Handlers
    -> Academy domain services
      -> Academy repositories
        -> Sanity published curriculum
        -> Supabase private learner state
```

No competing content, enrollment, progress, prerequisite, assessment, or
certificate model is required. Volume 2 should extend these contracts instead
of introducing a separate learner-dashboard service.

## Repository baseline

| Area           | Repository implementation                                                                                              | Status                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Framework      | Next.js 16.2.10 App Router and React 19.2.4                                                                            | Compatible            |
| Language       | Strict TypeScript, JavaScript disabled                                                                                 | Compatible            |
| Authentication | Supabase cookie sessions with server user verification                                                                 | Compatible            |
| Membership     | Server-side profile entitlement checks                                                                                 | Compatible            |
| CMS            | Sanity 6 schemas and server-only GROQ repository                                                                       | Compatible            |
| Learner state  | Supabase Academy tables, functions, ownership policies and RLS                                                         | Compatible            |
| LMS domain     | `lib/academy` services for access, enrollment, progress, prerequisites, assessments, notes, bookmarks and certificates | Compatible            |
| Analytics      | Allowlisted, authenticated Academy events with identifier-only payloads                                                | Compatible            |
| AI Assistant   | Authorized, sanitized Academy Tutor context foundation                                                                 | Compatible            |
| Dashboard      | Compact Continue Learning integration                                                                                  | Compatible foundation |
| Charts         | No reusable TradingView or Advanced Charts runtime found                                                               | Deferred gap          |
| Testing        | Vitest, Testing Library, formatting, lint, typecheck and production build                                              | Compatible            |
| CI             | GitHub quality workflow, CodeQL and advisory Lighthouse workflow                                                       | Compatible            |

## Layer ownership

### Presentation

- `app/academy` owns routes, metadata, loading, not-found and error states.
- `components/academy` owns cards, curriculum, lesson rendering, video,
  assessment controls, notes and bookmarks.
- Server Components remain the default. Client Components are limited to video,
  learner mutations, assessment state, filters and error reset behavior.
- Client Components do not import the Sanity client, Supabase service client,
  service-role key or Sanity read token.

### Route Handlers

`app/api/academy` is the browser mutation boundary. Handlers parse and validate
input, then call Academy services. They do not calculate enrollment,
prerequisites, official progress, scores, pass state or certificate state.

### Domain services

`lib/academy` owns:

- authentication and membership-aware authorization;
- course and lesson access;
- enrollment and idempotency;
- prerequisite resolution;
- lesson start, progress and completion;
- assessment attempt creation, ordering, scoring, review policy and retakes;
- bookmark and private-note ownership;
- certificate eligibility and verification;
- analytics validation;
- AI Tutor context sanitization.

React components do not duplicate these rules.

### Repositories

`lib/academy/academyRepository.ts` is the Academy data-access boundary. Public
course projections and private lesson projections are separate. Assessment
grading data uses a server-only, no-store query. Supabase access is similarly
isolated behind services and repository helpers.

## Source-of-truth compatibility

### Sanity

Sanity owns:

- courses, modules and lessons;
- instructors;
- learning paths;
- assessments and answer keys;
- certificate templates;
- educational and marketing content.

Schemas use references for relationships. Public queries select published
projections and do not return assessment keys or full unauthorized lesson
content.

### Supabase

Supabase owns:

- enrollments;
- module and lesson progress;
- assessment attempts and learner responses;
- bookmarks and private learner notes;
- issued certificates;
- learning-path enrollments;
- Academy analytics and administrative audit records.

The migration enables RLS on every Academy learner table. Authenticated users
receive read access only to their own rows. Authoritative mutations and database
functions are restricted to the service role.

## Server and client boundary

The current boundary matches Volume 1:

- course discovery, course detail, curriculum, lesson content, access decisions
  and metadata render on the server;
- video playback, progress controls, notes, bookmarks and assessments are
  focused Client Components;
- private course and lesson routes are dynamically rendered;
- attempts, notes, bookmarks and grading queries are not publicly cached;
- public Sanity projections use conservative 60-second revalidation.

The root `proxy.ts` provides coarse session handling, but protected pages and
handlers repeat authorization. Proxy behavior is not the security boundary.

## Security compatibility

Implemented controls:

- authentication on private reads and every learner mutation;
- repeated user ownership checks;
- membership and enrollment checks for premium lessons and resources;
- course-to-lesson and lesson-to-resource association validation;
- RLS and read-only authenticated browser access;
- service-role-only enrollment and grading functions;
- server-only official progress, scoring, pass state and certificates;
- public assessment types without answer keys, tolerances or explanations;
- server-side result redaction based on assessment review policy;
- safe URL validation for videos and external resources;
- private/no-store response boundaries;
- analytics payloads that exclude answers, notes, emails and protected URLs;
- no browser import of private provider credentials.

Partially implemented:

- Download access is reauthorized by
  `/api/academy/resources/[resourceId]`, but the final upstream URL is returned
  through a redirect. A private provider signing adapter or bounded streaming
  proxy is still required for assets whose origin URL must never be reusable.
- Video sources are allowlisted and authorized, but there is no private
  streaming-signature adapter or DRM claim.

## Performance compatibility

Implemented:

- lightweight public course projections;
- full lesson bodies fetched only after access checks;
- no per-lesson query in curriculum rendering;
- `next/image` for Academy images;
- route-level loading states;
- provider-neutral video code loaded only on lesson pages;
- coarse progress checkpoints rather than per-second writes;
- public-only caching and private dynamic rendering.

Scale follow-up:

- The catalog currently loads a bounded set of 100 published courses and
  applies filters and pagination in the server process. Before the catalog
  exceeds that boundary, move validated filters, sorting, total count and page
  slicing into parameterized GROQ queries.
- Sanity content uses timed/tagged revalidation, but there is no signed Sanity
  webhook or Live Content integration for immediate publishing updates.
- The Studio remains embedded at `/studio`. It works, but a standalone Studio
  should be evaluated before wider editorial adoption to reduce Next.js build
  coupling and support Sanity’s preferred development workflow.

## Accessibility compatibility

The Academy targets WCAG 2.2 AA through:

- semantic headings, landmarks, lists and breadcrumbs;
- native disclosure controls for curriculum and transcripts;
- labelled forms, fieldsets and legends;
- textual progress, completion, locked and premium states;
- keyboard alternatives for ordering and matching;
- accessible status, alert and timer announcements;
- visible focus and reduced-motion styles;
- touch-friendly responsive controls;
- a textual alternative for chart-practice lessons.

The repository does not yet contain an automated axe suite or authenticated
screen-reader/end-to-end Academy suite. Those checks remain required before
production launch.

## Analytics compatibility

Academy analytics use a fixed event allowlist and authenticated server
ingestion. Only course, module, lesson and assessment identifiers are accepted.
Idempotency and mutation rate limiting are applied. Private notes, assessment
responses, answer keys, user email and credential-bearing URLs are excluded.

## Charts compatibility

No reusable TradingView, Advanced Charts or Lightweight Charts runtime exists
in this worktree. Chart-practice lessons therefore render an accessible
instructional and historical/delayed-data fallback. A future chart adapter must:

- use the centralized instrument registry;
- distinguish delayed, historical and illustrative values;
- expose a text alternative;
- avoid trade execution and personalized advice;
- remain optional so chart failure cannot block the lesson.

## Documentation and operations

The Academy architecture, learner routes, lesson player, assessment UI, video,
accessibility, APIs, deployment, testing, content authoring and AI boundary are
documented under `docs/`. The Supabase migration and manual RLS verification
steps remain environment-owned operations and are not inferred from a
successful application build.

## Open risks and required follow-up

| Priority | Follow-up                                                                          | Recommended volume       |
| -------- | ---------------------------------------------------------------------------------- | ------------------------ |
| High     | Apply and manually verify Academy SQL/RLS in every environment                     | Before production        |
| High     | Keep the Sanity dataset private before graded assessments are published            | Before production        |
| High     | Add signed or proxied private asset delivery when private resources are introduced | Resource/video hardening |
| Medium   | Add authenticated Academy E2E and automated accessibility coverage                 | Volume 8                 |
| Medium   | Move large-catalog filtering/count/pagination into GROQ                            | Volume 8                 |
| Medium   | Add Sanity webhook or Live Content invalidation                                    | Volume 8                 |
| Medium   | Evaluate migration from embedded to standalone Studio                              | Editorial tooling        |
| Medium   | Review transitive npm advisories without forcing breaking downgrades               | Volume 8                 |
| Deferred | Add an approved Advanced Charts adapter                                            | Chart-practice expansion |

## Volume 2 readiness

The repository is ready for the My Learning Dashboard volume. Volume 2 should
reuse:

- `listUserEnrollments` for the learner’s owned enrollments;
- existing course summary projections for display;
- stored module and lesson progress as authoritative state;
- the current `/academy/courses/[courseSlug]/learn` resume resolver;
- certificate eligibility as read-only future state;
- current membership and authentication helpers;
- the established dashboard panel, empty-state and loading conventions.

Volume 2 must not introduce a second enrollment table, progress calculator,
resume algorithm, course cache, membership check or Academy analytics
vocabulary.
