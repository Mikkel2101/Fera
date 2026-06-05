-- Admin RLS policies

-- trips: admin kan INSERT/UPDATE/DELETE
CREATE POLICY "admin_trips_write" ON trips
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- bookings: admin kan SELECT alle
CREATE POLICY "admin_bookings_read" ON bookings
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- waitlist: admin kan SELECT alle
CREATE POLICY "admin_waitlist_read" ON waitlist
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
