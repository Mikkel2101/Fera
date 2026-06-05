-- Migration 003: Admin RLS-policies
-- Gir admin-brukere (role: admin i app_metadata) skrivetilgang til trips
-- og lesetilgang til alle bookinger og waitlist-rader.

-- trips: admin kan SELECT (inkl. upubliserte), INSERT, UPDATE, DELETE
CREATE POLICY IF NOT EXISTS "admin_trips_all"
  ON trips FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- bookings: admin kan lese alle bookinger (ikke bare egne)
CREATE POLICY IF NOT EXISTS "admin_bookings_read"
  ON bookings FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- waitlist: admin kan lese alle venteliste-rader
CREATE POLICY IF NOT EXISTS "admin_waitlist_read"
  ON waitlist FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
