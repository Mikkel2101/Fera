-- 043: Setter hotellnavn for de fire Padelcamp-turene til Albir april 2027.
-- Flyplass (Alicante) og distrikt (Costa Blanca) er like for alle fire og
-- vises derfor som fast tekst i TripBookingCard, ikke egne kolonner.

update public.trips
set hotel = 'Melia Villaitana'
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, hotel from public.trips where trip_type = 'Padelcamp' order by start_date;
