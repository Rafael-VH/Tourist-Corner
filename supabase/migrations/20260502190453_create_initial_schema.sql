-- ============================================================
-- Tourist Corner — Initial Schema Migration
-- ============================================================

-- Enable UUID extension (using gen_random_uuid which is built-in)

-- ============================================================
-- 1. TABLE: users (profiles linked to auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  avatar_url text,
  role text not null check (role in ('tourist', 'manager')) default 'tourist',
  phone text,
  created_at timestamptz not null default now()
);

-- Trigger: automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'tourist')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. TABLE: hotels
-- ============================================================
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('hotel', 'resort', 'motel', 'residential')),
  description text,
  address text,
  city text,
  phone text,
  email text,
  images text[] default '{}',
  cover_image text,
  rating decimal(2,1) default 0,
  review_count int default 0,
  amenities text[] default '{}',
  latitude decimal(10,8),
  longitude decimal(11,8),
  price_range_min int,
  price_range_max int,
  manager_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean default true
);

-- Trigger: auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_hotels_updated_at
  before update on public.hotels
  for each row execute function update_updated_at_column();

-- ============================================================
-- 3. TABLE: rooms
-- ============================================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  name text not null,
  description text,
  type text,
  price_per_night decimal(10,2) not null,
  capacity int not null,
  bed_type text,
  size int,
  images text[] default '{}',
  amenities text[] default '{}',
  status text check (status in ('available', 'occupied', 'maintenance')) default 'available',
  is_available boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_rooms_updated_at
  before update on public.rooms
  for each row execute function update_updated_at_column();

-- ============================================================
-- 4. TABLE: room_availability
-- ============================================================
create table if not exists public.room_availability (
  room_id uuid not null references public.rooms(id) on delete cascade,
  date date not null,
  is_available boolean not null default true,
  price_override decimal(10,2),
  primary key (room_id, date)
);

-- ============================================================
-- 5. TABLE: comments
-- ============================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null,
  target_type text not null check (target_type in ('hotel', 'room')),
  user_id uuid references public.users(id) on delete set null,
  user_name text not null,
  user_avatar text,
  rating int check (rating >= 1 and rating <= 5),
  content text not null,
  images text[] default '{}',
  likes int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_comments_updated_at
  before update on public.comments
  for each row execute function update_updated_at_column();

-- ============================================================
-- 6. ROW LEVEL SECURITY — users
-- ============================================================
alter table public.users enable row level security;

create policy "users_select_all" on public.users for select using (true);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- ============================================================
-- 7. ROW LEVEL SECURITY — hotels
-- ============================================================
alter table public.hotels enable row level security;

create policy "hotels_select_active" on public.hotels for select using (is_active = true);
create policy "hotels_select_manager" on public.hotels for select using (auth.uid() = manager_id);
create policy "hotels_insert_manager" on public.hotels for insert with check (auth.uid() = manager_id);
create policy "hotels_update_manager" on public.hotels for update using (auth.uid() = manager_id);
create policy "hotels_delete_manager" on public.hotels for delete using (auth.uid() = manager_id);

-- ============================================================
-- 8. ROW LEVEL SECURITY — rooms
-- ============================================================
alter table public.rooms enable row level security;

create policy "rooms_select_all" on public.rooms for select using (true);
create policy "rooms_insert_manager" on public.rooms for insert with check (
  auth.uid() in (select manager_id from public.hotels where id = hotel_id)
);
create policy "rooms_update_manager" on public.rooms for update using (
  auth.uid() in (select manager_id from public.hotels where id = hotel_id)
);
create policy "rooms_delete_manager" on public.rooms for delete using (
  auth.uid() in (select manager_id from public.hotels where id = hotel_id)
);

-- ============================================================
-- 9. ROW LEVEL SECURITY — room_availability
-- ============================================================
alter table public.room_availability enable row level security;

create policy "room_availability_select_all" on public.room_availability for select using (true);
create policy "room_availability_manage_manager" on public.room_availability for all using (
  auth.uid() in (select h.manager_id from public.hotels h join public.rooms r on h.id = r.hotel_id where r.id = room_id)
);

-- ============================================================
-- 10. ROW LEVEL SECURITY — comments
-- ============================================================
alter table public.comments enable row level security;

create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_auth" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_update_own" on public.comments for update using (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- ============================================================
-- 11. INDEXES
-- ============================================================
create index idx_hotels_city on public.hotels(city);
create index idx_hotels_type on public.hotels(type);
create index idx_hotels_manager on public.hotels(manager_id);
create index idx_hotels_active on public.hotels(is_active);
create index idx_rooms_hotel on public.rooms(hotel_id);
create index idx_comments_target on public.comments(target_id, target_type);
create index idx_comments_user on public.comments(user_id);
create index idx_room_availability_date on public.room_availability(date);

-- ============================================================
-- 12. GRANT ACCESS
-- ============================================================
grant select on public.users, public.hotels, public.rooms, public.room_availability, public.comments to anon, authenticated;
grant insert, update, delete on public.comments to authenticated;
grant insert, update on public.hotels to authenticated;
grant insert, update on public.rooms to authenticated;
grant insert, update on public.room_availability to authenticated;
