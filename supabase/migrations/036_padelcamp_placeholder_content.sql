-- 036: Placeholder-innhold (beskrivelse, program, inkludert, tilvalg, coacher, FAQ)
-- for de fire Padelcamp-turene til Albir april 2027 (se 034, 035).
-- Alt markert "Placeholder" her MÅ erstattes med endelig tekst før publisering/lansering.
-- Matcher på start_date + trip_type siden turnavnene er endret i admin siden 034.

update public.trips
set
  description = 'Placeholder: kort intro til turen — stemning, destinasjon og hvorfor man bør bli med. Erstattes med endelig tekst før lansering.',
  program = 'Dag 1: Ankomst og innsjekk
Placeholder: ankomst på hotellet, velkomstmiddag og en lett økt for å bli kjent med banene.

Dag 2: Padel og coaching
Placeholder: full dag med coaching og spill, tilpasset nivå.

Dag 3: Fritid og padel
Placeholder: valgfri aktivitet på formiddagen, padel og sosialt på kvelden.

Dag 4: Turnering
Placeholder: avsluttende mexicano-turnering med premiering.

Dag 5: Hjemreise
Placeholder: utsjekk og transport til flyplass.',
  included = ARRAY[
    'Placeholder: hotell med frokost',
    'Placeholder: daglig baneleie',
    'Placeholder: coaching',
    'Placeholder: transport til/fra flyplass'
  ],
  extras = '[
    {"name":"Placeholder: Enkeltrom-tillegg","price_eur":0,"description":"Placeholder-tekst for tilvalg"},
    {"name":"Placeholder: Ekstra coaching-økt","price_eur":0,"description":"Placeholder-tekst for tilvalg"}
  ]'::json,
  coaches = '[
    {"name":"Placeholder-navn","title":"Placeholder-tittel","bio":"Placeholder: kort bio om coachen."}
  ]'::json,
  faq = '[
    {"question":"Placeholder-spørsmål 1?","answer":"Placeholder-svar."},
    {"question":"Placeholder-spørsmål 2?","answer":"Placeholder-svar."}
  ]'::json
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, description, program, included, extras, coaches, faq
-- from public.trips where trip_type = 'Padelcamp' order by start_date;
