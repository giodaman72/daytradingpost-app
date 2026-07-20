# Academy certificates

Sprint 15 Volume 3 adds a protected certificate wallet, server-controlled
issuance, branded PDF download, QR verification, safe sharing, public
verification and administrator revocation. Certificates are educational
course-completion records, never claims of accreditation, professional
licensure, financial competence, or trading performance.

## Learner routes

- `/dashboard/learning/certificates` lists the signed-in learner's issued,
  revoked and superseded records, eligible completions, pagination and empty
  state.
- `/academy/certificates/[certificateId]` is an owner-only HTML certificate
  view with PDF download and safe sharing controls.
- `/verify/certificate/[verificationCode]` is public, rate-limited and exposes
  only the approved immutable completion snapshot.

The wallet and detail route resolve the current Supabase session on the server.
Every private database lookup includes `user_id`; an arbitrary certificate ID
does not grant access.

## Eligibility and issuance

`POST /api/academy/certificates` accepts an enrollment ID and an idempotency
key. Trusted server code verifies authentication, enrollment, database-confirmed
completion, the published Sanity certificate flag, required assessment pass,
absence of a hold, a display name, and no existing active course-version
certificate.

The browser cannot provide completion, pass, score, title, instructor or
certificate status. `issue_academy_certificate` repeats database-owned checks
under an advisory transaction lock, inserts an immutable snapshot, and returns
an existing result for a repeated key. Collision-resistant numbers, 256-bit
opaque verification codes, partial uniqueness, and a snapshot-protection
trigger provide defense in depth.

After issuance, the service writes one idempotent notification and one
idempotent `academy_certificate_issued` event. A retry reconciles these side
effects without creating another certificate.

## Certificate document

The protected download handler uses `pdf-lib` and `qrcode` only on the Node.js
server. It returns a private, non-cacheable branded PDF with learner/course
snapshot, dates, certificate number, instructor, public verification URL/QR,
and an explicit educational/non-accreditation disclaimer.

The QR code contains only
`/verify/certificate/[opaqueVerificationCode]`. It contains no user ID,
certificate database ID, email, enrollment ID, assessment response or payment
information. HTML always shows the same text URL for users who cannot scan.

## Lifecycle and administration

Certificates are never deleted. `issued`, `revoked`, and `superseded` are
historical states. Revocation is available only through the administrator API
and requires `academy:manage-certificates`, a reason of at least ten
characters, the literal confirmation `REVOKE`, and a unique request ID. The
database updates status/timestamp, writes the audit row transactionally, keeps
the immutable snapshot, updates public verification, and sends one notification.

Reissue is deliberately disabled because no approved business rule currently
defines replacement. The schema supports `supersedes_certificate_id` and
`superseded_by_certificate_id` so a future approved workflow can preserve both
records. Do not manually overwrite an issued snapshot.

## Operations

Apply the latest `docs/supabase-trading-academy-lms.sql` after the notification
schema. Configure either `ACADEMY_CERTIFICATE_VERIFICATION_BASE_URL` or
`NEXT_PUBLIC_SITE_URL` with the canonical HTTPS origin. Run the manual privacy,
ownership, idempotency and RLS checklist in `docs/TESTING.md` before production
issuance. Replace the instance-local limiter with a distributed limiter before
high-volume or multi-region verification traffic.
