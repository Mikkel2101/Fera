-- Replace old racket products with new 2026 models from Padelpoint
-- Images: 1600x1600 from tiendapadelpoint.com CDN (already whitelisted in next.config)

-- Remove old racket products
DELETE FROM public.products WHERE category = 'racket';

-- Insert 2026 product catalog
INSERT INTO public.products (name, slug, brand, category, price_eur, description, images, stock_status, padelpoint_url, published)
VALUES

-- BULLPADEL
(
  'Bullpadel Vertex 05 Hybrid 2026',
  'bullpadel-vertex-05-hybrid-2026',
  'Bullpadel',
  'racket',
  249.95,
  'En allsidig racket for spillere som vil dominere alle deler av banen. Perfekt balanse mellom kontroll og kraft takket være Xtend Carbon 12K og Multieva-kjernen. Integrerte antivibrasjonsguarder og Custom Weight-system lar deg tilpasse balansen til din spillestil.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-vertex-05-hybrid-2026-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Bullpadel Vertex 05 Geo 2026 — Pablo Cardona',
  'bullpadel-vertex-05-geo-2026',
  'Bullpadel',
  'racket',
  279.95,
  'Pablo Cardonas signaturracket for 2026. Geometrisk design med utvidet slagflate (541 cm²) og et optimalisert søtpunkt for overlegen kontroll og kraft. Trippelt antivibrasjonsystem: Ease Vibe + Vibradrive + Hesacore.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-pablo-cardona-vertex-05-geo-2026-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Bullpadel Hack 04 2026 — Paquito Navarro',
  'bullpadel-hack-04-2026',
  'Bullpadel',
  'racket',
  269.95,
  'Paquito Navarros offisielle racket for 2026. TriCarbon 18K gir eksplosiv kraft og presisjon i hvert slag. Total Channel-teknologi akselererer ballen og gjør hvert swint til ren kraft. For offensive spillere som vil sette preg på kampen.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-paquito-navarro-hack-04-2026-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Bullpadel Neuron 02 2026 — Fede Chingotto',
  'bullpadel-neuron-02-2026',
  'Bullpadel',
  'racket',
  259.95,
  'Fede Chingottos kontrollracket for 2026. PrismLock-rammen eliminerer torsjon og gir maksimal stabilitet. X-Tend Carbon 3K og Multieva-kjerne leverer en fast, forutsigbar respons — perfekt for spillere som styrer kampen med presisjon.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-chingotto-neuron-02-2026-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Bullpadel Hack 04 Premier Padel 2026 — Paquito Navarro',
  'bullpadel-hack-04-premier-2026',
  'Bullpadel',
  'racket',
  319.95,
  'Den mest eksklusive versjonen av Hack 04 — Premier Padel Edition. Produsert for WPT-kretsen med TriCarbon 18K, Bullpadel Dynamic Power og eksklusive detaljer. For spillere som vil spille med det beste utstyret som finnes.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-paquito-navarro-hack-04-premier-padel-2026-1600x1600.webp'],
  'low_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),

-- BABOLAT
(
  'Babolat Lamborghini 2026 — Blå',
  'babolat-lamborghini-azul-2026',
  'Babolat',
  'racket',
  349.95,
  'Et samarbeidsprosjekt mellom Babolat og Automobili Lamborghini. 3K karbon-overflate, Koridion-skumkjerne og Diamond-form for eksplosiv kraft. Begrenset opplag — en racket som imponerer like mye på banen som i skapskapet.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-babolat-lamborghini-azul-2026-1600x1600.webp'],
  'low_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Babolat Lamborghini 2026 — Hvit',
  'babolat-lamborghini-blanco-2026',
  'Babolat',
  'racket',
  349.95,
  'Premium limited edition-racket fra Babolat × Lamborghini-samarbeidet. Diamond-form med høy balanse, 3K karbon og Koridion-kjerne for maksimal kraft. Hvit/gull-design gjør den til en samlerartikkel — like eksklusiv som den er effektiv.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-babolat-lamborghini-blanco-2026-1600x1600.webp'],
  'low_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),

-- WILSON
(
  'Wilson Defy Pro V1',
  'wilson-defy-pro-v1',
  'Wilson',
  'racket',
  289.95,
  'Wilsons toppmodell — Diamond-form for maksimal kraft, 3K karbon-overflate og Spin² tekstur for overlegen effekt. I-Beam-teknologi gir strukturell stivhet og energioverføring. For offensive spillere som vil definere hvert point.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-wilson-defy-pro-v1-blanco-oro-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Wilson Defy V1',
  'wilson-defy-v1',
  'Wilson',
  'racket',
  239.95,
  'Wilson Defy V1 kombinerer explosiv kraft med overlegen manøvrerbarhet. Diamond-form, Aeroexact Design og Duo Grid-hullmønster for optimal balanse mellom kraft og kontroll. Spin² tekstur gir ekstra effekt på hvert slag.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-wilson-defy-v1-blanco-oro-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
),
(
  'Wilson Defy LS V1',
  'wilson-defy-ls-v1',
  'Wilson',
  'racket',
  219.95,
  'Den letteste varianten av Defy-serien. Samme explosive kraft som Pro-modellen, men med Comfort Flex Face og redusert vekt for raskere bevegelse og bedre manøvrerbarhet. Perfekt for spillere som prioriterer hurtighet.',
  ARRAY['https://www.tiendapadelpoint.com/image/cache/catalog/pala-wilson-defy-ls-v1-blanco-oro-1600x1600.webp'],
  'in_stock',
  'https://www.tiendapadelpoint.com/en/padel-rackets-en/profesional-avanzado-en/',
  true
)

ON CONFLICT (slug) DO NOTHING;
