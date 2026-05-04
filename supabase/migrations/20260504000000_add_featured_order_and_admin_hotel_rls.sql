-- Add featured_order column to featured_hotels for ordering
ALTER TABLE public.featured_hotels ADD COLUMN IF NOT EXISTS featured_order int NOT NULL DEFAULT 0;

-- Create index for faster ordering
CREATE INDEX IF NOT EXISTS idx_featured_hotels_order ON public.featured_hotels(featured_order);

-- Add admin bypass policy for hotels (admins need to view/edit all hotels)
DROP POLICY IF EXISTS "hotels_select_admin" ON public.hotels;
CREATE POLICY "hotels_select_admin" ON public.hotels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "hotels_update_admin" ON public.hotels;
CREATE POLICY "hotels_update_admin" ON public.hotels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "hotels_delete_admin" ON public.hotels;
CREATE POLICY "hotels_delete_admin" ON public.hotels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
