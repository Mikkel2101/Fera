-- Demo trips for site showcase (Padelpoint meeting 2026-06-11)
-- Run this in Supabase SQL editor if trips table is empty

INSERT INTO public.trips (
  name, destination, hotel, start_date, end_date,
  price_double_eur, price_single_eur, deposit_eur,
  early_bird_price_double, early_bird_deadline,
  max_participants, registered_count,
  status, trip_type,
  description, included, not_included, extras, coaches, faq,
  main_image, gallery_images, published
)
VALUES
(
  'Costa Blanca High Agosto 2026',
  'Albir, Costa Blanca',
  'Hotel Albir Playa',
  '2026-08-08',
  '2026-08-13',
  1295,
  1595,
  250,
  1195,
  '2026-07-01',
  16,
  6,
  'Åpen',
  'Åpen tur',
  'Bli med på Feras mest populære sommertur til Costa Blanca. 5 dager, 4 netter — padel fra morgen til kveld kombinert med spansk sol, god mat og et sosialt miljø i verdensklasse. Albir er kjent som «padelhovedstaden» på Costa Blanca med over 40 utendørsbaner i gangavstand fra hotellet.',
  ARRAY[
    'Hotell med frokost (4 netter)',
    'Daglig baneleie (4 timer per dag)',
    'Coaching av André Schlyter',
    'Mexicano-turnering med premier',
    'Lokal transport mellom hotell og baner',
    'Velkomstmiddag',
    'Fera-logo bagasjelapp'
  ],
  ARRAY[
    'Fly (bookes separat)',
    'Lunsj og kveldsmåltider (unntatt velkomstmiddag)',
    'Reiseforsikring'
  ],
  '[{"name":"Golftur (18 hull)","price_eur":75,"description":"Spill på en av Costas flotteste baner"},{"name":"Båttur med middag","price_eur":95,"description":"Dagstur til sjøs med snorkling og middag om bord"},{"name":"Enkeltrom-tillegg","price_eur":300,"description":"Eget rom hele turen"}]'::json,
  '[{"name":"André Schlyter","title":"Head Coach","bio":"André er en av Sveriges mest anerkjente padeltrenere. Tidligere baneeier i Sverige og Spania med bakgrunn fra toppnivå-coaching. Hans coaching er teknisk, motiverende og alltid med et glimt i øyet.","image":"/Andre_S.jpg"},{"name":"Petter Skimmeland","title":"Turguide & Host","bio":"Petter er grunnleggeren av Fera og din trygge guide gjennom hele turen. Han kjenner Albir-området som sin egen lomme og sørger for at alle fra dag én føler seg hjemme.","image":"/Petter_Skimmeland.jpg"}]'::json,
  '[{"question":"Hva er tidspunktet for avreise og hjemkomst?","answer":"Vi anbefaler ankomst lørdag 8. august ettermiddag. Siste banetime er onsdag 12. august. De fleste flyr hjem torsdag 13. august."},{"question":"Hva er ferdighetsnivå på gruppen?","answer":"Turen er åpen for alle nivåer fra nybegynner til avansert. Vi deler inn i jevnbyrdige grupper slik at alle utvikler seg og koser seg."},{"question":"Er det mulig å bestille dobbeltrom med spesifikk romkamerat?","answer":"Absolutt. Skriv navnet på ønsket romkamerat i meldingsfeltet under booking — vi koordinerer dette manuelt."}]'::json,
  'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1200&q=80',
  ARRAY['https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80','https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80'],
  true
),
(
  'Marbella Padel Experience September',
  'Marbella, Costa del Sol',
  'Marriott Marbella Beach Resort',
  '2026-09-12',
  '2026-09-17',
  1495,
  1895,
  250,
  null,
  null,
  12,
  3,
  'Åpen',
  'Åpen tur',
  'Marbella er Spanias mest glamorøse padeldestinasjon. Eksklusive baner, toppaklasse hotell og en atmosfære som skiller seg ut. Denne turen kombinerer seriøs padel med det aller beste Marbella har å tilby av mat, kultur og sosialt liv.',
  ARRAY[
    'Hotell Marriott med frokost (4 netter)',
    'Baneleie premium-anlegg (4 timer per dag)',
    'Coaching av André Schlyter',
    'Velkomstmiddag på topprestaurant',
    'Pooldag på hotellet',
    'Lokal transport'
  ],
  ARRAY[
    'Fly (bookes separat)',
    'Lunsj og kveldsmåltider (unntatt velkomstmiddag)',
    'Reiseforsikring'
  ],
  '[{"name":"Spa-dag","price_eur":89,"description":"Full dag spa og velvære på hotellet"},{"name":"Golftur La Quinta","price_eur":120,"description":"Golf på en av Marbellas mest prestisjefylte baner"}]'::json,
  '[{"name":"André Schlyter","title":"Head Coach","bio":"André er en av Sveriges mest anerkjente padeltrenere med bakgrunn fra toppnivå-coaching. Hans smittende entusiasme og faglige dybde gjør ham unik som coach.","image":"/Andre_S.jpg"}]'::json,
  '[{"question":"Hvem passer denne turen for?","answer":"Alle spillere fra nybegynner til avansert. Marbella-turen er noe mer eksklusiv og har plass til færre deltakere, noe som gir mer individuell oppfølging."},{"question":"Kan vi bestille ekstra netter på hotellet?","answer":"Ja, Marriott Marbella kan arrangere ekstra overnattinger til en spesialpris for Fera-gjester. Ta kontakt så ordner vi dette."}]'::json,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  ARRAY['https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=800&q=80'],
  true
),
(
  'Høst i Alicante Oktober 2026',
  'Alicante, Costa Blanca',
  'Meliá Alicante',
  '2026-10-03',
  '2026-10-08',
  1195,
  1495,
  250,
  1095,
  '2026-08-15',
  20,
  11,
  'Få plasser',
  'Åpen tur',
  'Høstens favoritttur! Oktober er den aller beste måneden på Costa Blanca — 26 grader, ingen turisthorder og perfekte padel-forhold. Alicante er en vakker historisk by med fantastiske baner, strender og restauranter.',
  ARRAY[
    'Hotell Meliá med frokost (4 netter)',
    'Baneleie (4 timer per dag)',
    'Coaching av André Schlyter',
    'Mexicano-turnering',
    'Bytur og tapas-kveld',
    'Lokal transport'
  ],
  ARRAY[
    'Fly (bookes separat)',
    'Lunsj og de fleste kveldsmåltider',
    'Reiseforsikring'
  ],
  '[{"name":"Tapas-kveld VIP","price_eur":55,"description":"Guidet tapas-tur med lokal vertskap gjennom Alicantes beste barer"},{"name":"Enkeltrom-tillegg","price_eur":280,"description":"Eget rom hele turen"}]'::json,
  '[{"name":"André Schlyter","title":"Head Coach","bio":"André er en av Sveriges mest anerkjente padeltrenere med bakgrunn fra toppnivå-coaching og landskamper på høyeste nivå.","image":"/Andre_S.jpg"},{"name":"Petter Skimmeland","title":"Host & Guide","bio":"Petter er grunnleggeren av Fera Travels og har arrangert over 100 reisende til Costa Blanca det siste året.","image":"/Petter_Skimmeland.jpg"}]'::json,
  '[{"question":"Hva skjer hvis turen er fullbooket?","answer":"Det er allerede få plasser igjen! Meld deg på ventelisten og vi gir deg beskjed umiddelbart hvis en plass blir ledig."}]'::json,
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80',
  ARRAY[]::text[],
  true
),
(
  'Bedriftstur — Skreddersydd Costa Blanca',
  'Albir, Costa Blanca',
  'Etter avtale',
  '2026-11-07',
  '2026-11-12',
  1495,
  null,
  500,
  null,
  null,
  30,
  0,
  'Åpen',
  'Bedrift',
  'Ta med bedriften på en tur som skiller seg ut. Vi skreddersyr alt fra program til overnatting og aktiviteter etter deres ønsker og budsjett. Kontakt oss for et uforpliktende tilbud.',
  ARRAY[
    'Hotell etter avtale',
    'Baneleie og coaching',
    'Team-building aktiviteter',
    'Felles middager',
    'Lokal transport',
    'Full koordinering og guide'
  ],
  ARRAY[
    'Fly (bookes av bedriften separat)',
    'Personlige utgifter'
  ],
  '[]'::json,
  '[{"name":"André Schlyter","title":"Head Coach","bio":"André leverer profesjonell coaching tilpasset alle nivåer, og er ekspert på å skape en god stemning i gruppen fra første dag.","image":"/Andre_S.jpg"}]'::json,
  '[{"question":"Hvor mange kan være med?","answer":"Vi håndterer grupper fra 8 til 30 deltakere komfortabelt. For grupper over 30 kontakt oss for å diskutere alternativer."},{"question":"Hva koster en bedriftstur?","answer":"Pris beregnes etter antall deltakere, destinasjon, standard og aktivitetsmix. Vi gir deg et detaljert og transparent tilbud uten skjulte kostnader."}]'::json,
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80',
  ARRAY[]::text[],
  true
)
ON CONFLICT DO NOTHING;
