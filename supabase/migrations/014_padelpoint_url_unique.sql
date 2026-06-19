-- Fjern eventuelle duplikater (behold nyeste rad per URL) før constraint legges til
DELETE FROM public.products p1
USING public.products p2
WHERE p1.padelpoint_url IS NOT NULL
  AND p1.padelpoint_url = p2.padelpoint_url
  AND p1.id < p2.id;

-- Unik constraint på padelpoint_url — nødvendig for ON CONFLICT (padelpoint_url) i upsert.
-- NULL-verdier er tillatt (Postgres behandler dem som distinkte), dvs. manuelt opprette produkter
-- uten padelpoint_url er fremdeles mulig.
ALTER TABLE public.products
  ADD CONSTRAINT products_padelpoint_url_unique UNIQUE (padelpoint_url);
