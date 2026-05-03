-- Create registration_codes table for owner onboarding
create table if not exists public.registration_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  used boolean not null default false,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by uuid references public.users(id)
);

alter table public.registration_codes enable row level security;

create policy "Admins can insert registration codes" on public.registration_codes
  for insert with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Admins can select registration codes" on public.registration_codes
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Owners can view used registration codes" on public.registration_codes
  for select using (
    used = true
    and exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'owner'
    )
  );

-- Create featured_hotels table for admin curation
create table if not exists public.featured_hotels (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels(id) not null,
  featured_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true,
  unique(hotel_id)
);

alter table public.featured_hotels enable row level security;

create policy "Anyone can view featured hotels" on public.featured_hotels
  for select using (true);

create policy "Admins can manage featured hotels" on public.featured_hotels
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- Create custom_room_types table for owner-specific room types
create table if not exists public.custom_room_types (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) not null,
  name text not null,
  description text,
  icon text,
  capacity int not null default 2,
  base_price numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.custom_room_types enable row level security;

create policy "Owners can manage own room types" on public.custom_room_types
  for all using (auth.uid() = owner_id);

create policy "Anyone can view custom room types" on public.custom_room_types
  for select using (true);

-- Create custom_services table for owner-specific services
create table if not exists public.custom_services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) not null,
  hotel_id uuid references public.hotels(id),
  name text not null,
  description text,
  icon text,
  price numeric(10, 2),
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.custom_services enable row level security;

create policy "Owners can manage own services" on public.custom_services
  for all using (auth.uid() = owner_id);

create policy "Anyone can view custom services" on public.custom_services
  for select using (true);
