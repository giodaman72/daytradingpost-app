-- DayTradingPost Trading Academy 2.0 learner-state foundation.
-- Run after docs/supabase-auth.sql and docs/supabase-watchlists-alerts.sql.
-- Sanity owns editorial content. These tables store only stable Sanity IDs,
-- versions, learner state and issuance snapshots.

create extension if not exists pgcrypto;

create table if not exists public.academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null check (course_id ~ '^[A-Za-z0-9_.-]{1,160}$'),
  course_slug text not null check (course_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  course_version integer not null check (course_version >= 1),
  enrollment_source text not null default 'self'
    check (enrollment_source in ('self', 'learning_path', 'admin', 'migration')),
  status text not null default 'enrolled'
    check (status in ('enrolled', 'in_progress', 'completed', 'paused', 'revoked', 'expired', 'archived')),
  enrolled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz,
  progress_percent numeric(5,2) not null default 0
    check (progress_percent between 0 and 100),
  current_module_id text,
  current_lesson_id text,
  access_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(access_snapshot) = 'object'),
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists academy_enrollments_active_unique
  on public.academy_enrollments(user_id, course_id)
  where status in ('enrolled', 'in_progress', 'paused', 'completed');
create unique index if not exists academy_enrollments_idempotency_unique
  on public.academy_enrollments(user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists academy_enrollments_user_updated_idx
  on public.academy_enrollments(user_id, updated_at desc);
create index if not exists academy_enrollments_course_status_idx
  on public.academy_enrollments(course_id, status);

create table if not exists public.academy_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  enrollment_id uuid not null references public.academy_enrollments(id) on delete cascade,
  course_id text not null,
  module_id text not null,
  lesson_id text not null,
  lesson_version integer not null check (lesson_version >= 1),
  required_for_completion boolean not null default true,
  status text not null default 'not_started'
    check (status in ('locked', 'available', 'not_started', 'in_progress', 'completed', 'skipped', 'reset')),
  progress_percent numeric(5,2) not null default 0
    check (progress_percent between 0 and 100),
  first_started_at timestamptz,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  completion_method text
    check (completion_method is null or completion_method in (
      'manual', 'content-viewed', 'video-threshold',
      'quiz-passed', 'assessment-passed', 'external-confirmation'
    )),
  video_position_seconds integer check (video_position_seconds is null or video_position_seconds >= 0),
  video_duration_seconds integer check (video_duration_seconds is null or video_duration_seconds > 0),
  content_viewed_at timestamptz,
  attempts_count integer not null default 0 check (attempts_count >= 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, enrollment_id, lesson_id),
  check (
    video_position_seconds is null or video_duration_seconds is null or
    video_position_seconds <= video_duration_seconds
  )
);
create index if not exists academy_lesson_progress_enrollment_idx
  on public.academy_lesson_progress(enrollment_id, module_id, status);
create index if not exists academy_lesson_progress_user_course_idx
  on public.academy_lesson_progress(user_id, course_id, updated_at desc);

create table if not exists public.academy_module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  enrollment_id uuid not null references public.academy_enrollments(id) on delete cascade,
  course_id text not null,
  module_id text not null,
  module_version integer not null check (module_version >= 1),
  required_for_completion boolean not null default true,
  status text not null default 'not_started'
    check (status in ('locked', 'available', 'not_started', 'in_progress', 'completed', 'skipped', 'reset')),
  progress_percent numeric(5,2) not null default 0
    check (progress_percent between 0 and 100),
  started_at timestamptz,
  completed_at timestamptz,
  required_lessons_count integer not null default 0 check (required_lessons_count >= 0),
  completed_required_lessons_count integer not null default 0
    check (completed_required_lessons_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, enrollment_id, module_id),
  check (completed_required_lessons_count <= required_lessons_count)
);
create index if not exists academy_module_progress_enrollment_idx
  on public.academy_module_progress(enrollment_id, status);
create index if not exists academy_module_progress_course_idx
  on public.academy_module_progress(user_id, course_id);

