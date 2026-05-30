-- Careerize Supabase schema
-- Run this in Supabase SQL Editor after creating your Supabase project.

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
  ranked_results jsonb not null default '[]'::jsonb,
  best_match text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.careerize_profiles enable row level security;
alter table public.careerize_results enable row level security;

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
