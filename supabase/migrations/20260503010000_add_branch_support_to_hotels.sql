-- Add branch support to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS branch_of uuid REFERENCES public.hotels(id);
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS is_main boolean NOT NULL DEFAULT false;

-- Set existing hotels as main
UPDATE public.hotels SET is_main = true WHERE branch_of IS NULL AND manager_id IS NOT NULL;

-- Update insert policy to allow branches
DROP POLICY IF EXISTS "hotels_insert_manager" ON public.hotels;
CREATE POLICY "hotels_insert_manager" ON public.hotels
  FOR INSERT WITH CHECK (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.hotels h
        WHERE h.id = branch_of AND h.manager_id = auth.uid()
      )
    )
  );

-- Update select policy for branches
DROP POLICY IF EXISTS "hotels_select_manager" ON public.hotels;
CREATE POLICY "hotels_select_manager" ON public.hotels
  FOR SELECT USING (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.hotels h
        WHERE h.id = branch_of AND h.manager_id = auth.uid()
      )
    )
  );

-- Update update policy for branches
DROP POLICY IF EXISTS "hotels_update_manager" ON public.hotels;
CREATE POLICY "hotels_update_manager" ON public.hotels
  FOR UPDATE USING (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.hotels h
        WHERE h.id = branch_of AND h.manager_id = auth.uid()
      )
    )
  );

-- Update delete policy for branches
DROP POLICY IF EXISTS "hotels_delete_manager" ON public.hotels;
CREATE POLICY "hotels_delete_manager" ON public.hotels
  FOR DELETE USING (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.hotels h
        WHERE h.id = branch_of AND h.manager_id = auth.uid()
      )
    )
  );
