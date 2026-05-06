-- Migration: Add user_id to reservations table and setup RLS policies for clients
-- Date: 2026-05-08
-- Description: Adds user_id column to link reservations to authenticated users,
--              backfills existing data, creates index, and adds RLS policies.

-- Step 1: Add user_id column to reservations table
ALTER TABLE public.reservations 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 2: Back-fill user_id for existing reservations by matching guest_email to users.email
-- This updates reservations that don't already have a user_id set
UPDATE public.reservations r
SET user_id = u.id
FROM public.users u
WHERE r.user_id IS NULL 
  AND r.guest_email = u.email;

-- Step 3: Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);

-- Step 4: Enable RLS on reservations table if not already enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (idempotency)
DROP POLICY IF EXISTS "Clients can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can insert their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can delete their own reservations" ON public.reservations;

-- Step 6: Create RLS policies for clients
-- Policy: Clients can view their own reservations
CREATE POLICY "Clients can view their own reservations" 
  ON public.reservations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Clients can insert their own reservations
-- Allow inserting with user_id = auth.uid() OR user_id IS NULL (for guest bookings before login)
CREATE POLICY "Clients can insert their own reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Clients can update their own reservations (optional but recommended)
CREATE POLICY "Clients can update their own reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Clients can delete their own reservations (optional)
CREATE POLICY "Clients can delete their own reservations" 
  ON public.reservations 
  FOR DELETE 
  USING (auth.uid() = user_id);
