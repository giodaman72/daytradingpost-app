-- DayTradingPost Academy Volume 5: personalization, verified reviews and preferences.
-- Run this entire file in the Supabase SQL Editor after supabase-trading-academy-lms.sql.

create table if not exists public.academy_learner_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  interests text[] not null default '{}'::text[]
    check (cardinality(interests) <= 20),
  course_reminders boolean not null default true,
  completion_notifications boolean not null default true,
  assessment_notifications boolean not null default true,
  certificate_notifications boolean not null default true,
  academy_announcements boolean not null default true,
  email_enabled boolean not null default false,
  unsubscribed_all boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null check (length(btrim(course_id)) between 1 and 200),
  rating smallint not null check (rating between 1 and 5),
  title text not null check (length(btrim(title)) between 1 and 120),
  review_text text not null check (length(btrim(review_text)) between 1 and 2000),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'published', 'rejected')),
  moderation_reason text,
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists academy_course_reviews_one_active_per_user_course
  on public.academy_course_reviews(user_id, course_id)
  where deleted_at is null;
create index if not exists academy_course_reviews_public_course_idx
  on public.academy_course_reviews(course_id, created_at desc)
  where moderation_status = 'published' and deleted_at is null;
create index if not exists academy_course_reviews_moderation_queue_idx
  on public.academy_course_reviews(created_at)
  where moderation_status = 'pending' and deleted_at is null;

create or replace function public.touch_academy_personalization_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists academy_preferences_touch_updated_at
  on public.academy_learner_preferences;
create trigger academy_preferences_touch_updated_at
before update on public.academy_learner_preferences
for each row execute function public.touch_academy_personalization_updated_at();

drop trigger if exists academy_reviews_touch_updated_at
  on public.academy_course_reviews;
create trigger academy_reviews_touch_updated_at
before update on public.academy_course_reviews
for each row execute function public.touch_academy_personalization_updated_at();

alter table public.academy_learner_preferences enable row level security;
alter table public.academy_course_reviews enable row level security;

revoke all on public.academy_learner_preferences, public.academy_course_reviews
  from anon, authenticated;
grant all on public.academy_learner_preferences, public.academy_course_reviews
  to service_role;

-- All writes and review reads pass through owner-aware or public server services.
-- No browser role can query review drafts or other learners' preferences.

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
    'academy_learning_path_viewed', 'academy_learning_path_enrolled',
    'academy_learning_path_resumed', 'academy_learning_path_course_opened',
    'academy_learning_path_completed', 'academy_recommendation_viewed',
    'academy_recommendation_opened', 'academy_review_created',
    'academy_review_edited', 'academy_notification_opened',
    'academy_preference_changed'
  ));

comment on table public.academy_course_reviews is
  'Verified-enrollment learner reviews. Only published, non-deleted rows contribute to public aggregates.';
comment on table public.academy_learner_preferences is
  'Private learner-selected interests and Academy notification consent.';
