-- Create storage buckets for hotel and room images
DO $$
BEGIN
  -- Create hotel-images bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'hotel-images',
    'hotel-images',
    true,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create room-images bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'room-images',
    'room-images',
    true,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;

  -- RLS policies for hotel-images
  DROP POLICY IF EXISTS "Public can view hotel images" ON storage.objects;
  CREATE POLICY "Public can view hotel images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'hotel-images');

  DROP POLICY IF EXISTS "Authenticated users can upload hotel images" ON storage.objects;
  CREATE POLICY "Authenticated users can upload hotel images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'hotel-images' AND
      auth.role() = 'authenticated'
    );

  DROP POLICY IF EXISTS "Hotel managers can delete their hotel images" ON storage.objects;
  CREATE POLICY "Hotel managers can delete their hotel images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'hotel-images' AND
      auth.role() = 'authenticated' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

  -- RLS policies for room-images
  DROP POLICY IF EXISTS "Public can view room images" ON storage.objects;
  CREATE POLICY "Public can view room images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'room-images');

  DROP POLICY IF EXISTS "Authenticated users can upload room images" ON storage.objects;
  CREATE POLICY "Authenticated users can upload room images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'room-images' AND
      auth.role() = 'authenticated'
    );

  DROP POLICY IF EXISTS "Hotel managers can delete their room images" ON storage.objects;
  CREATE POLICY "Hotel managers can delete their room images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'room-images' AND
      auth.role() = 'authenticated' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
END $$;