create table if not exists public.academy_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  enrollment_id uuid not null references public.academy_enrollments(id) on delete cascade,
  assessment_id text not null,
  assessment_version integer not null check (assessment_version >= 1),
  attempt_number integer not null check (attempt_number >= 1),
  status text not null default 'started'
    check (status in ('started', 'submitted', 'graded', 'passed', 'failed', 'expired', 'abandoned', 'invalidated')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  expires_at timestamptz,
  score numeric(12,4) check (score is null or score >= 0),
  maximum_score numeric(12,4) check (maximum_score is null or maximum_score >= 0),
  score_percent numeric(5,2) check (score_percent is null or score_percent between 0 and 100),
  passed boolean,
  randomized_question_ids text[] not null default '{}',
  randomized_answer_orders jsonb not null default '{}'::jsonb
    check (jsonb_typeof(randomized_answer_orders) = 'object'),
  grading_metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(grading_metadata) = 'object'),
  submission_idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, assessment_id, attempt_number),
  unique(id, user_id),
  check (score is null or maximum_score is null or score <= maximum_score)
);
create unique index if not exists academy_attempt_submission_idempotency_unique
  on public.academy_assessment_attempts(user_id, submission_idempotency_key)
  where submission_idempotency_key is not null;
create index if not exists academy_attempts_user_assessment_idx
  on public.academy_assessment_attempts(user_id, assessment_id, attempt_number desc);
create index if not exists academy_attempts_enrollment_idx
  on public.academy_assessment_attempts(enrollment_id, created_at desc);

create table if not exists public.academy_assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  response jsonb not null,
  normalized_response jsonb,
  awarded_points numeric(12,4) check (awarded_points is null or awarded_points >= 0),
  maximum_points numeric(12,4) not null check (maximum_points >= 0),
  correct boolean,
  feedback text check (feedback is null or char_length(feedback) <= 4000),
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(attempt_id, question_id),
  foreign key (attempt_id, user_id)
    references public.academy_assessment_attempts(id, user_id) on delete cascade,
  check (awarded_points is null or awarded_points <= maximum_points)
);
create index if not exists academy_responses_attempt_idx
  on public.academy_assessment_responses(attempt_id);
create index if not exists academy_responses_user_idx
  on public.academy_assessment_responses(user_id, created_at desc);

