-- Add used_at column to registration_codes
ALTER TABLE public.registration_codes ADD COLUMN IF NOT EXISTS used_at timestamptz;

-- Add FK constraint for used_by so Supabase embedded relations work
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_registration_codes_used_by'
  ) THEN
    ALTER TABLE public.registration_codes
      ADD CONSTRAINT fk_registration_codes_used_by
      FOREIGN KEY (used_by) REFERENCES public.users(id);
  END IF;
END $$;

-- Fix orphaned registration code from before trigger fix
UPDATE public.registration_codes
SET used = true, used_by = '363ebee0-1f78-47d2-94f6-7e2cabe596e9', used_at = NOW()
WHERE code = '872810';
