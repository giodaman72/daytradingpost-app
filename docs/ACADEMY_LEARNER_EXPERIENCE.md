# Trading Academy 2.0 learner experience

Sprint 15 Part 2A adds the primary learner-facing interface on top of the Part 1
Sanity and Supabase services.

## Routes

| Route                                              | Access                     | Purpose                                                              |
| -------------------------------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `/academy`                                         | Public                     | Academy landing page and featured published courses                  |
| `/academy/courses`                                 | Public                     | Searchable and filterable course catalog                             |
| `/academy/search`                                  | Public, no-index           | Dedicated course search results                                      |
| `/academy/courses/[courseSlug]`                    | Public summary             | Course SEO, overview, objectives, curriculum metadata and enrollment |
| `/academy/courses/[courseSlug]/learn`              | Authenticated and enrolled | Private curriculum and stored progress                               |
| `/academy/courses/[courseSlug]/learn/[lessonSlug]` | Authorized learner         | Text, video, mixed content, resources, progress, bookmarks and notes |
| `/academy/assessments/attempts/[attemptId]`        | Attempt owner              | Refresh-safe active assessment attempt                               |
| `/academy/assessments/attempts/[attemptId]/result` | Attempt owner              | Server-graded result and policy-controlled review                    |

The earlier `/academy/courses/[courseSlug]/lessons/[lessonSlug]` and
`/academy/assessments/[attemptId]` routes remain compatible. Public course
lookups also redirect a matching legacy Sanity slug to the canonical slug.

## Authorization boundary

- Public queries return published course summaries and curriculum metadata only.
- Full lesson bodies, video fields and downloadable resource URLs are fetched
  by a server-only query after authentication, current membership, enrollment
  and prerequisites are checked.
- Premium lesson media and resources use the same current server-side
  membership decision. Client controls never grant access.
- Assessment answer keys, explanations, matching assignments and numeric
  tolerances stay in the server-only grading projection. Attempt reads return
  only learner-safe questions and stored post-grade feedback.
- Bookmarks and learner notes remain owner-scoped in Supabase.

## Media behavior

The player supports native HTTPS media and provider embeds for YouTube and
Vimeo without adding a player package. Native video sends checkpoints on
time-update, pause and completion. YouTube and Vimeo use their postMessage
events where available. A missing or invalid playback source produces an
accessible unavailable state rather than exposing configuration.

Sanity currently stores public or server-authorized playback URLs. A future
private streaming provider must issue short-lived URLs in a server-only media
adapter before the lesson view is returned.

## Assessment lifecycle

1. The lesson launches an attempt through the existing protected route.
2. Supabase stores a deterministic question and answer order.
3. `/academy/assessments/attempts/[attemptId]` reloads that exact safe ordering.
4. The learner submits one idempotent response set.
5. Server-only scoring writes the attempt and responses transactionally.
6. The result page displays score, pass/fail state and allowed stored feedback.

Short-answer questions continue to receive the Part 1 deterministic non-passing
score until a reviewed manual-grading workflow is implemented.

## Analytics

Authenticated learner interactions are written to `academy_events` through
`POST /api/academy/events`. The endpoint validates the event allowlist,
identifiers and idempotency key, applies a mutation rate limit, and uses the
service role only on the server.

## Deferred to Part 2B

- Full progress dashboard and learning-path interface
- Certificate rendering/download and verification-page polish
- Full Academy AI Tutor and recommendations interface
- Course reviews and advanced Academy reporting
- Private streaming-provider signing adapter
- Manual grading workflow for short-answer questions
- Final production visual and accessibility audits

## Catalog and revalidation

Catalog filters are server-parsed URL parameters for query, difficulty, access,
category, instructor, duration, sort, and page. Arbitrary sort fields and
invalid filter slugs fall back to safe defaults. Filter state is preserved in
pagination links.

Public Sanity projections use the existing Academy cache tags. Enrollment,
progress, completion, and assessment mutations revalidate only relevant course,
lesson, Academy landing, or dashboard views. Attempts, bookmarks, notes, and
other private learner data use private/no-store boundaries and are never shared
through public caching.

## Lesson tools

- Resource links use `/api/academy/resources/[resourceId]`; the route repeats
  identity, enrollment, membership, lesson, course, and resource checks before
  redirecting to an allowlisted HTTPS source.
- Bookmarks support an optional timestamp and editable sanitized label.
- Private notes support explicit create, edit, and confirmed delete actions.
  Unsaved note edits trigger a browser-leave warning and note text is excluded
  from analytics and AI context.
- The optional “Ask about this lesson” link opens the existing Assistant only
  after user intent and passes a normalized lesson-title prompt. It never sends
  notes, responses, answer keys, or unpublished lesson fields.

## Known limitations

- Formal-assessment responses remain in the current browser state until final
  submission because Part 1 has no response-checkpoint API.
- YouTube and Vimeo resume through provider URL parameters; native video has the
  richest checkpoint support. Mux and Cloudflare Stream require approved HTTPS
  playback URLs and no signing secret is sent to the browser.
- Captions depend on the configured video source. Transcript content is
  rendered only when the authorized lesson projection contains it.
- Sprint 14 did not expose a reusable chart package in this worktree, so
  chart-practice lessons render instructions and an accessible textual fallback.
- The mobile curriculum uses a native disclosure rather than a modal drawer;
  it remains keyboard operable and avoids focus-trap dependencies.
