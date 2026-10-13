-- 037: Vis "20 plasser igjen" (grønn) på alle åpne Padelcamp-kort i stedet for
-- "Åpen"-taggen, jf. 034. Setter kapasitet på Stord/Sotra og retter Bergen sin
-- status fra "Få plasser" til "Åpen" siden den faktisk har full kapasitet ledig
-- (20 av 20) — "Få plasser" tvang frem gul/sand-farge uavhengig av reelt antall.
-- Haugesund er fortsatt reelt utsolgt og beholder "Fullbooket"/"Utsolgt".

update public.trips
set status = 'Åpen'
where trip_type = 'Padelcamp' and start_date = '2027-04-06';

update public.trips
set max_participants = 20
where trip_type = 'Padelcamp' and start_date in ('2027-04-10', '2027-04-14');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, status, max_participants, registered_count
-- from public.trips where trip_type = 'Padelcamp' order by start_date;