create table if not exists public.academy_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  module_id text,
  lesson_id text not null,
  bookmark_type text not null default 'lesson'
    check (bookmark_type in ('lesson', 'video-timestamp', 'text-anchor')),
  position_seconds integer check (position_seconds is null or position_seconds >= 0),
  text_anchor text check (text_anchor is null or char_length(text_anchor) <= 500),
  label text check (label is null or char_length(btrim(label)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academy_bookmarks_user_course_idx
  on public.academy_bookmarks(user_id, course_id, created_at desc);
create index if not exists academy_bookmarks_user_lesson_idx
  on public.academy_bookmarks(user_id, lesson_id, created_at desc);

create table if not exists public.academy_learner_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  module_id text,
  lesson_id text not null,
  note_text text not null check (char_length(btrim(note_text)) between 1 and 5000),
  position_seconds integer check (position_seconds is null or position_seconds >= 0),
  text_anchor text check (text_anchor is null or char_length(text_anchor) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academy_notes_user_course_idx
  on public.academy_learner_notes(user_id, course_id, updated_at desc);
create index if not exists academy_notes_user_lesson_idx
  on public.academy_learner_notes(user_id, lesson_id, updated_at desc);

create table if not exists public.academy_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  enrollment_id uuid not null references public.academy_enrollments(id) on delete restrict,
  course_id text not null,
  course_version integer not null check (course_version >= 1),
  certificate_number text not null unique,
  verification_code text not null unique,
  status text not null default 'issued'
    check (status in ('issued', 'revoked', 'superseded')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text check (revocation_reason is null or char_length(revocation_reason) <= 500),
  learner_display_name text not null check (char_length(btrim(learner_display_name)) between 1 and 160),
  course_title_snapshot text not null check (char_length(btrim(course_title_snapshot)) between 1 and 200),
  instructor_name_snapshot text check (instructor_name_snapshot is null or char_length(instructor_name_snapshot) <= 160),
  completion_date date not null,
  score_snapshot numeric(5,2) check (score_snapshot is null or score_snapshot between 0 and 100),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  issuance_idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, course_id, course_version, issuance_idempotency_key),
  check (
    (status = 'revoked' and revoked_at is not null) or
    (status <> 'revoked')
  )
);
create index if not exists academy_certificates_user_issued_idx
  on public.academy_certificates(user_id, issued_at desc);
create index if not exists academy_certificates_verification_idx
  on public.academy_certificates(verification_code);

create table if not exists public.academy_learning_path_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  learning_path_id text not null,
  learning_path_version integer not null check (learning_path_version >= 1),
  status text not null default 'enrolled'
    check (status in ('enrolled', 'in_progress', 'completed', 'paused', 'revoked', 'expired', 'archived')),
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  enrolled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  current_course_id text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists academy_path_enrollments_active_unique
  on public.academy_learning_path_enrollments(user_id, learning_path_id)
  where status in ('enrolled', 'in_progress', 'paused', 'completed');
create unique index if not exists academy_path_enrollments_idempotency_unique
  on public.academy_learning_path_enrollments(user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists academy_path_enrollments_user_idx
  on public.academy_learning_path_enrollments(user_id, updated_at desc);

create table if not exists public.academy_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null check (event_name in (
    'academy_landing_viewed', 'academy_catalog_viewed',
    'academy_search_used', 'academy_filter_applied',
    'academy_course_viewed', 'academy_course_enrolled', 'academy_course_started',
    'academy_course_resumed',
    'academy_lesson_started', 'academy_lesson_progressed', 'academy_lesson_completed',
    'academy_video_started', 'academy_video_completed',
    'academy_module_completed', 'academy_assessment_started',
    'academy_assessment_submitted', 'academy_assessment_passed',
    'academy_assessment_failed', 'academy_course_completed',
    'academy_certificate_issued', 'academy_resource_downloaded',
    'academy_bookmark_created', 'academy_note_created',
    'academy_learning_path_enrolled'
  )),
  course_id text,
  module_id text,
  lesson_id text,
  assessment_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  idempotency_key text,
  created_at timestamptz not null default now()
);
alter table public.academy_events
  drop constraint if exists academy_events_event_name_check;
alter table public.academy_events
  add constraint academy_events_event_name_check check (event_name in (
    'academy_landing_viewed', 'academy_catalog_viewed',
    'academy_search_used', 'academy_filter_applied',
    'academy_course_viewed', 'academy_course_enrolled', 'academy_course_started',
    'academy_course_resumed', 'academy_lesson_started',
    'academy_lesson_progressed', 'academy_lesson_completed',
    'academy_video_started', 'academy_video_completed',
    'academy_module_completed', 'academy_assessment_started',
    'academy_assessment_submitted', 'academy_assessment_passed',
    'academy_assessment_failed', 'academy_course_completed',
    'academy_certificate_issued', 'academy_resource_downloaded',
    'academy_bookmark_created', 'academy_note_created',
    'academy_learning_path_enrolled'
  ));
create unique index if not exists academy_events_idempotency_unique
  on public.academy_events(user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists academy_events_name_created_idx
  on public.academy_events(event_name, created_at desc);
create index if not exists academy_events_user_created_idx
  on public.academy_events(user_id, created_at desc);

create table if not exists public.academy_admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  request_id text not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create unique index if not exists academy_admin_audit_request_unique
  on public.academy_admin_audit(request_id);
create index if not exists academy_admin_audit_actor_created_idx
  on public.academy_admin_audit(actor_user_id, created_at desc);

-- Transactional enrollment plus initial progress. Inputs are derived from a
-- published, authorized Sanity projection by trusted server code.
create or replace function public.enroll_academy_course(
  p_user_id uuid,
  p_course_id text,
  p_course_slug text,
  p_course_version integer,
  p_enrollment_source text,
  p_access_snapshot jsonb,
  p_modules jsonb,
  p_lessons jsonb,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment_id uuid;
  module_record record;
  lesson_record record;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_course_id, 0));

  select id into enrollment_id
  from public.academy_enrollments
  where user_id = p_user_id
    and idempotency_key = p_idempotency_key
  limit 1;
  if enrollment_id is not null then return enrollment_id; end if;

  if exists (
    select 1 from public.academy_enrollments
    where user_id = p_user_id
      and course_id = p_course_id
      and status in ('enrolled', 'in_progress', 'paused', 'completed')
  ) then
    raise exception using errcode = '23505', message = 'active academy enrollment exists';
  end if;

  insert into public.academy_enrollments (
    user_id, course_id, course_slug, course_version, enrollment_source,
    access_snapshot, idempotency_key
  )
  values (
    p_user_id, p_course_id, p_course_slug, p_course_version,
    p_enrollment_source, coalesce(p_access_snapshot, '{}'::jsonb),
    p_idempotency_key
  )
  returning id into enrollment_id;

  for module_record in
    select * from jsonb_to_recordset(coalesce(p_modules, '[]'::jsonb))
      as x(id text, version integer, required_lessons_count integer, required_for_completion boolean, available boolean)
  loop
    insert into public.academy_module_progress (
      user_id, enrollment_id, course_id, module_id, module_version,
      status, required_lessons_count, required_for_completion
    )
    values (
      p_user_id, enrollment_id, p_course_id, module_record.id,
      greatest(module_record.version, 1),
      case when module_record.available then 'available' else 'locked' end,
      greatest(module_record.required_lessons_count, 0),
      coalesce(module_record.required_for_completion, true)
    );
  end loop;

  for lesson_record in
    select * from jsonb_to_recordset(coalesce(p_lessons, '[]'::jsonb))
      as x(id text, module_id text, version integer, required_for_completion boolean, available boolean)
  loop
    insert into public.academy_lesson_progress (
      user_id, enrollment_id, course_id, module_id, lesson_id,
      lesson_version, status, required_for_completion
    )
    values (
      p_user_id, enrollment_id, p_course_id, lesson_record.module_id,
      lesson_record.id, greatest(lesson_record.version, 1),
      case when lesson_record.available then 'available' else 'locked' end,
      coalesce(lesson_record.required_for_completion, true)
    );
  end loop;

  return enrollment_id;
end;
$$;

revoke all on function public.enroll_academy_course(
  uuid, text, text, integer, text, jsonb, jsonb, jsonb, text
) from public, anon, authenticated;
grant execute on function public.enroll_academy_course(
  uuid, text, text, integer, text, jsonb, jsonb, jsonb, text
) to service_role;

-- Atomically persists a server-scored assessment submission. The function
-- receives scores, never answer keys, and is executable only by service_role.
create or replace function public.grade_academy_attempt(
  p_attempt_id uuid,
  p_user_id uuid,
  p_idempotency_key text,
  p_score numeric,
  p_maximum_score numeric,
  p_score_percent numeric,
  p_passed boolean,
  p_responses jsonb,
  p_grading_metadata jsonb
)
returns public.academy_assessment_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt public.academy_assessment_attempts;
  response_record record;
begin
  select * into attempt
  from public.academy_assessment_attempts
  where id = p_attempt_id and user_id = p_user_id
  for update;

  if attempt.id is null then raise exception 'assessment attempt not found'; end if;
  if attempt.status in ('graded', 'passed', 'failed') then
    if attempt.submission_idempotency_key = p_idempotency_key then return attempt; end if;
    raise exception 'assessment attempt already submitted';
  end if;
  if attempt.status <> 'started' then raise exception 'assessment attempt is not active'; end if;
  if attempt.expires_at is not null and attempt.expires_at < now() then
    update public.academy_assessment_attempts
      set status = 'expired' where id = attempt.id;
    raise exception 'assessment attempt expired';
  end if;

  for response_record in
    select * from jsonb_to_recordset(coalesce(p_responses, '[]'::jsonb))
      as x(
        question_id text,
        response jsonb,
        normalized_response jsonb,
        awarded_points numeric,
        maximum_points numeric,
        correct boolean,
        feedback text
      )
  loop
    insert into public.academy_assessment_responses (
      attempt_id, user_id, question_id, response, normalized_response,
      awarded_points, maximum_points, correct, feedback, graded_at
    )
    values (
      attempt.id, p_user_id, response_record.question_id,
      response_record.response, response_record.normalized_response,
      response_record.awarded_points, response_record.maximum_points,
      response_record.correct, response_record.feedback, now()
    );
  end loop;

  update public.academy_assessment_attempts
  set
    status = case when p_passed then 'passed' else 'failed' end,
    submitted_at = now(),
    score = p_score,
    maximum_score = p_maximum_score,
    score_percent = p_score_percent,
    passed = p_passed,
    grading_metadata = coalesce(p_grading_metadata, '{}'::jsonb),
    submission_idempotency_key = p_idempotency_key
  where id = attempt.id
  returning * into attempt;
  return attempt;
end;
$$;

revoke all on function public.grade_academy_attempt(
  uuid, uuid, text, numeric, numeric, numeric, boolean, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.grade_academy_attempt(
  uuid, uuid, text, numeric, numeric, numeric, boolean, jsonb, jsonb
) to service_role;

create or replace function public.set_academy_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'academy_enrollments', 'academy_lesson_progress', 'academy_module_progress',
    'academy_assessment_attempts', 'academy_assessment_responses',
    'academy_bookmarks', 'academy_learner_notes', 'academy_certificates',
    'academy_learning_path_enrollments'
  ]
  loop
    execute format('drop trigger if exists %I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_academy_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

-- Public verification intentionally returns no internal IDs or email.
create or replace function public.verify_academy_certificate(p_verification_code text)
returns table (
  valid boolean,
  status text,
  learner_display_name text,
  course_title text,
  completion_date date,
  issued_at timestamptz,
  certificate_number text,
  instructor_name text
)
language sql
security definer
set search_path = ''
as $$
  select
    c.status = 'issued' as valid,
    c.status,
    c.learner_display_name,
    c.course_title_snapshot,
    c.completion_date,
    c.issued_at,
    c.certificate_number,
    c.instructor_name_snapshot
  from public.academy_certificates c
  where c.verification_code = p_verification_code
  limit 1;
$$;

revoke all on function public.verify_academy_certificate(text) from public, anon, authenticated;
grant execute on function public.verify_academy_certificate(text) to service_role;

alter table public.academy_enrollments enable row level security;
alter table public.academy_lesson_progress enable row level security;
alter table public.academy_module_progress enable row level security;
alter table public.academy_assessment_attempts enable row level security;
alter table public.academy_assessment_responses enable row level security;
alter table public.academy_bookmarks enable row level security;
alter table public.academy_learner_notes enable row level security;
alter table public.academy_certificates enable row level security;
alter table public.academy_learning_path_enrollments enable row level security;
alter table public.academy_events enable row level security;
alter table public.academy_admin_audit enable row level security;

revoke all on
  public.academy_enrollments,
  public.academy_lesson_progress,
  public.academy_module_progress,
  public.academy_assessment_attempts,
  public.academy_assessment_responses,
  public.academy_bookmarks,
  public.academy_learner_notes,
  public.academy_certificates,
  public.academy_learning_path_enrollments,
  public.academy_events,
  public.academy_admin_audit
from anon, authenticated;

grant select on
  public.academy_enrollments,
  public.academy_lesson_progress,
  public.academy_module_progress,
  public.academy_assessment_attempts,
  public.academy_assessment_responses,
  public.academy_bookmarks,
  public.academy_learner_notes,
  public.academy_certificates,
  public.academy_learning_path_enrollments
to authenticated;

grant all on
  public.academy_enrollments,
  public.academy_lesson_progress,
  public.academy_module_progress,
  public.academy_assessment_attempts,
  public.academy_assessment_responses,
  public.academy_bookmarks,
  public.academy_learner_notes,
  public.academy_certificates,
  public.academy_learning_path_enrollments,
  public.academy_events,
  public.academy_admin_audit
to service_role;

drop policy if exists "members read own academy enrollments" on public.academy_enrollments;
drop policy if exists "members read own academy lesson progress" on public.academy_lesson_progress;
drop policy if exists "members read own academy module progress" on public.academy_module_progress;
drop policy if exists "members read own academy attempts" on public.academy_assessment_attempts;
drop policy if exists "members read own academy responses" on public.academy_assessment_responses;
drop policy if exists "members read own academy bookmarks" on public.academy_bookmarks;
drop policy if exists "members read own private academy notes" on public.academy_learner_notes;
drop policy if exists "members read own academy certificates" on public.academy_certificates;
drop policy if exists "members read own academy path enrollments" on public.academy_learning_path_enrollments;

create policy "members read own academy enrollments"
  on public.academy_enrollments for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy lesson progress"
  on public.academy_lesson_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy module progress"
  on public.academy_module_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy attempts"
  on public.academy_assessment_attempts for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy responses"
  on public.academy_assessment_responses for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy bookmarks"
  on public.academy_bookmarks for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own private academy notes"
  on public.academy_learner_notes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy certificates"
  on public.academy_certificates for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own academy path enrollments"
  on public.academy_learning_path_enrollments for select to authenticated
  using (user_id = (select auth.uid()));

comment on table public.academy_enrollments is
  'Course enrollment snapshots. Progress and completion are server-maintained.';
comment on table public.academy_assessment_attempts is
  'Immutable historical assessment results. Answer keys are never stored here.';
comment on table public.academy_learner_notes is
  'Private learner notes. Service access must always preserve ownership and must not feed analytics or AI automatically.';
comment on table public.academy_certificates is
  'Educational completion certificates, not claims of accreditation.';
comment on table public.academy_events is
  'Provider-neutral LMS analytics without note content, responses, answer keys, or secrets.';
comment on table public.academy_admin_audit is
  'Sensitive LMS administrative actions. No browser role has access.';
