# Security

## Academy administrative security

Every Academy page, Server Action and Route Handler performs server-side role,
permission or assignment checks. Proxy/navigation visibility is not an
authorization boundary. `SANITY_API_READ_TOKEN` and Supabase service-role
credentials remain server-only; no Sanity write token is used.

Admin course and assessment projections explicitly omit lesson premium bodies,
assessment answers and grading keys. Enrollment views omit learner notes,
emails and individual responses. Instructor views are additionally restricted
to assigned course IDs and privacy-thresholded aggregates.

Sensitive enrollment and assessment mutations are confirmed, reasoned,
transactional, idempotent and audited. Browser roles have no direct access to
instructor assignments, review reports or instructor reply drafts.
