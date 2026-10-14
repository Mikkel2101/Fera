-- 051: Synkroniserer FAQ på tvers av alle turer. Haugesund, Padelreise Klubb
-- og Sotra Padelklubb hadde fortsatt placeholder-FAQ fra 036 — de får nå
-- samme spørsmål/svar som Padelreise Bergen (satt i 041), slik at alle
-- publiserte turer viser identisk FAQ inntil turene får egne svar.

update public.trips
set faq = '[
  {"question":"Er coaching inkludert i de 15 timene?","answer":"Ja. Du får minimum 15 timer padel totalt, og minimum 5 av disse timene er coaching. Tillater ankomst- og avreisetidene mer coaching, legger vi opp til det."},
  {"question":"Hvor ligger padelbanene?","answer":"Banene ligger på hotellet, i gangavstand fra rommet ditt. Anlegget har syv baner av høy standard, inkludert en spektakulær centercourt."},
  {"question":"Kan jeg dele rom med en venn?","answer":"Ja. Oppgi hvem du ønsker å dele rom med når du reserverer. Reiser du alene og ønsker delt rom, hjelper vi deg med romfordelingen."},
  {"question":"Kan jeg få enkeltrom?","answer":"Ja. Enkeltrom tilbys mot et tillegg på 300 euro for hele oppholdet, avhengig av tilgjengelighet."},
  {"question":"Er fly inkludert?","answer":"Nei. Du bestiller og betaler flyreisen selv. Ta gjerne kontakt med oss før bestilling for å avklare flytider opp mot fellestransporten."},
  {"question":"Må jeg være med på alt?","answer":"Du velger selv hvor mye du ønsker å delta. Vil du stå over en økt, spise et annet sted eller bruke litt tid på egen hånd, gir du bare beskjed til reiselederne. Det skal være rom for å nyte ferien på din måte."},
  {"question":"Er reservasjonen bindende?","answer":"Du kan reservere plass uten å betale nå. Vi tar kontakt med mer informasjon om reisen, betaling og vilkår før du bekrefter en bindende bestilling."}
]'::json
where trip_type = 'Padelcamp';

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, faq from public.trips where trip_type = 'Padelcamp' order by name;
