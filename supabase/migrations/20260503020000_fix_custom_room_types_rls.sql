-- Fix custom_room_types RLS: only owner who created it can see/use it
DROP POLICY IF EXISTS "Public can view custom room types" ON public.custom_room_types;
DROP POLICY IF EXISTS "Owners can manage their custom room types" ON public.custom_room_types;
DROP POLICY IF EXISTS "Owners can view own custom room types" ON public.custom_room_types;
DROP POLICY IF EXISTS "Owners can insert custom room types" ON public.custom_room_types;
DROP POLICY IF EXISTS "Owners can update own custom room types" ON public.custom_room_types;
DROP POLICY IF EXISTS "Owners can delete own custom room types" ON public.custom_room_types;

CREATE POLICY "Owners can view own custom room types" ON public.custom_room_types
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Owners can insert custom room types" ON public.custom_room_types
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update own custom room types" ON public.custom_room_types
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Owners can delete own custom room types" ON public.custom_room_types
  FOR DELETE USING (created_by = auth.uid());

-- Add FK for created_by so embedded queries work
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_custom_room_types_created_by'
  ) THEN
    ALTER TABLE public.custom_room_types ADD CONSTRAINT fk_custom_room_types_created_by
      FOREIGN KEY (created_by) REFERENCES public.users(id);
  END IF;
END $$;

-- Add reference to custom room types in rooms table
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS custom_room_type_id uuid REFERENCES public.custom_room_types(id) ON DELETE SET NULL;
