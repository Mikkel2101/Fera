-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin can read subscribers" ON public.newsletter_subscribers
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text NOT NULL DEFAULT 'general',
  navn       text NOT NULL,
  epost      text NOT NULL,
  telefon    text,
  melding    text,
  extra_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read submissions" ON public.contact_submissions;
CREATE POLICY "Admin can read submissions" ON public.contact_submissions
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can insert submissions" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- More products (Bullpadel, Nox, Head, Wilson, Dunlop)
INSERT INTO public.products (name, slug, brand, category, price_eur, description, images, stock_status, padelpoint_url, published)
VALUES
  (
    'Bullpadel Vertex 04 CTR',
    'bullpadel-vertex-04-ctr',
    'Bullpadel',
    'racket',
    189.95,
    'Bullpadel Vertex 04 CTR er designet for offensive spillere som søker kraft og kontroll. Carbon Ctrl teknologi gir overlegen stivhet for maksimal kraft i hvert slag.',
    ARRAY['https://www.tiendapadelpoint.es/epages/ea5e63f9-5b2e-4a5f-8f8c-3736e5e66c1b.sf/es_ES/?ObjectPath=/Shops/ea5e63f9-5b2e-4a5f-8f8c-3736e5e66c1b/Products/23VRTXCTR&Locale=es_ES'],
    'in_stock',
    'https://www.tiendapadelpoint.es/bullpadel-vertex-04-ctr',
    true
  ),
  (
    'Bullpadel Hack 04 LTD',
    'bullpadel-hack-04-ltd',
    'Bullpadel',
    'racket',
    219.95,
    'Hack 04 LTD er en elite-racket i diamantform med Multiglass-teknologi. Perfekt for avanserte spillere som vil ha alt — kraft, kontroll og touch.',
    ARRAY[]::text[],
    'in_stock',
    'https://www.tiendapadelpoint.es/bullpadel-hack-04-ltd',
    true
  ),
  (
    'Nox AT10 Luxury Genius 18K',
    'nox-at10-luxury-genius-18k',
    'Nox',
    'racket',
    299.95,
    'Nox AT10 Luxury Genius 18K er Agustín Tapia sin signaturracket. 18K karbon-fiber-konstruksjon for ren kraft og presisjon på høyeste nivå.',
    ARRAY[]::text[],
    'low_stock',
    'https://www.tiendapadelpoint.es/nox-at10-luxury',
    true
  ),
  (
    'Nox ML10 Pro Cup 3K',
    'nox-ml10-pro-cup-3k',
    'Nox',
    'racket',
    239.95,
    'Nox ML10 Pro Cup 3K er Miguel Lamperti sin racket — en rund racket perfekt for kontrollspillere som liker ball-touch og defense.',
    ARRAY[]::text[],
    'in_stock',
    'https://www.tiendapadelpoint.es/nox-ml10-pro-cup',
    true
  ),
  (
    'Head Delta Motion',
    'head-delta-motion',
    'Head',
    'racket',
    149.95,
    'Head Delta Motion er en allsidig middels-hard racket for spillere på mellom- og avansert nivå. Diamantform gir kraft, mens EVC-kjernen absorberer vibrasjoner.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Head Zephyr',
    'head-zephyr',
    'Head',
    'racket',
    109.95,
    'Head Zephyr er en lett og kontrollvennlig racket for nybegynnere og rekreasjons-spillere. Rund form og myk kjerne gir behagelig spill og godt touch.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Wilson Bela Pro V2',
    'wilson-bela-pro-v2',
    'Wilson',
    'racket',
    199.95,
    'Wilson Bela Pro V2 er Fernando Bela sin offisielle racket. Trekant-form for maksimal kraft, med C2-core for optimalt komfort og respons.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Adidas Metalbone 3.3',
    'adidas-metalbone-3-3',
    'Adidas',
    'racket',
    259.95,
    'Adidas Metalbone 3.3 er flaggskipracketen fra Adidas. Med Rough Surface teknologi og Eva High Memory-kjerne leverer den ekstrem kraft og presisjon.',
    ARRAY[]::text[],
    'low_stock',
    null,
    true
  ),
  (
    'Babolat Air Viper',
    'babolat-air-viper',
    'Babolat',
    'racket',
    129.95,
    'Babolat Air Viper er en lett og responsiv racket designet for allsidighet. Rund form og Hybridframe gir kontroll og komfort i lange kamper.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Dunlop Aero-Star',
    'dunlop-aero-star',
    'Dunlop',
    'racket',
    99.95,
    'Dunlop Aero-Star er en utmerket racket for nybegynnere og mellomspillere. Balansert vekt og stor sweetspot gjør den enkel å lære med.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Bullpadel BPP-22001 Pro Bag',
    'bullpadel-pro-bag',
    'Bullpadel',
    'bag',
    89.95,
    'Profesjonell padelveske med plass til 3 racketer, dedikert skoseksjon og termo-isolert lomme for baller. Polstret skulderrem.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Head Core Padel Combi Bag',
    'head-core-combi-bag',
    'Head',
    'bag',
    59.95,
    'Head Core Combi Bag er en allsidig og romslig padel-bag for det meste av utstyr. Plass til 6 racketer og to store lommer.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Adidas Padel Racket Bag',
    'adidas-padel-racket-bag',
    'Adidas',
    'bag',
    49.95,
    'Adidas sin klassiske padel-bag i slank design. Plass til 1-2 racketer, tilbehørslomme og komfortabel håndtaksstropp.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Bullpadel BPP Pro Shoes',
    'bullpadel-pro-shoes',
    'Bullpadel',
    'shoes',
    119.95,
    'Bullpadel Pro Shoes er designet for prestasjon på alle underlag. Excellent stabilitet, pusterom mesh og slitesterk gummisåle for padelbane.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Adidas Adipower Ctrl 3.2',
    'adidas-adipower-ctrl-3-2',
    'Adidas',
    'shoes',
    139.95,
    'Adidas Adipower Ctrl 3.2 er toppmodellen fra Adidas innen padelsko. Agilityknit overlæret og Boost-mellomsor gir energiretur og ultimat komfort.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Head Sprint Pro 3.5 Padel',
    'head-sprint-pro-padel',
    'Head',
    'shoes',
    99.95,
    'Head Sprint Pro 3.5 er en lett og responsiv sko med Stability Frame og Herringbone-mønster for optimal grep på kunstgress.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Bullpadel Premier Pro Balls (3 pak)',
    'bullpadel-premier-pro-balls',
    'Bullpadel',
    'balls',
    8.95,
    'Offisielle World Padel Tour-baller. Presurisert og optimalisert for Europas klima. Selges i pakke med 3 baller.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Adidas Padel Match Ball (3 pak)',
    'adidas-padel-match-ball',
    'Adidas',
    'balls',
    7.95,
    'Adidas Padel Match Ball gir jevn sprett og lang holdbarhet. Perfekt til trening og kamp. Pakke med 3 baller.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Babolat Gold Padel Ball (3 pak)',
    'babolat-gold-padel-ball',
    'Babolat',
    'balls',
    8.50,
    'Babolat Gold er den offisielle turneringsballen brukt i WPT-kretser. Perfekt sprett og lang levetid. 3-pakk.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  ),
  (
    'Bullpadel Dry T-shirt',
    'bullpadel-dry-tshirt',
    'Bullpadel',
    'clothing',
    39.95,
    'Bullpadel Dry T-shirt er laget av hurtigtørkende polyester-mesh. Lett, pustende og perfekt for varme dager på banen.',
    ARRAY[]::text[],
    'in_stock',
    null,
    true
  )
ON CONFLICT (slug) DO NOTHING;
