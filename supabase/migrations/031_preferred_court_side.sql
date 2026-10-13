-- Migration 031: Foretrukket banehalvdel på spillerprofilen
-- Trenerne bruker den til å sette sammen par. Lagres på users (som en
-- egenskap ved spilleren), fylles inn fra profilen i bookingskjemaet og
-- vises i admin og CSV via bookings.user_id. Valgfritt felt.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_side text
    CHECK (preferred_side IN ('venstre', 'hoyre', 'begge'));
