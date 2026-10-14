-- Migration 046: Hoodie som tillegg på Padelcamp-turene i Albir april 2027.
-- extras ble tømt i 044 (fjernet placeholder-tillegg). Legger til hoodien
-- med lanseringstilbud (40 EUR normalpris, 30 EUR ved kjøp nå) og
-- størrelser, slik booking-skjemaet nå støtter (se lib/booking/extras.ts).

update public.trips
set extras = '[
  {
    "name": "FERA Hoodie",
    "price_eur": 30,
    "original_price_eur": 40,
    "description": "Lanseringstilbud – 25 % rabatt",
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "max_quantity": 3
  }
]'::jsonb
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, extras from public.trips where trip_type = 'Padelcamp' order by start_date;
