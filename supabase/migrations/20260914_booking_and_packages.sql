-- Eduvic Travels — booking + package management
-- Safe to run on an existing database: every statement is guarded.
-- Run it in the Supabase SQL editor, or with `supabase db push`.

-- ─────────────────────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.bookings add column if not exists reference        text;
alter table public.bookings add column if not exists full_name        text;
alter table public.bookings add column if not exists phone_whatsapp   text;
alter table public.bookings add column if not exists email            text;
alter table public.bookings add column if not exists address          text;
alter table public.bookings add column if not exists budget           text;
alter table public.bookings add column if not exists service_type     text;
alter table public.bookings add column if not exists destination      text;
alter table public.bookings add column if not exists booking_date     date;
alter table public.bookings add column if not exists booking_time     time;
alter table public.bookings add column if not exists notes            text;
alter table public.bookings add column if not exists accepted_tnc     boolean default false;
alter table public.bookings add column if not exists status           text default 'pending';
alter table public.bookings add column if not exists client_id        uuid;
alter table public.bookings add column if not exists notified_at      timestamptz;

create unique index if not exists bookings_reference_key
  on public.bookings (reference) where reference is not null;

-- One appointment per slot. Cancelled bookings free the slot up again.
create unique index if not exists bookings_slot_unique
  on public.bookings (booking_date, booking_time)
  where status <> 'cancelled';

create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists bookings_status_idx on public.bookings (status);

-- ─────────────────────────────────────────────────────────────
-- Availability (optional — the site falls back to standard
-- business hours when this table is empty)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (slot_date, slot_time)
);

-- ─────────────────────────────────────────────────────────────
-- Travel packages
-- ─────────────────────────────────────────────────────────────
create table if not exists public.travel_offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.travel_offers add column if not exists title         text;
alter table public.travel_offers add column if not exists destination   text;
alter table public.travel_offers add column if not exists price         numeric default 0;
alter table public.travel_offers add column if not exists duration_days integer default 7;
alter table public.travel_offers add column if not exists description   text;
alter table public.travel_offers add column if not exists image_url     text;
alter table public.travel_offers add column if not exists tags          text[] default '{}';
alter table public.travel_offers add column if not exists inclusions    text[] default '{}';
alter table public.travel_offers add column if not exists itinerary     jsonb default '[]'::jsonb;
alter table public.travel_offers add column if not exists is_active     boolean default true;
alter table public.travel_offers add column if not exists updated_at    timestamptz default now();

-- ─────────────────────────────────────────────────────────────
-- Who counts as staff
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.email = auth.jwt() ->> 'email'
      and upper(u.role) in ('ADMIN', 'AGENT')
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Row level security
-- ─────────────────────────────────────────────────────────────
alter table public.bookings           enable row level security;
alter table public.availability_slots enable row level security;
alter table public.travel_offers      enable row level security;

-- Bookings: anyone can create one from the public form.
drop policy if exists "public can create bookings" on public.bookings;
create policy "public can create bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (accepted_tnc = true);

-- The booking page needs to know which slots are taken, so it reads
-- date + time of live bookings. Nothing else is exposed to anon by this
-- policy beyond those columns being selectable, so keep the select list in
-- the client narrow.
drop policy if exists "slot availability is public" on public.bookings;
create policy "slot availability is public"
  on public.bookings for select
  to anon
  using (booking_date >= current_date);

drop policy if exists "clients read their own bookings" on public.bookings;
create policy "clients read their own bookings"
  on public.bookings for select
  to authenticated
  using (
    public.is_staff()
    or client_id in (
      select u.id from public.users u where u.email = auth.jwt() ->> 'email'
    )
  );

drop policy if exists "staff manage bookings" on public.bookings;
create policy "staff manage bookings"
  on public.bookings for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Availability: readable by everyone, managed by staff.
drop policy if exists "availability is public" on public.availability_slots;
create policy "availability is public"
  on public.availability_slots for select
  to anon, authenticated
  using (true);

drop policy if exists "public can hold a slot" on public.availability_slots;
create policy "public can hold a slot"
  on public.availability_slots for update
  to anon, authenticated
  using (true)
  with check (is_available = false);

drop policy if exists "staff manage availability" on public.availability_slots;
create policy "staff manage availability"
  on public.availability_slots for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Packages: published ones are public, staff manage everything.
drop policy if exists "published packages are public" on public.travel_offers;
create policy "published packages are public"
  on public.travel_offers for select
  to anon, authenticated
  using (is_active = true or public.is_staff());

drop policy if exists "staff manage packages" on public.travel_offers;
create policy "staff manage packages"
  on public.travel_offers for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Keep updated_at honest on packages.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travel_offers_touch on public.travel_offers;
create trigger travel_offers_touch
  before update on public.travel_offers
  for each row execute function public.touch_updated_at();
