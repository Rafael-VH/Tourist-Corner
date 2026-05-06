-- Fix featured_hotels table structure to match the expected schema
-- Current schema has hotel_id as PK, but we need id as PK and hotel_id as unique FK

-- Add id column if it doesn't exist
ALTER TABLE public.featured_hotels ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Set id as default for any existing rows that might have NULL
UPDATE public.featured_hotels SET id = gen_random_uuid() WHERE id IS NULL;

-- Make id NOT NULL
ALTER TABLE public.featured_hotels ALTER COLUMN id SET NOT NULL;

-- Add missing columns
ALTER TABLE public.featured_hotels ADD COLUMN IF NOT EXISTS featured_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.featured_hotels ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.featured_hotels ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- Rename created_at to created_at (keep as is, but ensure it exists)
-- Check if created_at exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'featured_hotels' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.featured_hotels ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Drop existing PK on hotel_id and recreate with id
ALTER TABLE public.featured_hotels DROP CONSTRAINT IF EXISTS featured_hotels_pkey;
ALTER TABLE public.featured_hotels ADD PRIMARY KEY (id);

-- Add unique constraint on hotel_id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'featured_hotels_hotel_id_key'
  ) THEN
    ALTER TABLE public.featured_hotels ADD CONSTRAINT featured_hotels_hotel_id_key UNIQUE (hotel_id);
  END IF;
END $$;

-- Ensure foreign key exists on hotel_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'featured_hotels_hotel_id_fkey'
  ) THEN
    ALTER TABLE public.featured_hotels ADD CONSTRAINT featured_hotels_hotel_id_fkey 
      FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on active column for faster queries
CREATE INDEX IF NOT EXISTS idx_featured_hotels_active ON public.featured_hotels(active) WHERE active = true;
