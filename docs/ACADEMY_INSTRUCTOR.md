# Academy Instructor Experience

`/instructor/academy` is protected by explicit rows in
`academy_instructor_assignments`. A Sanity instructor document alone never
grants access. Each assignment connects an authenticated profile, Sanity
instructor ID and course ID.

The dashboard includes assigned courses only, plus aggregate enrollments, active
learners, completion, lesson/module activity, assessment distributions,
content drop-off and recent published reviews. It excludes emails, learner
notes, assessment responses and raw learner event rows. Sensitive rates are
suppressed below the configured privacy threshold.

Instructors may create or update replies only for published reviews on assigned
courses. Replies enter `pending` moderation and do not become public until an
administrator approves them.

## Assignment example

Run after looking up the authenticated profile UUID and Sanity IDs:

```sql
insert into public.academy_instructor_assignments
  (user_id, instructor_id, course_id, assigned_by)
values
  ('PROFILE_UUID', 'SANITY_INSTRUCTOR_ID', 'SANITY_COURSE_ID', 'ADMIN_PROFILE_UUID')
on conflict (user_id, course_id) do update
set instructor_id = excluded.instructor_id,
    active = true,
    assigned_by = excluded.assigned_by;
```

Never assign by email in application code. Deactivate an assignment rather than
deleting its historical meaning.
