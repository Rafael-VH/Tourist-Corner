-- Migration: Fix users role constraint to match application code
-- Date: 2026-05-08
-- Description: Updates the role CHECK constraint from ('tourist', 'manager') to ('client', 'owner', 'admin')
--              and migrates existing data accordingly.

-- Step 1: Update existing data - map old roles to new roles
UPDATE public.users SET role = 'client' WHERE role = 'tourist';
UPDATE public.users SET role = 'owner' WHERE role = 'manager';

-- Step 2: Drop the existing role CHECK constraint
-- The default constraint name for CHECK (role IN (...)) is typically users_role_check
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add the new CHECK constraint with correct roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('client', 'owner', 'admin'));

-- Step 4: Update the role default value if it exists (optional, for consistency)
-- This ensures new users get 'client' as default, matching application logic
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'client';
