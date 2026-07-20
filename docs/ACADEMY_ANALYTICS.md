# Academy Analytics

The admin analytics route supports date, course and instructor filters. The
instructor dashboard reuses the same aggregate engine but forces the course set
to explicit instructor assignments.

Metrics include catalog/course views, view-to-enrollment rate, enrollments,
active learners, course starts, lesson and module completions, course
completion/rate, started-without-completion count, assessment attempts,
pass/fail distribution and rate, issued certificates, resource downloads,
Tutor requests and recommendation opens.

Values come from `academy_events`, enrollments, attempts, certificates and
AI request logs. Missing activity displays as zero or an empty state; no sample
analytics are manufactured. The date range is limited to 366 days and
identifiers are allowlisted.

Rates and other learner-sensitive aggregates are suppressed when the cohort is
non-empty but smaller than `ACADEMY_ANALYTICS_PRIVACY_THRESHOLD` (default 5).
Routes never return event user IDs, learner emails, notes, review drafts,
assessment responses or AI conversation content.

This implementation currently reads bounded result sets for operational
dashboards. A future high-volume deployment should replace those reads with
reviewed SQL aggregate functions or materialized rollups while preserving the
same privacy policy.
