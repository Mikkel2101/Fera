-- 030: Oppdaterer «Derfor elsker vi Costa Blanca» med ny tittel og tekst fra Ida.
-- Artikkelen ble skrevet om før branchen ble rebaset til databasedrevne
-- artikler (migrasjon 023/024), så innholdet må oppdateres i raden i stedet
-- for i kode.

update public.articles
set
  title = 'FERA - padel, sol og folk du vil møte igjen',
  excerpt = 'Det er morgen på Costa Blanca, og padelbanene venter. Dette er historien om hvorfor FERA finnes, og hvorfor vi fortsatt får gåsehud på avreisedagen.',
  meta_description = 'Les historien bak FERA — hvordan det startet, hvorfor vi elsker Costa Blanca, og fellesskapet vi ønsker å bygge rundt padel og reise.',
  author_name = 'Petter Skimmeland',
  content = $json${"type":"doc","content":[
    {"type":"paragraph","content":[{"type":"text","text":"Det er morgen på Costa Blanca. Solen varmer allerede, og en kort spasertur fra hotellet venter padelbanene. Du møter kjente ansikter, finner fram racketen og gjør deg klar for dagens første økt. Rundt deg er det liv, latter og lyden av baller som treffer glasset."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Det er dette vi vil dele med deg."}]},
    {"type":"paragraph","content":[{"type":"text","text":"FERA startet med en padelklubb hjemme i Norge som ønsket hjelp til å reise på tur. Etter den første turen var vi solgt. Spillet, samholdet og gleden hos deltakerne ga oss lyst til å gjøre det igjen. Og igjen."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Det fineste var å se hvor fort folk fant hverandre. Hvordan en gjeng som knapt kjente hverandre ved ankomst, reiste hjem med interne vitser, nye spillepartnere og planer om neste tur."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Den følelsen vil vi at du også skal få."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Du kan komme alene, med en venn eller sammen med hele klubben. Hos oss skal du bli møtt med et smil, bli sett og føle deg velkommen fra første øyeblikk. Vi vil at du skal ha det skikkelig gøy på banen, kjenne på mestring og reise hjem med flere relasjoner enn du kom med."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Vi liker å bli kjent med folk. Høre historiene deres, dele et måltid og finne ut hva som gjør turen god for akkurat dem. Noen vil utfordres på banen. Andre vil finne tilbake til spillegleden eller nyte noen aktive dager i godt selskap. Vi tar oss tid til å følge opp og legge til rette for at alle skal trives."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Og vi har funnet et ganske fint sted å gjøre det."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Costa Blanca har en kombinasjon vi elsker: flotte hoteller, gode padelanlegg, kystbyer med særpreg og matopplevelser det er verdt å sette av en hel kveld til. Vi kjenner området godt og bruker lokalkunnskapen vår til å sette sammen turer der det er enkelt å være gjest."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Du blir hentet med buss og kjørt til hotellet. På hotelloppleggene våre med baner under 200 meter unna, er veien kort fra frokostbordet til første ballveksling. Det gir mer tid til å spille, slappe av og nyte dagene sammen."}]},
    {"type":"paragraph","content":[{"type":"text","text":"En kort taxitur unna venter Altea, med det som etter vår mening er en av Spanias vakreste gamlebyer. Hvite hus, brosteinsgater og små steder du får lyst til å stoppe ved. En kveld her, med god mat på en takterrasse og utsikt over Middelhavet, kan fort bli et av minnene du tar med deg hjem."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Så er det padelkulturen her nede."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Padelsenteret er en møteplass fra morgen til kveld. Folk kommer for å spille, treffe venner og bli værende litt til. Det er musikk, samtaler og liv rundt banene. En kald øl, et glass vin eller en brus etter kampen. Noen følger med på spillet, andre avtaler neste match. Vi elsker den stemningen – og vil at du skal få oppleve den fra innsiden."}]},
    {"type":"paragraph","content":[{"type":"text","text":"FERA skal samle det beste fra spansk og norsk padelkultur. Vi vil skape et fellesskap du har lyst til å komme tilbake til, og som fortsetter når turen er over. Med nye venner, flere å spille med og noe å glede seg til."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Samtidig skal alt som bærer FERA-navnet, være skikkelig gjennomført. Gode hoteller, god organisering og omtanke i detaljene. Opplevelsen skal kjennes både eksklusiv og personlig, med verter som bryr seg om hvordan du har det."}]},
    {"type":"paragraph","content":[{"type":"text","text":"På sikt ønsker vi også å gjøre padel tilgjengelig for flere – barn, mennesker med funksjonsnedsettelser og dem som har mindre økonomisk spillerom. Det er en del av fellesskapet vi ønsker å bygge, og noe vi vil jobbe mot når FERA vokser."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Det er fortsatt klemmene på avreisedagen som treffer oss mest. Når noen takker for turen og sier at de skal være med neste gang, får vi gåsehud. Da gleder vi oss allerede til gjensynet."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Velkommen til FERA, vi gleder oss til å få deg med!"}]}
  ]}$json$::jsonb
where slug = 'derfor-elsker-vi-costa-blanca';

-- ── Verifisering (kjør som admin etterpå) ───────────────────────────────────
-- select title, author_name from public.articles where slug = 'derfor-elsker-vi-costa-blanca';
