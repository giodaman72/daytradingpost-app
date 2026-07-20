# Academy lesson player

## Canonical routes

- Curriculum resolver: `/academy/courses/[courseSlug]/learn`
- Lesson: `/academy/courses/[courseSlug]/learn/[lessonSlug]`
- Legacy lesson URL: `/academy/courses/[courseSlug]/lessons/[lessonSlug]`
  remains compatible and declares the canonical `/learn/` URL.

All lesson routes are private, dynamically rendered, and marked `noindex`.
`getAcademyLessonView` validates the course/lesson relationship, enrollment,
membership, prerequisites, publication state, and learner ownership before the
full lesson projection is fetched.

## Player architecture

`AcademyLessonRenderer` maps the Sanity discriminated lesson type to one of:

- text/downloadable
- video/mixed
- webinar replay
- quiz/assessment introduction
- external resource
- chart-practice foundation

Unavailable media falls back without blocking text, progress, bookmarks, or
notes. The desktop curriculum is complemented by a native keyboard-operable
mobile disclosure. Previous and next links include only server-authorized,
unlocked lessons.

## Content and learner tools

Portable Text uses a typed renderer and never accepts raw HTML or script blocks.
External links require safe URLs. Lesson resources use the protected resource
Route Handler rather than exposing the Sanity asset URL in the page payload.

Bookmarks support create, relabel, and confirmed deletion. Notes support
create, edit, and confirmed deletion, with explicit saving and unsaved-change
warnings. Both features revalidate ownership and the course/lesson association
server-side. Note or bookmark failures do not block lesson content.

## Completion

Lesson start, progress, and completion use the Part 1 services. Browser state
is never authoritative. Manual completion is unavailable for assessment,
external-confirmation, and video-threshold modes. Server responses determine
the final progress state.

## Known limitations

- Sprint 14 chart components are not present, so chart-practice lessons provide
  an accessible historical/delayed-data foundation without an interactive
  chart.
- A private video-signing adapter is not present. Only allowlisted public or
  already server-authorized playback locations are supported.
- Transcript content is rendered inside an on-demand disclosure, but remains
  part of the authorized lesson response.
