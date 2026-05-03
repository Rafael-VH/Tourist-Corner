-- Fix infinite recursion in hotels RLS policies
-- The problem: SELECT policy references hotels table in EXISTS subquery,
-- which triggers the same policy evaluation again -> infinite recursion
-- Solution: Use a SECURITY DEFINER function to bypass RLS for the subquery check

-- Function to get manager_id of a hotel without triggering RLS
CREATE OR REPLACE FUNCTION public.get_hotel_manager_id(hotel_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT manager_id FROM public.hotels WHERE id = hotel_id;
$$;

-- Recreate SELECT policy using the bypass function
DROP POLICY IF EXISTS "hotels_select_manager" ON public.hotels;
CREATE POLICY "hotels_select_manager" ON public.hotels
  FOR SELECT USING (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND public.get_hotel_manager_id(branch_of) = auth.uid()
    )
  );

-- Recreate INSERT policy using the bypass function
DROP POLICY IF EXISTS "hotels_insert_manager" ON public.hotels;
CREATE POLICY "hotels_insert_manager" ON public.hotels
  FOR INSERT WITH CHECK (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND public.get_hotel_manager_id(branch_of) = auth.uid()
    )
  );

-- Recreate UPDATE policy using the bypass function
DROP POLICY IF EXISTS "hotels_update_manager" ON public.hotels;
CREATE POLICY "hotels_update_manager" ON public.hotels
  FOR UPDATE USING (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND public.get_hotel_manager_id(branch_of) = auth.uid()
    )
  );

-- Recreate DELETE policy using the bypass function
DROP POLICY IF EXISTS "hotels_delete_manager" ON public.hotels;
CREATE POLICY "hotels_delete_manager" ON public.hotels
  FOR DELETE USING (
    auth.uid() = manager_id
    OR (
      branch_of IS NOT NULL
      AND public.get_hotel_manager_id(branch_of) = auth.uid()
    )
  );
