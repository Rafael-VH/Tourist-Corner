-- ============================================================
-- TOURIST CORNER — Migration: Create centralized images table
-- Date: 2026-05-11
-- ============================================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Copia TODO este archivo y pegalo
-- 3. Dale click a "Run"
-- ============================================================

-- ============================================================================
-- Section 1: Create centralized images table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('hotel', 'room', 'user')),
  entity_id uuid NOT NULL,
  url text NOT NULL,
  storage_path text NOT NULL,
  bucket text NOT NULL,
  file_size int,
  width int,
  height int,
  mime_type text,
  is_cover boolean DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  uploaded_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_images_entity ON public.images(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_images_cover ON public.images(entity_type, entity_id, is_cover);
CREATE INDEX IF NOT EXISTS idx_images_storage_path ON public.images(storage_path);

-- ============================================================================
-- Section 2: Enable RLS
-- ============================================================================

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Section 3: RLS policies for images table
-- ============================================================================

DROP POLICY IF EXISTS "Public can view hotel and room images" ON public.images;
CREATE POLICY "Public can view hotel and room images"
  ON public.images FOR SELECT
  USING (entity_type IN ('hotel', 'room'));

DROP POLICY IF EXISTS "Users can view own user images" ON public.images;
CREATE POLICY "Users can view own user images"
  ON public.images FOR SELECT
  USING (entity_type = 'user' AND entity_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.images;
CREATE POLICY "Authenticated users can insert images"
  ON public.images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Managers can update hotel images" ON public.images;
CREATE POLICY "Managers can update hotel images"
  ON public.images FOR UPDATE
  USING (
    entity_type = 'hotel' AND
    EXISTS (
      SELECT 1 FROM public.hotels h
      WHERE h.id = images.entity_id AND h.manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can update room images" ON public.images;
CREATE POLICY "Managers can update room images"
  ON public.images FOR UPDATE
  USING (
    entity_type = 'room' AND
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = images.entity_id AND h.manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own user images" ON public.images;
CREATE POLICY "Users can update own user images"
  ON public.images FOR UPDATE
  USING (entity_type = 'user' AND entity_id = auth.uid());

DROP POLICY IF EXISTS "Managers can delete hotel images" ON public.images;
CREATE POLICY "Managers can delete hotel images"
  ON public.images FOR DELETE
  USING (
    entity_type = 'hotel' AND
    EXISTS (
      SELECT 1 FROM public.hotels h
      WHERE h.id = images.entity_id AND h.manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can delete room images" ON public.images;
CREATE POLICY "Managers can delete room images"
  ON public.images FOR DELETE
  USING (
    entity_type = 'room' AND
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = images.entity_id AND h.manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own user images" ON public.images;
CREATE POLICY "Users can delete own user images"
  ON public.images FOR DELETE
  USING (entity_type = 'user' AND entity_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to images" ON public.images;
CREATE POLICY "Admins have full access to images"
  ON public.images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- Section 4: Optimize storage bucket RLS policies
-- ============================================================================

DROP POLICY IF EXISTS "Hotel managers can delete their hotel images" ON storage.objects;
CREATE POLICY "Hotel managers can delete their hotel images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hotel-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.hotels h
      WHERE h.id = (storage.foldername(storage.objects.name))[1]::uuid AND h.manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Hotel managers can delete their room images" ON storage.objects;
CREATE POLICY "Hotel managers can delete their room images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'room-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = (storage.foldername(storage.objects.name))[1]::uuid AND h.manager_id = auth.uid()
    )
  );

-- ============================================================================
-- Section 5: Trigger to auto-cleanup storage on image delete
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_image_storage()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM storage.objects WHERE bucket_id = OLD.bucket AND name = OLD.storage_path;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cleanup_image_storage ON public.images;
CREATE TRIGGER trg_cleanup_image_storage
  AFTER DELETE ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_image_storage();
