-- DayTradingPost AI Assistant conversations, usage, and feedback.
-- Run after docs/supabase-auth.sql. All mutations are performed by trusted server code.

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  status text not null default 'active' check (status in ('active', 'archived')),
  context_mode text not null check (context_mode in (
    'general_education', 'market_analysis', 'economic_event',
    'article_explanation', 'academy_tutor', 'watchlist_summary',
    'risk_management'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists ai_conversations_user_updated_idx
  on public.ai_conversations(user_id, updated_at desc);
create index if not exists ai_conversations_user_status_idx
  on public.ai_conversations(user_id, status);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  citations jsonb not null default '[]'::jsonb check (jsonb_typeof(citations) = 'array'),
  source_context jsonb not null default '{}'::jsonb check (jsonb_typeof(source_context) = 'object'),
  model text,
  provider text,
  token_usage jsonb not null default '{}'::jsonb check (jsonb_typeof(token_usage) = 'object'),
  safety_flags text[] not null default '{}',
  request_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, request_id, role)
);

create index if not exists ai_messages_conversation_created_idx
  on public.ai_messages(conversation_id, created_at);
create index if not exists ai_messages_user_created_idx
  on public.ai_messages(user_id, created_at desc);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0 check (request_count >= 0),
  input_tokens bigint not null default 0 check (input_tokens >= 0),
  output_tokens bigint not null default 0 check (output_tokens >= 0),
  estimated_cost numeric(14,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, usage_date)
);

create index if not exists ai_usage_date_idx on public.ai_usage(usage_date desc);
create index if not exists ai_usage_user_date_idx on public.ai_usage(user_id, usage_date desc);

create or replace function public.claim_ai_request(
  p_user_id uuid,
  p_daily_limit integer
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with claimed as (
    insert into public.ai_usage (user_id, usage_date, request_count)
    values (p_user_id, current_date, 1)
    on conflict (user_id, usage_date) do update
    set request_count = public.ai_usage.request_count + 1,
        updated_at = now()
    where public.ai_usage.request_count < greatest(p_daily_limit, 1)
    returning 1
  )
  select exists(select 1 from claimed);
$$;

create or replace function public.record_ai_token_usage(
  p_user_id uuid,
  p_input_tokens integer default 0,
  p_output_tokens integer default 0,
  p_estimated_cost numeric default null
)
returns public.ai_usage
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.ai_usage;
begin
  insert into public.ai_usage (
    user_id, usage_date, request_count, input_tokens, output_tokens, estimated_cost
  )
  values (
    p_user_id, current_date, 0,
    greatest(p_input_tokens, 0), greatest(p_output_tokens, 0),
    case when p_estimated_cost is null then null else greatest(p_estimated_cost, 0) end
  )
  on conflict (user_id, usage_date) do update
  set input_tokens = public.ai_usage.input_tokens + excluded.input_tokens,
      output_tokens = public.ai_usage.output_tokens + excluded.output_tokens,
      estimated_cost = case
        when public.ai_usage.estimated_cost is null and excluded.estimated_cost is null then null
        else coalesce(public.ai_usage.estimated_cost, 0) + coalesce(excluded.estimated_cost, 0)
      end,
      updated_at = now()
  returning * into result;
  return result;
end;
$$;

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  message_id uuid not null references public.ai_messages(id) on delete cascade,
  rating text not null check (rating in ('positive', 'negative')),
  reason text not null check (reason in (
    'helpful', 'not_helpful', 'incorrect', 'outdated',
    'missing_citation', 'unsafe', 'other'
  )),
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique(user_id, message_id)
);

create index if not exists ai_feedback_created_idx on public.ai_feedback(created_at desc);
create index if not exists ai_feedback_user_idx on public.ai_feedback(user_id);

create table if not exists public.ai_request_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  request_id text not null unique,
  context_mode text not null,
  status text not null check (status in ('completed', 'refused', 'error')),
  provider text,
  duration_ms integer not null default 0 check (duration_ms >= 0),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  citation_count integer not null default 0 check (citation_count >= 0),
  safety_flags text[] not null default '{}',
  error_code text,
  created_at timestamptz not null default now()
);
create index if not exists ai_request_logs_created_idx
  on public.ai_request_logs(created_at desc);
create index if not exists ai_request_logs_status_idx
  on public.ai_request_logs(status, created_at desc);

create or replace function public.set_ai_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_conversations_updated_at on public.ai_conversations;
create trigger ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_ai_updated_at();
drop trigger if exists ai_usage_updated_at on public.ai_usage;
create trigger ai_usage_updated_at
  before update on public.ai_usage
  for each row execute function public.set_ai_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.ai_request_logs enable row level security;

revoke all on public.ai_conversations, public.ai_messages, public.ai_usage, public.ai_feedback from anon, authenticated;
grant select on public.ai_conversations, public.ai_messages, public.ai_usage, public.ai_feedback to authenticated;
grant all on public.ai_conversations, public.ai_messages, public.ai_usage, public.ai_feedback to service_role;
revoke all on public.ai_request_logs from anon, authenticated;
grant all on public.ai_request_logs to service_role;
revoke all on function public.claim_ai_request(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_ai_request(uuid, integer) to service_role;
revoke all on function public.record_ai_token_usage(uuid, integer, integer, numeric) from public, anon, authenticated;
grant execute on function public.record_ai_token_usage(uuid, integer, integer, numeric) to service_role;

drop policy if exists "members read own ai conversations" on public.ai_conversations;
drop policy if exists "members read own ai messages" on public.ai_messages;
drop policy if exists "members read own ai usage" on public.ai_usage;
drop policy if exists "members read own ai feedback" on public.ai_feedback;

create policy "members read own ai conversations"
  on public.ai_conversations for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own ai messages"
  on public.ai_messages for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own ai usage"
  on public.ai_usage for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members read own ai feedback"
  on public.ai_feedback for select to authenticated
  using (user_id = (select auth.uid()));

comment on table public.ai_conversations is
  'Private assistant conversations. Recommended retention is controlled by AI_CONVERSATION_RETENTION_DAYS.';
comment on table public.ai_messages is
  'User and assistant messages without hidden prompts, raw provider traces, credentials, or chain-of-thought.';
comment on table public.ai_usage is
  'Server-maintained daily aggregate usage. Ordinary users have read-only access to their own row.';
comment on table public.ai_request_logs is
  'Privacy-conscious request telemetry only. It intentionally excludes prompts, answers, retrieved context, credentials, and provider traces.';
