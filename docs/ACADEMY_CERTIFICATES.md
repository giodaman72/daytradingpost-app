# Academy certificates

Certificates are educational completion records, not claims of professional
accreditation. Eligibility requires a valid completed enrollment, enabled
course certificate, required assessment result, display name, no hold, and no
existing issuance.

Issuance snapshots the learner display name, course title, instructor, version,
completion date, and optional score. Numbers are collision-resistant and
verification codes are opaque 256-bit URL-safe values. Database uniqueness and
idempotency prevent duplicates.

`GET /api/academy/certificates/verify/[verificationCode]` is rate-limited and
returns only validity/status, learner display name, course title, completion
date, issuance date, certificate number, and instructor. It never returns user
ID, email, assessment responses, or payment data. Revoked certificates remain
verifiable as revoked. The visual/PDF certificate is deferred to Part 2.
