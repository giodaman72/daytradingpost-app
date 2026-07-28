# Academy learning paths

Sprint 15 Volume 2 turns the existing `academyLearningPath` content model and
Supabase enrollment table into a guided, server-authoritative learner
experience.

## Routes

- `/academy/learning-paths` is the published catalog with query, category,
  difficulty and access filters.
- `/academy/learning-paths/[pathSlug]` shows the curriculum, prerequisites,
  required/optional rules, enrollment, current state, milestones and risk
  notice.
- `/dashboard/learning/paths` is an authenticated view of enrolled paths and
  explainable recommendations.
- `POST /api/academy/learning-paths/[pathSlug]/enroll` creates an idempotent
  enrollment and initializes the first eligible course.

## Ownership and authority

Sanity owns titles, descriptions, ordered course references, required flags,
categories, access, publication, audience, duration and version. Supabase owns
the learner enrollment snapshot. Course enrollments remain the source of truth
for completion. The browser displays calculated state but cannot grant access,
complete a course or write path progress directly.

Every repository read includes `user_id`, and RLS independently restricts the
authenticated role to `auth.uid() = user_id`. The service role performs
mutations only after `requireAcademyUser` resolves the current server session.

## Enrollment policy

The service checks authentication, publication time, membership access and
completed prerequisite paths. Active duplicate enrollments return the existing
record. A unique partial index remains the final concurrency guard.

The backend policy initializes the first eligible required course, or the first
eligible optional course when there is no incomplete required course. Existing
course enrollments are reused. If new course initialization fails, only the
newly created path enrollment is removed; an existing course enrollment is
never deleted.

## Progress and course states

Only required courses contribute to the path percentage:

`completed required courses / required courses * 100`

Optional completion is reported separately. Remaining duration is an editorial
estimate calculated from incomplete referenced courses, not observed learner
behavior. The next course is the current course, otherwise the first unlocked
required course, otherwise an unlocked optional course.

Nodes use explicit text states: `available`, `current`, `completed`, `optional`,
`locked`, `premium`, `archived`, `unavailable`, and `access expired`. The path
map is an ordered list in the DOM, links are native keyboard-operable anchors,
and every lock includes a textual reason.

## Versioning policy

- Enrollment stores `learning_path_version`; it is never silently rewritten
  when an editor publishes a later version.
- Historical course completion is matched by stable Sanity course ID and is
  preserved when the current path version changes.
- A newly added optional course never lowers completion.
- A newly added required course affects the current published path calculation.
  Before making that change, editors must increment the path version and
  communicate the effect to active learners.
- An archived or unavailable required course blocks forward progression and
  must be replaced editorially. Replacement should be a new reference in a new
  path version; do not repoint or reuse the old course document ID.
- Removing a course from the current path does not delete its course
  enrollment, progress, certificate or historical events.
- Completed path enrollment snapshots remain completed. Reconciliation of old
  completed snapshots against a materially changed path requires an explicit
  admin migration and is not automatic.

## Recommendations

Recommendations are deterministic. They exclude completed/enrolled paths,
enforce prerequisite paths, prefer editorially featured or nearby difficulty
paths, and display a plain-language reason. They do not call AI, inspect
sensitive profile fields, or imply financial suitability.

## Certificates and limitations

This release does not issue learning-path certificates or badges. Existing
course certificates appear only for courses with a configured, verified
certificate workflow. Automated replacement migrations, administrator path
management, database-emulator RLS tests and end-to-end browser tests remain
future work.
