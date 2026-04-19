-- Meridian — initial schema
-- Apply via Supabase dashboard SQL editor once your org's invoices are settled.

create extension if not exists "pgcrypto";

-- Waitlist signups (the email-capture target)
create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'landing-hero',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- Anon visitors can INSERT a signup (the public form), but cannot read.
drop policy if exists "anon insert waitlist" on public.waitlist_signups;
create policy "anon insert waitlist" on public.waitlist_signups
  for insert to anon with check (true);

-- Required by Harbor: content table for future articles published by Harbor Writer.
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  excerpt text,
  cover_image_url text,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_published_at_idx
  on public.content (published_at desc);

alter table public.content enable row level security;

-- Anyone can read published articles.
drop policy if exists "public read published content" on public.content;
create policy "public read published content" on public.content
  for select to anon, authenticated using (published_at is not null);
