# Academy assessment learner UI

## Lifecycle

1. A learner explicitly starts an attempt from an authorized assessment lesson.
2. Part 1 stores deterministic randomized question and answer order.
3. `/academy/assessments/attempts/[attemptId]` reloads that exact order.
4. The learner navigates by stable question ID, answers, and optional review
   flags.
5. Submission shows unanswered and flagged counts and requires confirmation.
6. Server-only scoring persists one idempotent final result.
7. `/academy/assessments/attempts/[attemptId]/result` displays only review data
   permitted by the Sanity assessment policy.

The previous `/academy/assessments/[attemptId]` route remains compatible.
Attempt and result routes are private, dynamically rendered, and `noindex`.

## Question controls

Single choice and true/false use radios. Multiple choice uses checkboxes.
Numeric questions preserve decimal text until normalized for submission.
Ordering provides move-up and move-down controls with an announcement.
Matching uses labelled selects and prevents duplicate target selection.

The browser receives IDs, prompts, safe answer labels, and allowed matching
targets only. It never receives correct answers, numeric tolerances, matching
keys, or explanations before grading.

## Timer and recovery

Supabase `expires_at` remains authoritative. The client reconciles against that
timestamp every second and on visibility changes, so refresh and sleeping
devices cannot extend an attempt. Warnings are announced at five minutes and
one minute rather than every second.

Part 1 does not provide response-checkpoint persistence. Responses remain in
the current component state, a browser-leave warning is installed while answers
are unsaved, and nothing is persisted indefinitely in local storage.

## Review and retakes

Per-question correctness and awarded points are removed at the server boundary
when `showCorrectAnswers` is false. Explanations are removed when
`showExplanations` is false. Retakes always create a new server attempt and the
existing maximum-attempt rules remain authoritative.

Short-answer questions retain the Part 1 deterministic non-passing behavior
until a reviewed manual-grading workflow exists.
