# Academy certificate privacy

Certificate issuance uses the signed-in learner's display name, verified course
enrollment, completion date, optional final score, and published
course/instructor snapshot. Assessment responses, email, payment data, private
notes and bookmarks are never copied into certificates.

Private wallet, detail and PDF routes require the current owner on the server
and in the database predicate. Public verification exposes only status,
display name, course title, completion/issue dates, certificate number and
instructor. QR and share controls contain only the opaque verification URL.
Public pages are noindex and rate-limited.

## Academy AI Tutor privacy

Tutor conversations are private to the authenticated owner. Database predicates
and RLS scope reads, updates, feedback and deletion to `user_id`. Course and
lesson retrieval repeats membership, enrollment, prerequisite and publication
checks on the server; browser context is never trusted as authorization.

Stored Tutor context contains only the mode and course/lesson slugs. Private
notes, email, profile data, raw assessment responses, assessment attempt IDs,
answer keys, raw retrieval documents, hidden instructions and chain-of-thought
are not stored in Tutor messages. Provider response storage is disabled. A
hashed, non-profile safety identifier is sent for abuse monitoring.

Archive retains a conversation under the existing AI retention policy. Delete
permanently cascades its messages and feedback. Premium-derived answers are not
replayed after entitlement is lost. Account-erasure operations must include the
existing AI conversation, feedback and usage tables.

Revocation retains the immutable snapshot and adds private reason, status and
timestamp. The public record reports revoked status but not the reason.
Administrator actions are audited. Certificates are not deleted or silently
rewritten; future replacement must preserve and link both records.

For the broader application privacy policy, see `PRIVACY.md` in the repository
root. Operational logs must not store full verification URLs or PDF contents.
