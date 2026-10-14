-- 039: Erstatter placeholder "included"-listen fra 036 med ekte innhold
-- for de fire Padelcamp-turene til Albir april 2027.

update public.trips
set included = ARRAY[
  'Hotell med frokost og delt dobbeltrom',
  '15+ timer padel, inkl. 5 timer coaching',
  'Organisert spill og turneringer med lokale spillere',
  'To fellesmiddager på utvalgte restauranter',
  'Felles transport til og fra flyplass og hotell',
  'Personlig oppfølging fra FERAs reiseledere'
]
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, included from public.trips where trip_type = 'Padelcamp' order by start_date;
