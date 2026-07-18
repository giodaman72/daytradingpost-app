# Academy assessments

Supported types are lesson quiz, module quiz, course final, practice, and
diagnostic. Supported graded questions are single choice, multiple choice,
true/false, numeric, ordering, and matching. Short answers are practice-only and
receive no automatic points.

## Attempt lifecycle

The server checks authentication, membership, enrollment, availability, and the
lower of plan and assessment attempt limits. It then creates deterministic
question/answer ordering from the immutable attempt identity. The attempt stores
only ordering and version—not answer keys.

Submission validates ownership, active status, expiration, version, and
question membership. Scoring is deterministic and decimal-scaled. Partial
credit applies only when explicitly enabled. `grade_academy_attempt` writes
responses and final scores in one transaction and makes repeated submissions
with the same idempotency key safe.

Correct answers and explanations are excluded before attempt data reaches the
browser. Explanations may be stored as feedback only after grading when the
assessment allows it. The public API never returns raw Sanity documents.

## Version policy

Completed attempts are immutable except for authorized invalidation. Never
silently regrade them. Breaking assessment changes require a new assessment
version/document. An in-progress attempt whose exact version is no longer
available fails safely and requires support review.
