-- DayTradingPost Academy Volume 6: admin, instructor assignments and audit workflows.
-- Run after supabase-trading-academy-lms.sql and supabase-academy-personalization.sql.

create table if not exists public.academy_instructor_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id text not null check (length(btrim(instructor_id)) between 1 and 200),
  course_id text not null check (length(btrim(course_id)) between 1 and 200),
  active boolean not null default true,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, course_id)
);
create index if not exists academy_instructor_assignments_instructor_idx
  on public.academy_instructor_assignments(instructor_id, course_id)
  where active = true;

alter table public.academy_course_reviews
  drop constraint if exists academy_course_reviews_moderation_status_check;
alter table public.academy_course_reviews
  add constraint academy_course_reviews_moderation_status_check
  check (moderation_status in ('pending', 'published', 'rejected', 'reported'));

create table if not exists public.academy_review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.academy_course_reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (length(btrim(reason)) between 1 and 500),
  created_at timestamptz not null default now(),
  unique(review_id, user_id)
);

create table if not exists public.academy_review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.academy_course_reviews(id) on delete cascade,
  instructor_user_id uuid not null references public.profiles(id) on delete cascade,
  reply_text text not null check (length(btrim(reply_text)) between 1 and 1000),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'published', 'rejected')),
  moderation_reason text,
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(review_id, instructor_user_id)
);
create index if not exists academy_review_replies_moderation_idx
  on public.academy_review_replies(moderation_status, created_at)
  where deleted_at is null;

drop trigger if exists academy_instructor_assignments_touch_updated_at
  on public.academy_instructor_assignments;
create trigger academy_instructor_assignments_touch_updated_at
before update on public.academy_instructor_assignments
for each row execute function public.touch_academy_personalization_updated_at();

drop trigger if exists academy_review_replies_touch_updated_at
  on public.academy_review_replies;
create trigger academy_review_replies_touch_updated_at
before update on public.academy_review_replies
for each row execute function public.touch_academy_personalization_updated_at();

