-- Migration: Add avatars storage bucket and fix client-related issues
-- Date: 2026-05-09
-- Description: Creates 'avatars' storage bucket, updates handle_new_user trigger default role,
--              adds missing RLS policies for avatar uploads.

-- ============================================================================
-- Section 1: Create avatars storage bucket
-- ============================================================================
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- Section 2: RLS policies for avatars bucket
-- ============================================================================

-- Anyone can view avatar images (bucket is public, but explicit policy)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Section 3: Fix handle_new_user trigger default role to 'client'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Section 4: Ensure reservations RLS allows owner/manager access via hotel
-- ============================================================================

-- Owners can view reservations for their hotels (via rooms -> hotels -> manager_id)
DROP POLICY IF EXISTS "Owners can view reservations for their hotels" ON public.reservations;
CREATE POLICY "Owners can view reservations for their hotels"
  ON public.reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id
      AND h.manager_id = auth.uid()
    )
  );

-- Owners can update reservations for their hotels
DROP POLICY IF EXISTS "Owners can update reservations for their hotels" ON public.reservations;
CREATE POLICY "Owners can update reservations for their hotels"
  ON public.reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id
      AND h.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id
      AND h.manager_id = auth.uid()
    )
  );
