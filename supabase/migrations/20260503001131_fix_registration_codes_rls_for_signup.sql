-- Allow anonymous users to select registration codes for validation during signup
-- Without this, users cannot verify their registration code because they're not authenticated yet

create policy "Public can select unused registration codes" on public.registration_codes
  for select using (used = false);

-- Extend admin select policy to include owners
drop policy if exists "Admins can select registration codes" on public.registration_codes;

create policy "Admins and owners can select registration codes" on public.registration_codes
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role in ('admin', 'owner')
    )
  );
