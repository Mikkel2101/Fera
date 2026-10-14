-- 040: Erstatter placeholder "description" fra 036 med ekte introtekst
-- for de fire Padelcamp-turene til Albir april 2027.

update public.trips
set description = 'Bli med FERA på en padelreise fylt med spill, coaching og gode opplevelser. Her kombinerer vi padel på flotte baner med komfortabel overnatting, spansk atmosfære og sosialt fellesskap. Enten du reiser alene eller sammen med andre, legger vi til rette for fine dager både på og utenfor banen.'
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, description from public.trips where trip_type = 'Padelcamp' order by start_date;
