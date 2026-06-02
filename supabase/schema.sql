-- Careerize Supabase schema
-- Run this in Supabase SQL Editor after creating your Supabase project.
-- This supports: user account auth, one editable learner profile, latest result snapshot, and full discovery history.

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
  ranked_results jsonb not null default '[]'::jsonb,
  best_match text,
  match_percent integer,
  assessment_version text not null default 'v1.1',
  created_at timestamptz not null default now()
);

alter table public.careerize_profiles enable row level security;
alter table public.careerize_results enable row level security;
alter table public.careerize_discovery_sessions enable row level security;

-- Idempotent policy reset. Supabase SQL editor may show notices if policies do not yet exist; that is safe.
drop policy if exists "Users can read their own Careerize profile" on public.careerize_profiles;
drop policy if exists "Users can insert their own Careerize profile" on public.careerize_profiles;
drop policy if exists "Users can update their own Careerize profile" on public.careerize_profiles;
drop policy if exists "Users can delete their own Careerize profile" on public.careerize_profiles;

drop policy if exists "Users can read their own Careerize results" on public.careerize_results;
drop policy if exists "Users can insert their own Careerize results" on public.careerize_results;
drop policy if exists "Users can update their own Careerize results" on public.careerize_results;
drop policy if exists "Users can delete their own Careerize results" on public.careerize_results;

drop policy if exists "Users can read their own Careerize sessions" on public.careerize_discovery_sessions;
drop policy if exists "Users can insert their own Careerize sessions" on public.careerize_discovery_sessions;
drop policy if exists "Users can delete their own Careerize sessions" on public.careerize_discovery_sessions;

create policy "Users can read their own Careerize profile"
on public.careerize_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their own Careerize profile"
on public.careerize_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own Careerize profile"
on public.careerize_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own Careerize profile"
on public.careerize_profiles
for delete
using (auth.uid() = user_id);

create policy "Users can read their own Careerize results"
on public.careerize_results
for select
using (auth.uid() = user_id);

create policy "Users can insert their own Careerize results"
on public.careerize_results
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own Careerize results"
on public.careerize_results
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own Careerize results"
on public.careerize_results
for delete
using (auth.uid() = user_id);

create policy "Users can read their own Careerize sessions"
on public.careerize_discovery_sessions
for select
using (auth.uid() = user_id);

create policy "Users can insert their own Careerize sessions"
on public.careerize_discovery_sessions
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own Careerize sessions"
on public.careerize_discovery_sessions
for delete
using (auth.uid() = user_id);

create index if not exists careerize_discovery_sessions_user_created_idx
on public.careerize_discovery_sessions (user_id, created_at desc);
