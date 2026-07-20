# Academy Administration

Volume 6 adds protected management routes under `/admin/academy`. Every page or
mutation rechecks permissions on the server. Hidden navigation is never treated
as authorization.

## Permission boundaries

| Workflow                              | Editor | Admin |
| ------------------------------------- | ------ | ----- |
| View course validation                | Yes    | Yes   |
| Edit course/assessment in Studio      | Yes    | Yes   |
| Manage assessment definitions         | Yes    | Yes   |
| Publish, unpublish, schedule, archive | No     | Yes   |
| Enrollment operations                 | No     | Yes   |
| Certificate lifecycle                 | No     | Yes   |
| Review and reply moderation           | No     | Yes   |
| Aggregate analytics                   | No     | Yes   |

Sanity remains the editorial source of truth. The application uses a server-only
read token to show course, module, lesson and assessment metadata. It never
contains a Sanity write token. Editing, duplicate, scheduling, publication,
unpublication and archive actions occur in Studio, where document history
records the actor and timestamp. The admin course detail detects missing
objectives, unpublished modules, missing lessons, prerequisite cycles and broken
references before publication.

## Learner operations

Manual enrollment, pause, revocation, restore and progress reset call
service-role-only transactional database functions. Reset requires the exact
`RESET PROGRESS` confirmation and a reason. It resets progress and invalidates
attempts but retains responses, scores and audit history. Individual scores
cannot be edited. Attempt invalidation separately requires `INVALIDATE`.

Certificate records remain immutable. Authorized revocation uses the existing
confirmation and audited RPC. Reissue remains disabled until a correction and
superseding policy is approved.

Apply `docs/supabase-academy-admin.sql` before using mutation workflows.
Set `SANITY_API_READ_TOKEN` on the server so draft-aware validation can read
editorial metadata. Do not create a browser-exposed or application-level Sanity
write token. Configure matching Sanity project roles so editorial users cannot
publish merely because they can open Studio.
