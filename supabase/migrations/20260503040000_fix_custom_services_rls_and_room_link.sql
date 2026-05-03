-- Fix custom_services RLS: only owner who created it can see/use it
DROP POLICY IF EXISTS "Public can view custom services" ON public.custom_services;
DROP POLICY IF EXISTS "Owners can manage their custom services" ON public.custom_services;

CREATE POLICY "Owners can view own custom services" ON public.custom_services
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Owners can insert custom services" ON public.custom_services
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update own custom services" ON public.custom_services
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Owners can delete own custom services" ON public.custom_services
  FOR DELETE USING (created_by = auth.uid());

-- Create junction table to link rooms with custom services
CREATE TABLE IF NOT EXISTS public.room_custom_services (
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  custom_service_id uuid REFERENCES public.custom_services(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, custom_service_id)
);

ALTER TABLE public.room_custom_services ENABLE ROW LEVEL SECURITY;

-- RLS for room_custom_services: owner can manage services for their rooms
CREATE POLICY "Owners can view room custom services" ON public.room_custom_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = room_custom_services.room_id AND h.manager_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert room custom services" ON public.room_custom_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = room_custom_services.room_id AND h.manager_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete room custom services" ON public.room_custom_services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = room_custom_services.room_id AND h.manager_id = auth.uid()
    )
  );
