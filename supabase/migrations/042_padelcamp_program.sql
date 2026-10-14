-- 042: Erstatter placeholder "program" fra 036 med ekte dag-for-dag-tekst
-- for de fire Padelcamp-turene til Albir april 2027.

update public.trips
set program = 'Dag 1 – Ankomst & innsjekk
Transport til hotellet, etterfulgt av velkomst og gjennomgang av programmet. Avhengig av ankomsttid blir det mulighet for padelspill før vi samles til en inkludert velkomstmiddag.

Dag 2 – Coaching og spilleglede
Nivåtilpasset coaching, etterfulgt av lunsj, avslapning og mer padel på ettermiddagen. Kvelden avsluttes med middag på en takterrasse i vakre Altea, med utsikt over hav og fjell.

Dag 3 – Padel og tid til å nyte
Vi fortsetter med trening og padelspill, med tid til avslapning og utforsking mellom øktene. Dagen byr ofte på showkamp, før vi nyter middag på en av hotellets restauranter.

Dag 4 – Kamper og sosial avslutning
Dagen byr på padeltrening og turnering eller landskamp mot lokale spillere. På kvelden samles vi til en stemningsfull grillmiddag som en hyggelig avslutning på dagene sammen.

Dag 5 – Hjemreise
Nyt en rolig frokost før utsjekk, med mulighet for en siste padeløkt dersom tiden tillater det. Programmet tilpasses gruppen og reisetidene for å få mest mulig ut av oppholdet.'
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, program from public.trips where trip_type = 'Padelcamp' order by start_date;
