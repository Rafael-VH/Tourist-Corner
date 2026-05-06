-- Migration: Add client features (support tickets, update RLS policies)
-- Date: 2026-05-09
-- Description: Creates support_tickets table, adds RLS policies for clients/owners/admins, updates existing RLS policies for users and reservations.

-- ============================================================================
-- Section 1: Create support_tickets table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Section 2: Enable RLS on support_tickets
-- ============================================================================
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Section 3: Create updated_at trigger for support_tickets
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Section 4: RLS Policies for support_tickets
-- ============================================================================

-- 4.1 Clients can insert their own tickets
CREATE POLICY IF NOT EXISTS "Clients can insert own support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 4.2 Clients can select their own tickets
CREATE POLICY IF NOT EXISTS "Clients can select own support tickets"
ON public.support_tickets
FOR SELECT
USING (user_id = auth.uid());

-- 4.3 Owners can select tickets for their hotels
CREATE POLICY IF NOT EXISTS "Owners can select hotel support tickets"
ON public.support_tickets
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.hotels
        WHERE hotels.id = support_tickets.hotel_id
        AND hotels.manager_id = auth.uid()
    )
);

-- 4.4 Owners can update status of tickets for their hotels
CREATE POLICY IF NOT EXISTS "Owners can update hotel support tickets"
ON public.support_tickets
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.hotels
        WHERE hotels.id = support_tickets.hotel_id
        AND hotels.manager_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.hotels
        WHERE hotels.id = support_tickets.hotel_id
        AND hotels.manager_id = auth.uid()
    )
);

-- 4.5 Admins have full access to all support tickets
CREATE POLICY IF NOT EXISTS "Admins have full access to support tickets"
ON public.support_tickets
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- ============================================================================
-- Section 5: Update RLS policies for users table
-- ============================================================================

-- Users can update their own profile (row-level; column restrictions enforced in app)
CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Section 6: Update RLS policies for reservations table
-- ============================================================================

-- Clients can select their own reservations
CREATE POLICY IF NOT EXISTS "Clients can select own reservations"
ON public.reservations
FOR SELECT
USING (user_id = auth.uid());

-- Clients can insert their own reservations
CREATE POLICY IF NOT EXISTS "Clients can insert own reservations"
ON public.reservations
FOR INSERT
WITH CHECK (user_id = auth.uid());
