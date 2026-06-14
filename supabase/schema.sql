-- Careerize Supabase schema
-- Run this in Supabase SQL Editor after creating your Supabase project.
-- This supports learner-owned saved profiles, latest result snapshots and discovery history.

create table if not exists public.careerize_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);
