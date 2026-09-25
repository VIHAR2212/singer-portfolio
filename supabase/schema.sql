-- ============================================================
-- Sonal Makwana Executive Portfolio Database Schema
-- Run this in Supabase -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Bookings & Inquiries Table (filled by organizers)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  event_type text not null,
  event_date date,
  city text,
  message text,
  status text not null default 'new',
  notes text,
  updated_at timestamptz default now()
);

-- 2. Stage Gallery Table (with manual frame & head positioning)
create table if not exists public.gallery (
  id text primary key,
  number text not null,
  title text not null,
  category text default 'Navratri',
  designation text default 'Live Festive Performance',
  quote text,
  image text not null,
  object_position text default 'center 20%',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Dynamic Site Settings Table (Performance Video & Featured Song)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Security: Lock tables so only the server (service role key) can read/write
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.site_settings enable row level security;

-- Storage Bucket setup (Optional - for high-res uploads):
-- In Supabase -> Storage -> Create a public bucket called 'uploads'
