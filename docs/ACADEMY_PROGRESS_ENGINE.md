# Academy progress engine

Progress is calculated server-side from required published curriculum.
Optional lessons/modules do not block completion. Percentages are bounded
between 0 and 100. Repeated completion is idempotent and an existing historical
completion timestamp remains authoritative if optional content is later added.

Completion modes are manual, content viewed, video threshold, quiz passed,
assessment passed, and external confirmation. Prerequisites return structured
unmet IDs without leaking locked premium content.

Video checkpoints are monotonic. The default completion rule is 80% watched or
within 30 seconds of the end, configured through `.env.example`. Checkpoints
store position/duration only; this does not claim perfect fraud prevention or
surveillance-grade tracking.

Course completion may require required lessons, required modules, and a final
assessment. Certificate eligibility starts only after verified completion.
Notification or email failure must not roll back successful learning state.
