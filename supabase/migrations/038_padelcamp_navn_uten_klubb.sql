-- 038: Fjerner klubbnavn-prefiks fra overskriftene på to av Padelcamp-turene
-- (jf. 034/036 — klubbsamarbeidene er ikke klare for offentliggjøring ennå).
-- Matcher på start_date + trip_type siden de opprinnelige navnene kom fra 034.

update public.trips
set name = 'Padelreise Bergen'
where trip_type = 'Padelcamp' and start_date = '2027-04-06';

update public.trips
set name = 'Padelreise Klubb'
where trip_type = 'Padelcamp' and start_date = '2027-04-10';

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date from public.trips where trip_type = 'Padelcamp' order by start_date;
