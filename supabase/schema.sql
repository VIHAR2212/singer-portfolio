-- Run this once in Supabase -> SQL Editor
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
  status text not null default 'new'
);

-- Lock the table: only the server (service role key) can read or write.
alter table public.bookings enable row level security;
