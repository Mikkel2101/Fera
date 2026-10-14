-- 048: Fjerner "Albir" fra destination-feltet (satt i 007 og 034) — turene
-- markedsføres bare som Costa Blanca, ikke det spesifikke stedsnavnet Albir.
-- Samme begrunnelse som 047, men for kolonnen som vises på turkortene.

update trips
set destination = 'Costa Blanca'
where destination = 'Albir, Costa Blanca';
