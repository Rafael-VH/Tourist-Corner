-- Create featured_rooms table for room curation
create table if not exists public.featured_rooms (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  featured_order int not null default 0,
  featured_at timestamptz not null default now(),
  active boolean not null default true,
  unique(room_id)
);

alter table public.featured_rooms enable row level security;

drop policy if exists "Anyone can view featured rooms" on public.featured_rooms;
create policy "Anyone can view featured rooms" on public.featured_rooms
  for select using (true);

drop policy if exists "Admins and Managers can manage featured rooms" on public.featured_rooms;
create policy "Admins and Managers can manage featured rooms" on public.featured_rooms
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'manager', 'owner')
    )
  );

-- Index for faster ordering
create index if not exists idx_featured_rooms_order on public.featured_rooms(featured_order);
create index if not exists idx_featured_rooms_room on public.featured_rooms(room_id);
