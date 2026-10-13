-- 032: Ny tekst og overskrifter for «Derfor elsker vi Costa Blanca», fra Ida.
-- Erstatter hele brødteksten med seks seksjoner (hver med egen underoverskrift)
-- i stedet for løpende avsnitt uten struktur.

update public.articles
set
  title = 'FERA – padel, sol og folk du vil møte igjen',
  content = $json${"type":"doc","content":[
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Det startet med én padelreise"}]},
    {"type":"paragraph","content":[{"type":"text","text":"FERA startet med en padelklubb hjemme i Norge som ønsket hjelp til å reise på tur. Etter den første turen var vi solgt. Spillet, samholdet og gleden hos deltakerne ga oss lyst til å gjøre det igjen. Og igjen. Det fineste var å se hvor fort folk fant hverandre. Hvordan en gjeng som knapt kjente hverandre ved ankomst, reiste hjem med interne vitser, nye spillepartnere og planer om neste tur. Det var noe helt eget med den stemningen, og vi skjønte raskt at dette var mer enn bare en padelreise."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Den følelsen vil vi at du også skal få."}]},

    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Et fellesskap med plass til alle"}]},
    {"type":"paragraph","content":[{"type":"text","text":"Du kan komme alene, med en venn eller sammen med hele klubben. Hos oss skal du bli møtt med et smil, bli sett og føle deg velkommen fra første øyeblikk. Vi vil at du skal ha det skikkelig gøy på banen, kjenne på mestring og reise hjem med flere relasjoner enn du kom med. For oss handler padelreisene like mye om menneskene du møter som kampene du spiller."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Vi liker å bli kjent med folk. Høre historiene deres, dele et måltid og finne ut hva som gjør turen god for akkurat dem. Noen vil utfordres på banen og utvikle spillet sitt. Andre vil finne tilbake til spillegleden eller bare nyte noen aktive dager i godt selskap. Det skal være rom for begge deler. Vi tar oss tid til å følge opp, inkludere og legge til rette for at alle skal trives, både på og utenfor banen."}]},

    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Costa Blanca – vår favoritt langs Middelhavet"}]},
    {"type":"paragraph","content":[{"type":"text","text":"Og vi har funnet et ganske fint sted å gjøre det."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Costa Blanca har en kombinasjon vi elsker: flotte hoteller, gode padelanlegg, kystbyer med særpreg og matopplevelser det er verdt å sette av en hel kveld til. Vi kjenner området godt og bruker lokalkunnskapen vår til å sette sammen turer der det er enkelt å være gjest. Fra du lander, skal du kunne senke skuldrene og glede deg til dagene som venter. Vi tar oss av det praktiske, slik at du kan bruke tiden på det du faktisk kom for."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Du blir hentet med buss og kjørt til hotellet. På hotelloppleggene våre med baner under 200 meter unna er veien kort fra frokostbordet til første ballveksling. Det gir mer tid til å spille, slappe av og nyte dagene sammen. Og når racketen legges bort, er det mye å oppleve. En kort taxitur unna venter Altea, med det som etter vår mening er en av Spanias vakreste gamlebyer. Hvite hus, brosteinsgater og små steder du får lyst til å stoppe ved. En kveld her, med god mat på en takterrasse og utsikt over Middelhavet, kan fort bli et av minnene du tar med deg hjem."}]},

    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Den spanske padelkulturen må oppleves"}]},
    {"type":"paragraph","content":[{"type":"text","text":"Noe av det vi liker aller best med Costa Blanca, er padelkulturen. Her er padelsenteret en møteplass fra morgen til kveld. Folk kommer for å spille, treffe venner og bli værende litt til. Det er musikk, samtaler og liv rundt banene. En kald øl, et glass vin eller en brus etter kampen. Noen følger med på spillet, andre avtaler neste match. Det sosiale er en like naturlig del av opplevelsen som selve padelen."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Vi elsker den stemningen og vil at du skal få oppleve den fra innsiden. FERA skal samle det beste fra spansk og norsk padelkultur. Den avslappede, sosiale atmosfæren vi kjenner fra Spania, kombinert med samholdet og engasjementet fra klubbmiljøene hjemme. Vi vil skape et fellesskap du har lyst til å komme tilbake til, og som fortsetter når turen er over. Med nye venner, flere å spille med og noe å glede seg til."}]},

    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Gjennomført i detaljene. Personlig hele veien."}]},
    {"type":"paragraph","content":[{"type":"text","text":"For oss er det viktig at en reise med FERA føles gjennomført fra start til slutt. Gode hoteller, flotte padelanlegg, god organisering og omtanke i detaljene. Vi ønsker at du skal oppleve det lille ekstra, samtidig som stemningen er avslappet og inkluderende. Det skal føles eksklusivt, men aldri upersonlig. Du skal kjenne at det er mennesker bak opplevelsen som faktisk bryr seg om hvordan du har det."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Vi har også større ambisjoner for fellesskapet vi bygger. På sikt ønsker vi å gjøre padel tilgjengelig for flere – barn, mennesker med funksjonsnedsettelser og dem som har mindre økonomisk spillerom. Vi tror på verdien av å være en del av noe, og ønsker at enda flere skal få oppleve gleden ved sporten og menneskene rundt den. Det er noe vi vil jobbe mot etter hvert som FERA vokser."}]},

    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Det beste er når vi møtes igjen"}]},
    {"type":"paragraph","content":[{"type":"text","text":"Det er fortsatt klemmene på avreisedagen som treffer oss mest. Når folk som var fremmede for hverandre noen dager tidligere, står og utveksler telefonnumre, snakker om neste tur og allerede gleder seg til å møtes igjen. Når noen takker for opplevelsen og sier at de skal være med neste gang, får vi gåsehud."}]},
    {"type":"paragraph","content":[{"type":"text","text":"For oss er det akkurat dette FERA handler om. Gode opplevelser, ekte møter og minner som varer litt lenger enn selve reisen. Vi håper du reiser hjem med et smil, noen nye venner og lyst til å gjøre det hele igjen."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Velkommen til FERA. Vi gleder oss til å få deg med!"}]}
  ]}$json$::jsonb
where slug = 'derfor-elsker-vi-costa-blanca';

-- ── Verifisering (kjør som admin etterpå) ───────────────────────────────────
-- select title, jsonb_array_length(content->'content') from public.articles where slug = 'derfor-elsker-vi-costa-blanca';
