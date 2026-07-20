# Certificate verification

## Public contract

The public page and
`GET /api/academy/certificates/verify/[verificationCode]` accept a random
URL-safe 256-bit code. The response may contain only validity, status, learner
display name, course title, completion date, issue date, certificate number,
and instructor name.

Unknown and malformed codes receive the same generic not-verified
presentation. Revoked and superseded records remain resolvable so status cannot
be mistaken for an active credential. Verification pages are `noindex`.

Never add email, Supabase user ID, enrollment ID, internal certificate ID,
assessment attempts/responses, scores, profile data, membership/payment data,
IP data, notes, bookmarks or analytics metadata to this contract.

## QR and sharing

The QR payload is the canonical HTTPS verification URL only. The document also
prints that URL as text. Share controls copy the same URL or open fixed
LinkedIn/X endpoints. Share URLs are built on the server from the opaque code
and never accept a browser-provided destination.

## Status meanings

- `issued`: valid educational completion record.
- `revoked`: no longer valid; historical snapshot retained.
- `superseded`: replaced under an approved future policy; history retained.
- not verified: invalid, malformed or unknown code.

## Abuse, caching and incidents

Verification uses the server-only service client and a rate-limited RPC with a
fixed safe projection. Private download/API responses opt out of caching.
Opaque codes prevent practical enumeration. Logs must not record full
verification URLs. Move the current instance-local limiter to a distributed
store before multi-region scale.

If a verification URL is disclosed unintentionally, do not mutate or delete
the immutable record. An administrator should revoke it with a documented
reason and issue a replacement only after a reissue policy is approved.
