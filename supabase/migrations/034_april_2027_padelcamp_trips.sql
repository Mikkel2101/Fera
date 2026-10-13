-- 034: Legg inn de fire Padelcamp-turene til Albir april 2027 (avtalt med Ida
-- 2026-10-13), og avpubliser de 7 eksisterende demoturene slik at kun disse
-- fire vises på /travels og forsiden.
--
-- OBS til Mikkel: forutsetter at 028 (Padelcamp som gyldig trip_type) er kjørt.

insert into public.trips
  (name, destination, start_date, end_date, price_double_eur, deposit_eur, trip_type, status, max_participants, published)
values
  ('Interpadel - Padelreise Bergen', 'Albir, Costa Blanca', '2027-04-06', '2027-04-10', 950, 300, 'Padelcamp', 'Få plasser', 20,   true),
  ('Stord Padel - Padelreise Klubb', 'Albir, Costa Blanca', '2027-04-10', '2027-04-14', 950, 300, 'Padelcamp', 'Åpen',       null, true),
  ('Sotra Padelklubb',               'Albir, Costa Blanca', '2027-04-14', '2027-04-18', 950, 300, 'Padelcamp', 'Åpen',       null, true),
  ('Haugesund',                      'Albir, Costa Blanca', '2027-04-17', '2027-04-21', 950, 300, 'Padelcamp', 'Fullbooket', null, true);

update public.trips
set published = false
where name in (
  'Costa Blanca High Agosto 2026',
  'Marbella Padel Experience September',
  'Høst i Alicante Oktober 2026',
  'Bedriftstur — Skreddersydd Costa Blanca',
  'Costa Blanca Camp – Påske 2027',
  'Costa Blanca Open – September 2027',
  'Gran Canaria Vinter Camp 2028'
);

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, trip_type, status, published from public.trips order by start_date;
