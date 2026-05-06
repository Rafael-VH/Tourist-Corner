-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  total_price numeric NOT NULL DEFAULT 0,
  guest_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS: managers can view reservations for their hotels
DROP POLICY IF EXISTS "Managers can view reservations" ON public.reservations;
CREATE POLICY "Managers can view reservations" ON public.reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id AND h.manager_id = auth.uid()
    )
  );

-- RLS: managers can update reservations for their hotels
DROP POLICY IF EXISTS "Managers can update reservations" ON public.reservations;
CREATE POLICY "Managers can update reservations" ON public.reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.hotels h ON h.id = r.hotel_id
      WHERE r.id = reservations.room_id AND h.manager_id = auth.uid()
    )
  );

-- RLS: clients can insert their own reservations
DROP POLICY IF EXISTS "Clients can insert reservations" ON public.reservations;
CREATE POLICY "Clients can insert reservations" ON public.reservations
  FOR INSERT WITH CHECK (true);

-- RLS: clients can view their own reservations
DROP POLICY IF EXISTS "Clients can view own reservations" ON public.reservations;
CREATE POLICY "Clients can view own reservations" ON public.reservations
  FOR SELECT USING (true);

-- RLS: admin can do everything
DROP POLICY IF EXISTS "Admin can manage all reservations" ON public.reservations;
CREATE POLICY "Admin can manage all reservations" ON public.reservations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
