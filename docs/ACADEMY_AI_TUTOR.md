# Academy AI Tutor

## Scope

The Academy AI Tutor is authenticated, source-grounded educational support for
published DayTradingPost courses and lessons. It extends the existing AI
Assistant provider, persistence, streaming, usage, feedback, logging and
deletion boundaries. It is not a second AI stack.

Routes:

- `/academy/tutor` for general Academy questions;
- `/academy/courses/[courseSlug]/tutor` for an enrolled course;
- `/academy/courses/[courseSlug]/tutor?lesson=[lessonSlug]` for an authorized
  lesson.

Lesson actions prefill the composer but never invoke AI during page rendering.
The learner must explicitly submit.

## Learning modes

The server accepts `academyTutorMode` values for lesson explanation,
simplification, summary, lesson questions, AI-generated practice questions,
permitted quiz feedback, glossary help, concept comparison, study checklists and
next-topic recommendations. The mode guides presentation only; it never changes
authorization.

## Retrieval and authorization

Course and lesson context is fetched only after Supabase authentication,
membership, enrollment and prerequisite checks. Sanity queries require
`status == "published"`, a reached publication date and `aiTutorEnabled`.
Premium lessons require active premium entitlement on every retrieval.

Authorized context may contain:

- the selected course and lesson;
- published, access-filtered lesson resources;
- published educational article summaries;
- owner-scoped, permitted feedback for a final assessment attempt.

Private notes, email, profile fields, drafts, unpublished content, answer keys,
raw assessment responses and other learners are excluded. Generic Academy mode
uses published course summaries. A request with no authorized source returns a
stable no-context error.

Every response receives validated citations from the documents retrieved for
that request. Academy factual claims are instructed to use `[Source N]`
markers. Invalid markers are removed and the UI displays canonical source links.

## Assessment boundary

The Tutor may explain the underlying lesson, create new ungraded practice
questions and explain feedback only after an attempt is final and only when the
assessment policy exposed that feedback. It refuses:

- answer keys or reconstructed solutions;
- active or graded question answers;
- assessment completion;
- certification bypass or false certification;
- extraction of premium, locked, draft or unpublished material.

Certificates remain controlled by the transactional LMS eligibility workflow.

## Privacy and retention

Tutor conversations reuse owner-scoped `ai_conversations`, `ai_messages` and
`ai_feedback`. Stored source context contains only mode and course/lesson slugs;
assessment attempt IDs, raw retrieval context, hidden prompts, notes, email and
profile data are not stored as message context. Delete permanently cascades the
conversation. Archive preserves it under the existing retention policy.

The OpenAI adapter sends a stable hashed safety identifier, disables provider
response storage, and keeps the API key, instructions and retrieval context in
server-only modules. When premium entitlement is lost, premium-cited Tutor
answers are removed from both UI replay and subsequent model history.

## Limits and operations

Tutor requests use the existing database-backed daily allowance, instance-local
short-window rate limit, per-user concurrency limit, input/context/output bounds,
timeout, idempotency and membership tiers. Configure the same server-only AI
variables documented in `AI_ASSISTANT.md`; no new browser secret is required.

Before production:

1. Apply `docs/supabase-ai-assistant.sql` and the Academy LMS migration.
2. Use a private Sanity dataset before publishing graded assessments.
3. Verify premium downgrade, draft, prerequisite and cross-user denial cases.
4. Run the 15-case Tutor evaluation set and full quality gates.
5. Review provider processing, retention, accessibility and refusal language.

## Known limitations

There is no arbitrary web search, note ingestion, autonomous course mutation,
voice mode, distributed short-window limiter, embedding index or approved
webinar transcript corpus. Glossary help is grounded only when a published,
authorized glossary resource or lesson supplies the term.
