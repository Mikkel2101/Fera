-- Migration 019: Forby anonym booking-spam
-- Bytt bookings INSERT policy fra with check (true) til with check (auth.uid() is not null)
-- Service role bypasser RLS uansett, så booking-API-en er upåvirket.

ALTER POLICY "bookings: alle kan opprette" ON public.bookings
  WITH CHECK (auth.uid() IS NOT NULL);
