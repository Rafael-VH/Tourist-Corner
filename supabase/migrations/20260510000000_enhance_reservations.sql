-- Migration: Enhance reservations with full lifecycle support
-- Date: 2026-05-06
-- Description: Adds new reservation states, check-in/out tracking,
--              cancellation policy fields, no-show support, and status history table.

-- ============================================================
-- Section 1: Extend reservation status CHECK constraint
-- ============================================================

-- Drop existing constraint (PostgreSQL auto-names CHECK constraints)
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_chk;

-- Add new constraint with extended states
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending', 'accepted', 'checked-in', 'checked-out', 'completed', 'cancelled', 'no-show'));

-- ============================================================
-- Section 2: Add new columns to reservations table
-- ============================================================

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS actual_check_in timestamptz,
  ADD COLUMN IF NOT EXISTS actual_check_out timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancellation_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS no_show_flag boolean DEFAULT false;

-- ============================================================
-- Section 3: Create reservation_status_history table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reservation_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES public.users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text
);

ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;

-- RLS: managers can view history for their hotels
CREATE POLICY "Managers can view status history"
  ON public.reservation_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      JOIN public.rooms rm ON rm.id = r.room_id
      JOIN public.hotels h ON h.id = rm.hotel_id
      WHERE r.id = reservation_status_history.reservation_id
        AND h.manager_id = auth.uid()
    )
  );

-- RLS: clients can view their own history
CREATE POLICY "Clients can view own status history"
  ON public.reservation_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_status_history.reservation_id
        AND r.user_id = auth.uid()
    )
  );

-- RLS: admin can manage all history
CREATE POLICY "Admin can manage all status history"
  ON public.reservation_status_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Section 4: Create trigger to auto-record status changes
-- ============================================================

CREATE OR REPLACE FUNCTION public.record_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.reservation_status_history (
      reservation_id,
      from_status,
      to_status,
      changed_by,
      changed_at,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      now(),
      CASE
        WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
        WHEN NEW.status = 'no-show' THEN 'Guest did not arrive'
        ELSE NULL
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservation_status_change ON public.reservations;
CREATE TRIGGER trg_reservation_status_change
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.record_reservation_status_change();

-- ============================================================
-- Section 5: Update RLS policies for new states
-- ============================================================

-- Drop old policies that may conflict
DROP POLICY IF EXISTS "Managers can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Owners can update reservations for their hotels" ON public.reservations;

-- Managers can update reservations for their hotels
CREATE POLICY "Managers can update reservations"
  ON public.reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id AND h.manager_id = auth.uid()
    )
  );

-- Owners can update reservations for their hotels
CREATE POLICY "Owners can update reservations for their hotels"
  ON public.reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id
        AND (h.manager_id = auth.uid() OR h.owner_id = auth.uid())
    )
  );

-- ============================================================
-- Section 6: Create index for status queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_room_status ON public.reservations(room_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in ON public.reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_reservation_status_history_reservation_id
  ON public.reservation_status_history(reservation_id);
