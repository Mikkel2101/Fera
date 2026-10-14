-- 047: Fjerner "Albir" fra introteksten satt i 040 — turene markedsføres
-- bare som Costa Blanca, ikke det spesifikke stedsnavnet Albir.

update public.trips
set description = 'Bli med FERA til solfylte Costa Blanca! Her kombinerer vi padel, coaching og sosialt fellesskap med komfortabel overnatting og ekte spansk atmosfære. Gled deg til aktive dager på banen, gode måltider og nye bekjentskaper – enten du reiser alene eller sammen med andre.'
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, description from public.trips where trip_type = 'Padelcamp' order by start_date;
