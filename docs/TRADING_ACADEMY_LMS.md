# Trading Academy 2.0 — LMS backend

## Sprint 15 Part 2A

The primary learner experience is implemented across the public catalog,
course pages, private curriculum, lesson player, assessments, bookmarks, notes,
resources and dashboard entry point. See
`docs/ACADEMY_LEARNER_EXPERIENCE.md` for the canonical routes, authorization
boundary, media behavior and Part 2B deferrals.

## Part 1 scope

Sprint 15 Part 1 establishes the content model, learner-state database,
authorization, enrollment transaction, progress/scoring primitives,
certificate-verification foundation, learner notes/bookmarks, API routes,
analytics vocabulary, tests, and administrator permissions. It intentionally
does not replace the existing learner-facing Academy page. The catalog, lesson
player, quiz experience, progress dashboard, and certificate presentation are
Part 2.

## Architecture audit

Before this sprint, Academy content consisted of hard-coded homepage and
catch-all copy, a placeholder dashboard progress widget, and a one-document AI
retrieval stub. There were no course, module, lesson, quiz, learning-path,
progress, enrollment, bookmark, note, review, or certificate records. Webinars
were placeholder application copy. Sanity contained article, author, and
category types only. Supabase already owned authentication, profiles,
membership, watchlists, alerts, notifications, and AI conversation state.

No legacy learner progress exists to migrate. Existing `/academy` and
`/webinars` URLs remain intact.

## Source of truth

| Entity                                              | Owner                           |
| --------------------------------------------------- | ------------------------------- |
| Course, module, lesson, instructor, resource, video | Sanity                          |
| Assessment definition and answer key                | Private Sanity dataset          |
| Learning path and certificate template              | Sanity                          |
| Enrollment, progress, attempt and response          | Supabase                        |
| Bookmark, private note, issued certificate          | Supabase                        |
| Access, prerequisites, scoring and completion       | Server-only Academy services    |
| Membership state                                    | Existing Supabase `profiles`    |
| Notifications and analytics vocabulary              | Existing application boundaries |

Supabase stores stable Sanity IDs and explicit version numbers, never full
lesson bodies. Sanity publication status always wins. Ordinary browser roles
have read-only access to their own learner rows; mutations use authenticated
server routes and the service client.

## Lifecycle

Courses move through draft, review, scheduled, published, and archived.
Published courses require a slug, objective, duration, instructor, and at least
one module. Enrollment checks authentication, publication, premium membership,
course prerequisites, and duplicate active enrollment before calling the
transactional `enroll_academy_course` database function. That function creates
the enrollment and initial module/lesson rows atomically.

Downgrades do not delete progress or earned certificates. Premium course bodies
and resources remain inaccessible until entitlement returns. Previously earned
certificates remain visible unless explicitly revoked.

## Security boundaries

- `SANITY_API_READ_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are server-only.
- Use a **private Sanity dataset before publishing graded assessments**.
  Projection-level answer hiding does not protect keys stored in a public
  dataset from direct Sanity API queries.
- Public course queries return published projections only.
- Assessment start responses omit `correctAnswer` and `explanation`.
- Grading fetches keys with the server token and stores scores, not keys.
- Learners cannot write scores, passed state, course completion, or certificates.
- Notes are private and excluded from analytics, notifications, and AI context.
- Certificate verification returns snapshots only, never user ID or email.

## Part 2A learner architecture

Public Academy landing, catalog, search, and course pages use lightweight
published Sanity projections. Private curriculum and lesson routes resolve the
current Supabase user, membership, enrollment, prerequisite state, and lesson
ownership before requesting a full lesson projection. Interactive controls are
small Client Components that call protected routes; they never import Sanity
tokens or the Supabase service client.

The centralized lesson renderer supports text, video, mixed, quiz, assessment,
downloadable, webinar replay, chart practice, and external resource lessons.
Unsupported types render a safe unavailable state. Assessment question order
comes from the stored attempt, official scoring remains server-only, and review
fields are removed before serialization when the Sanity policy disallows them.

## Known limitations

- The full learner Academy dashboard, learning-path experience, certificate
  wallet/PDF, review UI, admin UI, advanced reporting, recommendations,
  notifications, and complete Tutor chat are deferred to Part 2B.
- Certificate PDF generation is not implemented.
- Content review workflow is modeled but does not automate Sanity approvals.
- Distributed rate limiting should replace the current instance-local limiter
  before high-scale production traffic.
- In-progress attempts require their exact Sanity assessment version to remain
  available. Breaking edits should create a new assessment document/version.
- Reviews were not implemented: moderation, identity display, and product value
  need a product decision first.
- Background reminder and reconciliation interfaces are documented but not
  scheduled in Part 1.

## Manual setup

1. Back up the Supabase project.
2. Run `docs/supabase-trading-academy-lms.sql` in Supabase SQL Editor.
3. Confirm all `academy_*` tables have RLS enabled.
4. Run the manual isolation checklist in `docs/TESTING.md`.
5. Deploy the new Sanity schemas.
6. Make the Sanity dataset private and configure `SANITY_API_READ_TOKEN`.
7. Add the Academy configuration variables from `.env.example`.
8. Create content in dependency order: instructors, templates, assessments,
   lessons, modules, courses, learning paths.
9. Do not publish graded assessments until answer-key privacy is verified.
