-- Careerize Supabase schema
-- Run this in Supabase SQL Editor after creating your Supabase project.
-- Purpose: learner-owned saved profiles, latest discovery result snapshots, discovery history,
-- and the first structured career-intelligence/source-registry tables.

create table if not exists public.careerize_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.careerize_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  selected_signals jsonb not null default '[]'::jsonb,
  reality_preferences jsonb not null default '{"earning":50,"travel":50,"stress":50,"danger":50}'::jsonb,
  ranked_results jsonb not null default '[]'::jsonb,
  best_match text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.careerize_discovery_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_snapshot jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  selected_signals jsonb not null default '[]'::jsonb,
  reality_preferences jsonb not null default '{"earning":50,"travel":50,"stress":50,"danger":50}'::jsonb,
  ranked_results jsonb not null default '[]'::jsonb,
  best_match text,
  match_percent integer,
  assessment_version text not null default 'v1.4',
  created_at timestamptz not null default now()
);

-- Public, read-only career intelligence foundation.
-- Writes should be performed through future governed admin tooling/service-role flows, not by anonymous users.
create table if not exists public.careerize_countries (
  code text primary key,
  name text not null,
  currency_code text not null,
  locale_codes jsonb not null default '[]'::jsonb,
  is_launch_country boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.careerize_sources (
  id text primary key,
  title text not null,
  source_type text not null,
  url text not null,
  accessed_at date not null,
  published_at date,
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  supports jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.careerize_career_profiles (
  id text primary key,
  country_code text not null references public.careerize_countries(code),
  title text not null,
  stream text not null,
  status text not null default 'draft' check (status in ('draft', 'starter-profile', 'reviewed', 'published', 'flagged')),
  summary text not null,
  profile jsonb not null default '{}'::jsonb,
  data_confidence integer not null check (data_confidence >= 0 and data_confidence <= 100),
  last_updated date not null,
  source_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.careerize_career_sources (
  career_id text not null references public.careerize_career_profiles(id) on delete cascade,
  source_id text not null references public.careerize_sources(id) on delete restrict,
  fields_supported jsonb not null default '[]'::jsonb,
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  primary key (career_id, source_id)
);

create table if not exists public.careerize_claim_verifications (
  id uuid primary key default gen_random_uuid(),
  career_id text not null,
  claim_key text not null,
  claim_type text not null check (claim_type in (
    'profile_summary',
    'demand',
    'earning',
    'qualification',
    'entry_requirement',
    'registration',
    'subject_requirement',
    'safety',
    'travel_stress'
  )),
  claim_value jsonb not null default '{}'::jsonb,
  verification_status text not null default 'needs_source' check (verification_status in (
    'draft',
    'needs_source',
    'source_attached',
    'reviewed',
    'published',
    'rejected'
  )),
  source_id text references public.careerize_sources(id) on delete restrict,
  evidence_url text,
  accessed_at date,
  reviewer_notes text,
  confidence integer not null default 0 check (confidence >= 0 and confidence <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint careerize_published_claims_require_evidence check (
    verification_status not in ('reviewed', 'published')
    or (source_id is not null and evidence_url is not null and accessed_at is not null and confidence >= 70)
  )
);

create table if not exists public.careerize_research_queue (
  career_id text primary key,
  career_title text not null,
  stream text not null,
  research_priority text not null check (research_priority in ('high', 'medium', 'standard')),
  current_profile_status text not null,
  current_qualification_status text not null,
  current_demand_status text not null,
  earning_policy text not null,
  required_sources jsonb not null default '[]'::jsonb,
  fields_blocked_until_verified jsonb not null default '[]'::jsonb,
  next_editorial_action text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.careerize_research_team_workplan (
  career_id text primary key,
  batch_id text not null,
  sprint_phase text not null check (sprint_phase in ('phase_1', 'phase_2', 'phase_3')),
  career_title text not null,
  stream text not null,
  research_priority text not null check (research_priority in ('high', 'medium', 'standard')),
  research_lane text not null,
  primary_researcher_role text not null,
  evidence_reviewer_role text not null default 'source_evidence_reviewer',
  qa_reviewer_role text not null default 'learner_safety_editor',
  current_status text not null default 'not_started' check (current_status in (
    'not_started',
    'in_progress',
    'evidence_review',
    'learner_safety_review',
    'ready_for_profile_update',
    'blocked'
  )),
  qa_status text not null default 'not_started' check (qa_status in (
    'not_started',
    'in_progress',
    'evidence_review',
    'learner_safety_review',
    'ready_for_profile_update',
    'blocked'
  )),
  required_output jsonb not null default '[]'::jsonb,
  handoff_rule text not null,
  updated_at timestamptz not null default now(),
  constraint careerize_research_team_workplan_requires_reviewers check (
    evidence_reviewer_role = 'source_evidence_reviewer'
    and qa_reviewer_role = 'learner_safety_editor'
  )
);


alter table public.careerize_results add column if not exists reality_preferences jsonb not null default '{"earning":50,"travel":50,"stress":50,"danger":50}'::jsonb;
alter table public.careerize_discovery_sessions add column if not exists reality_preferences jsonb not null default '{"earning":50,"travel":50,"stress":50,"danger":50}'::jsonb;
alter table public.careerize_profiles enable row level security;
alter table public.careerize_results enable row level security;
alter table public.careerize_discovery_sessions enable row level security;
alter table public.careerize_countries enable row level security;
alter table public.careerize_sources enable row level security;
alter table public.careerize_career_profiles enable row level security;
alter table public.careerize_career_sources enable row level security;
alter table public.careerize_claim_verifications enable row level security;
alter table public.careerize_research_queue enable row level security;
alter table public.careerize_research_team_workplan enable row level security;

create policy "Careerize profile owner select"
on public.careerize_profiles for select
using (auth.uid() = user_id);

create policy "Careerize profile owner insert"
on public.careerize_profiles for insert
with check (auth.uid() = user_id);

create policy "Careerize profile owner update"
on public.careerize_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Careerize result owner select"
on public.careerize_results for select
using (auth.uid() = user_id);

create policy "Careerize result owner insert"
on public.careerize_results for insert
with check (auth.uid() = user_id);

create policy "Careerize result owner update"
on public.careerize_results for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Careerize session owner select"
on public.careerize_discovery_sessions for select
using (auth.uid() = user_id);

create policy "Careerize session owner insert"
on public.careerize_discovery_sessions for insert
with check (auth.uid() = user_id);

create policy "Careerize countries public read"
on public.careerize_countries for select
to anon, authenticated
using (true);

create policy "Careerize sources public read"
on public.careerize_sources for select
to anon, authenticated
using (true);

create policy "Careerize career profiles public read"
on public.careerize_career_profiles for select
to anon, authenticated
using (status in ('starter-profile', 'reviewed', 'published'));

create policy "Careerize career sources public read"
on public.careerize_career_sources for select
to anon, authenticated
using (true);

create policy "Careerize published claim verifications public read"
on public.careerize_claim_verifications for select
to anon, authenticated
using (verification_status in ('reviewed', 'published'));

create policy "Careerize research queue public read"
on public.careerize_research_queue for select
to anon, authenticated
using (true);

create policy "Careerize research team workplan authenticated read"
on public.careerize_research_team_workplan for select
to authenticated
using (true);

create index if not exists careerize_discovery_sessions_user_created_idx
on public.careerize_discovery_sessions (user_id, created_at desc);

create index if not exists careerize_career_profiles_country_status_idx
on public.careerize_career_profiles (country_code, status);

create index if not exists careerize_career_profiles_profile_gin_idx
on public.careerize_career_profiles using gin (profile);

create index if not exists careerize_claim_verifications_career_type_idx
on public.careerize_claim_verifications (career_id, claim_type, verification_status);

create index if not exists careerize_research_queue_priority_idx
on public.careerize_research_queue (research_priority, stream);

create index if not exists careerize_research_team_workplan_phase_lane_idx
on public.careerize_research_team_workplan (sprint_phase, research_lane, current_status);

insert into public.careerize_countries (code, name, currency_code, locale_codes, is_launch_country)
values ('ZA', 'South Africa', 'ZAR', '["en-ZA", "af-ZA", "zu-ZA", "xh-ZA"]'::jsonb, true)
on conflict (code) do update set
  name = excluded.name,
  currency_code = excluded.currency_code,
  locale_codes = excluded.locale_codes,
  is_launch_country = excluded.is_launch_country,
  updated_at = now();
