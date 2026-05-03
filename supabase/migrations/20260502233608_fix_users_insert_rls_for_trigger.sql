-- Fix users insert policy to allow trigger inserts
-- The handle_new_user trigger runs with security definer but auth.uid() is NULL during signup
-- This policy allows the trigger to insert profiles even when auth.uid() is null

drop policy if exists "Users can insert own profile" on public.users;

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id or auth.uid() is null);