create or replace function public.report_academy_review(
  p_user_id uuid,
  p_review_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  review_owner uuid;
begin
  if length(btrim(p_reason)) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'invalid report reason';
  end if;
  select user_id into review_owner
  from public.academy_course_reviews
  where id = p_review_id and moderation_status = 'published' and deleted_at is null
  for update;
  if review_owner is null or review_owner = p_user_id then
    raise exception using errcode = '42501', message = 'review cannot be reported';
  end if;
  insert into public.academy_review_reports(review_id, user_id, reason)
  values (p_review_id, p_user_id, btrim(p_reason));
  update public.academy_course_reviews
  set moderation_status = 'reported'
  where id = p_review_id;
end;
$$;

create or replace function public.admin_enroll_academy_course(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_course_id text,
  p_course_slug text,
  p_course_version integer,
  p_access_snapshot jsonb,
  p_modules jsonb,
  p_lessons jsonb,
  p_request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment_id uuid;
begin
  select target_id::uuid into enrollment_id
  from public.academy_admin_audit
  where request_id = p_request_id
  limit 1;
  if enrollment_id is not null then return enrollment_id; end if;

  enrollment_id := public.enroll_academy_course(
    p_user_id, p_course_id, p_course_slug, p_course_version, 'admin',
    p_access_snapshot, p_modules, p_lessons, p_request_id
  );
  insert into public.academy_admin_audit(
    actor_user_id, action, target_type, target_id, request_id, metadata
  ) values (
    p_actor_user_id, 'academy_manual_enrollment', 'academy_enrollment',
    enrollment_id::text, p_request_id,
    jsonb_build_object('courseId', p_course_id, 'learnerId', p_user_id)
  );
  return enrollment_id;
end;
$$;

create or replace function public.admin_manage_academy_enrollment(
  p_actor_user_id uuid,
  p_enrollment_id uuid,
  p_action text,
  p_reason text,
  p_confirmation text,
  p_request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment public.academy_enrollments%rowtype;
  invalidated_count integer := 0;
begin
  if p_action not in ('pause', 'revoke', 'restore', 'reset') then
    raise exception using errcode = '22023', message = 'invalid enrollment action';
  end if;
  if length(btrim(p_reason)) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if exists(select 1 from public.academy_admin_audit where request_id = p_request_id) then
    return p_enrollment_id;
  end if;

  select * into enrollment
  from public.academy_enrollments
  where id = p_enrollment_id
  for update;
  if enrollment.id is null then
    raise exception using errcode = 'P0002', message = 'enrollment not found';
  end if;

  if p_action = 'pause' then
    if enrollment.status not in ('enrolled', 'in_progress') then
      raise exception using errcode = '23514', message = 'enrollment cannot be paused';
    end if;
    update public.academy_enrollments set status = 'paused' where id = p_enrollment_id;
  elsif p_action = 'revoke' then
    update public.academy_enrollments set status = 'revoked' where id = p_enrollment_id;
  elsif p_action = 'restore' then
    if enrollment.status not in ('paused', 'revoked') then
      raise exception using errcode = '23514', message = 'enrollment cannot be restored';
    end if;
    update public.academy_enrollments
    set status = case when progress_percent > 0 then 'in_progress' else 'enrolled' end
    where id = p_enrollment_id;
  else
    if p_confirmation <> 'RESET PROGRESS' then
      raise exception using errcode = '22023', message = 'reset confirmation required';
    end if;
    update public.academy_assessment_attempts
    set status = 'invalidated', updated_at = now()
    where enrollment_id = p_enrollment_id and status <> 'invalidated';
    get diagnostics invalidated_count = row_count;
    update public.academy_lesson_progress
    set status = 'reset', progress_percent = 0, completed_at = null,
        completion_method = null, video_position_seconds = null, updated_at = now()
    where enrollment_id = p_enrollment_id;
    update public.academy_module_progress
    set status = 'reset', progress_percent = 0, completed_at = null,
        completed_required_lessons_count = 0, updated_at = now()
    where enrollment_id = p_enrollment_id;
    update public.academy_enrollments
    set status = 'enrolled', progress_percent = 0, started_at = null,
        completed_at = null, last_accessed_at = null,
        current_module_id = null, current_lesson_id = null
    where id = p_enrollment_id;
  end if;

  insert into public.academy_admin_audit(
    actor_user_id, action, target_type, target_id, request_id, metadata
  ) values (
    p_actor_user_id, 'academy_enrollment_' || p_action, 'academy_enrollment',
    p_enrollment_id::text, p_request_id,
    jsonb_build_object(
      'reason', btrim(p_reason), 'previousStatus', enrollment.status,
      'invalidatedAttempts', invalidated_count
    )
  );
  return p_enrollment_id;
end;
$$;

create or replace function public.admin_invalidate_academy_attempt(
  p_actor_user_id uuid,
  p_attempt_id uuid,
  p_reason text,
  p_request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if length(btrim(p_reason)) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if exists(select 1 from public.academy_admin_audit where request_id = p_request_id) then
    return p_attempt_id;
  end if;
  update public.academy_assessment_attempts
  set status = 'invalidated', updated_at = now()
  where id = p_attempt_id and status <> 'invalidated';
  if not found then
    raise exception using errcode = 'P0002', message = 'attempt not found';
  end if;
  insert into public.academy_admin_audit(
    actor_user_id, action, target_type, target_id, request_id, metadata
  ) values (
    p_actor_user_id, 'academy_assessment_invalidated', 'academy_assessment_attempt',
    p_attempt_id::text, p_request_id, jsonb_build_object('reason', btrim(p_reason))
  );
  return p_attempt_id;
end;
$$;

create or replace function public.admin_moderate_academy_review(
  p_actor_user_id uuid,
  p_review_id uuid,
  p_status text,
  p_reason text,
  p_request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('published', 'rejected') then
    raise exception using errcode = '22023', message = 'invalid review status';
  end if;
  if length(btrim(p_reason)) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if exists(select 1 from public.academy_admin_audit where request_id = p_request_id) then
    return p_review_id;
  end if;
  update public.academy_course_reviews
  set moderation_status = p_status, moderation_reason = btrim(p_reason),
      moderated_by = p_actor_user_id, moderated_at = now()
  where id = p_review_id and deleted_at is null;
  if not found then
    raise exception using errcode = 'P0002', message = 'review not found';
  end if;
  insert into public.academy_admin_audit(
    actor_user_id, action, target_type, target_id, request_id, metadata
  ) values (
    p_actor_user_id, 'academy_review_' || p_status, 'course_review',
    p_review_id::text, p_request_id, jsonb_build_object('reason', btrim(p_reason))
  );
  return p_review_id;
end;
$$;

create or replace function public.admin_moderate_academy_reply(
  p_actor_user_id uuid,
  p_reply_id uuid,
  p_status text,
  p_reason text,
  p_request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('published', 'rejected') then
    raise exception using errcode = '22023', message = 'invalid reply status';
  end if;
  if length(btrim(p_reason)) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if exists(select 1 from public.academy_admin_audit where request_id = p_request_id) then
    return p_reply_id;
  end if;
  update public.academy_review_replies
  set moderation_status = p_status, moderation_reason = btrim(p_reason),
      moderated_by = p_actor_user_id, moderated_at = now()
  where id = p_reply_id and deleted_at is null;
  if not found then
    raise exception using errcode = 'P0002', message = 'reply not found';
  end if;
  insert into public.academy_admin_audit(
    actor_user_id, action, target_type, target_id, request_id, metadata
  ) values (
    p_actor_user_id, 'academy_instructor_reply_' || p_status,
    'academy_instructor_reply', p_reply_id::text, p_request_id,
    jsonb_build_object('reason', btrim(p_reason))
  );
  return p_reply_id;
end;
$$;

alter table public.academy_instructor_assignments enable row level security;
alter table public.academy_review_reports enable row level security;
alter table public.academy_review_replies enable row level security;

revoke all on
  public.academy_instructor_assignments,
  public.academy_review_reports,
  public.academy_review_replies
from anon, authenticated;
grant all on
  public.academy_instructor_assignments,
  public.academy_review_reports,
  public.academy_review_replies
to service_role;

revoke all on function public.report_academy_review(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.admin_enroll_academy_course(uuid, uuid, text, text, integer, jsonb, jsonb, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.admin_manage_academy_enrollment(uuid, uuid, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.admin_invalidate_academy_attempt(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.admin_moderate_academy_review(uuid, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.admin_moderate_academy_reply(uuid, uuid, text, text, text)
  from public, anon, authenticated;

grant execute on function public.report_academy_review(uuid, uuid, text)
  to service_role;
grant execute on function public.admin_enroll_academy_course(uuid, uuid, text, text, integer, jsonb, jsonb, jsonb, text)
  to service_role;
grant execute on function public.admin_manage_academy_enrollment(uuid, uuid, text, text, text, text)
  to service_role;
grant execute on function public.admin_invalidate_academy_attempt(uuid, uuid, text, text)
  to service_role;
grant execute on function public.admin_moderate_academy_review(uuid, uuid, text, text, text)
  to service_role;
grant execute on function public.admin_moderate_academy_reply(uuid, uuid, text, text, text)
  to service_role;

comment on table public.academy_instructor_assignments is
  'Explicit authenticated-user to Sanity instructor/course ownership mapping.';
comment on table public.academy_review_replies is
  'Instructor-owned replies requiring moderation before public display.';
