# Academy Notifications

Academy notifications support enrollment, resume reminders, module completion,
assessment results/expiry, course completion/progress reminders, certificate
issuance, new content and learning-path milestones. Every draft has a safe
course deep link and a deterministic per-user idempotency key.

Learners manage course reminder, completion, assessment, certificate,
announcement and email preferences at
`/dashboard/learning/notifications`. Global unsubscribe wins over every category.
Dashboard delivery is the fallback. Email is allowed only when the learner opts
in and a production delivery provider is configured; the current mock/disabled
adapter must never send production email.

Reminder selection is a pure rule and is not scheduled during tests. Copy is
neutral and does not shame the learner or manufacture urgency. A future job may
evaluate inactivity, assessment expiry and saved course progress, then pass only
preference-approved drafts to the idempotent notification repository.
