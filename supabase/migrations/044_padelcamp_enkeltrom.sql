-- 044: Enkeltrompris og opprydding i tillegg for de fire Padelcamp-turene
-- til Albir april 2027.
--
-- Turdetaljsiden lover enkeltrom for +300 EUR (1 250 EUR totalt), men
-- price_single_eur var ikke satt, så bookingflyten viste ikke noe
-- enkeltromstillegg. Placeholder-tilleggene fra 036 (inkl. «Enkeltrom-
-- tillegg» til 0 EUR) fjernes — romvalget + price_single_eur dekker
-- enkeltrom, og ingen bookinger hadde valgt dem.

update public.trips
set price_single_eur = 1250,
    extras = '[]'::jsonb
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, price_double_eur, price_single_eur, extras from public.trips where trip_type = 'Padelcamp' order by start_date;
