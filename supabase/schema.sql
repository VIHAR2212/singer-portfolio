-- ============================================================
-- Sonal Makwana Executive Portfolio Database & Storage Schema
-- Run this in Supabase -> SQL Editor -> New Query -> Run
-- Safe to re-run multiple times (Idempotent)
-- ============================================================

-- 1. Bookings & Inquiries Table (filled by organizers from website)
create table if not exists public.bookings (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  event_type text not null default 'Live Concert / Sangeet',
  event_date text,
  city text,
  message text,
  status text not null default 'new',
  notes text,
  updated_at timestamptz default now()
);

-- In case bookings was previously created with uuid id or date column, alter to text
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'bookings' and column_name = 'id' and data_type = 'uuid'
  ) then
    alter table public.bookings alter column id type text;
  end if;

  if exists (
    select 1 from information_schema.columns 
    where table_name = 'bookings' and column_name = 'event_date' and data_type = 'date'
  ) then
    alter table public.bookings alter column event_date type text;
  end if;
end $$;

-- 2. Stage Moments Gallery Table (with manual 2D frame, scale & rotation)
create table if not exists public.gallery (
  id text primary key,
  number text not null,
  title text not null,
  category text default 'Navratri',
  designation text default 'Live Festive Performance',
  quote text,
  image text not null,
  object_position text default '50% 20%',
  scale numeric default 1,
  rotation numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure scale and rotation columns exist if table was previously created without them
alter table public.gallery add column if not exists scale numeric default 1;
alter table public.gallery add column if not exists rotation numeric default 0;

-- 3. Dynamic Site Settings Table (Hero Portrait, Riyaz Photo, Video & Featured Song)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- Security & Row Level Security (RLS) Policies
-- ============================================================
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.site_settings enable row level security;

-- Allow public website visitors to submit booking inquiries
drop policy if exists "Public insert bookings" on public.bookings;
create policy "Public insert bookings" on public.bookings for insert with check (true);

-- Allow public website visitors to read gallery and site settings
drop policy if exists "Public read gallery" on public.gallery;
create policy "Public read gallery" on public.gallery for select using (true);

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select using (true);

-- Allow admin full read/write access via service role key
drop policy if exists "Service full access bookings" on public.bookings;
create policy "Service full access bookings" on public.bookings using (true) with check (true);

drop policy if exists "Service full access gallery" on public.gallery;
create policy "Service full access gallery" on public.gallery using (true) with check (true);

drop policy if exists "Service full access site_settings" on public.site_settings;
create policy "Service full access site_settings" on public.site_settings using (true) with check (true);

-- ============================================================
-- Supabase Storage Bucket setup for high-res photo uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

-- Allow public CDN read access to uploaded images
drop policy if exists "Public Access uploads" on storage.objects;
create policy "Public Access uploads" on storage.objects for select using (bucket_id = 'uploads');

-- Allow authenticated/service-role uploads
drop policy if exists "Allow upload to uploads bucket" on storage.objects;
create policy "Allow upload to uploads bucket" on storage.objects for insert with check (bucket_id = 'uploads');

drop policy if exists "Allow update to uploads bucket" on storage.objects;
create policy "Allow update to uploads bucket" on storage.objects for update using (bucket_id = 'uploads');

drop policy if exists "Allow delete from uploads bucket" on storage.objects;
create policy "Allow delete from uploads bucket" on storage.objects for delete using (bucket_id = 'uploads');
