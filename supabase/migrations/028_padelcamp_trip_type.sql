-- 028: Ny turtype "Padelcamp" (ønsket av Ida for de nye klubb-/camp-turene
-- til Albir våren 2027 — vises som overline "PADELCAMP" på turkortet).
--
-- OBS til Mikkel: denne branchen (design/reise-community-forside) ble startet
-- før 023–027 (artikler/nyhetsbrev) kom inn på main. Sjekk at 028 fortsatt er
-- ledig nummer når denne merges — gi den heller et senere nummer enn å la den
-- kollidere med noe som er kommet til i mellomtiden.

alter table public.trips drop constraint trips_trip_type_check;
alter table public.trips add constraint trips_trip_type_check
  check (trip_type in ('Åpen tur','Klubbtur','Privat','Bedrift','Padelcamp'));

-- ── Verifisering (kjør som admin etterpå) ───────────────────────────────────
-- insert into public.trips (name, destination, start_date, end_date, price_double_eur, deposit_eur, trip_type, status, published)
--   values ('[TEST] Padelcamp-sjekk', 'Albir, Costa Blanca', '2027-04-06', '2027-04-10', 950, 300, 'Padelcamp', 'Utkast', false);
-- select trip_type from public.trips where name = '[TEST] Padelcamp-sjekk';
-- delete from public.trips where name = '[TEST] Padelcamp-sjekk';
