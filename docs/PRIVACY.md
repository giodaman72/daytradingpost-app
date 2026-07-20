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

Revocation retains the immutable snapshot and adds private reason, status and
timestamp. The public record reports revoked status but not the reason.
Administrator actions are audited. Certificates are not deleted or silently
rewritten; future replacement must preserve and link both records.

For the broader application privacy policy, see `PRIVACY.md` in the repository
root. Operational logs must not store full verification URLs or PDF contents.
