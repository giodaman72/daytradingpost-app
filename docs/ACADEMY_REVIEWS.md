# Academy Reviews

Only authenticated learners with a real course enrollment and the configured
minimum progress may create a review. `ACADEMY_REVIEW_MIN_PROGRESS_PERCENT`
defaults to 20. A learner may have one non-deleted review per course and can edit
or soft-delete only that review.

New and edited reviews enter `pending` moderation. Only published,
non-deleted database rows appear publicly or contribute to the average/count.
There are no seeded ratings and no rating structured data until real published
reviews exist. Text is normalized, length-limited and rate-limited.

Administrators with `academy:manage-reviews` use
`/admin/academy/reviews`. Moderation is audited. Instructor replies are
intentionally deferred: the app has editorial instructor documents but no
verified relationship between those documents and authenticated instructor
accounts. Replies must not ship until that authorization model exists.
