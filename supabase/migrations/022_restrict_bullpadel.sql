-- Migration 022: Bullpadel kan ikke selges i nettbutikken (møte med Padelpoint 2026-10-06)
--
-- Bullpadel krever fysisk butikk i Norge på minst 40 m² (minst 20 m² Bullpadel-produkter),
-- og kan ikke kjøpes via Padelpoint. Fjern denne raden først når vilkårene er oppfylt.
-- Triggeren fra migrasjon 011 hindrer publisering av begrensede merker.

INSERT INTO public.restricted_brands (brand, reason)
VALUES (
  'Bullpadel',
  'Krever fysisk butikk i Norge (min. 40 m², min. 20 m² Bullpadel) og må kjøpes direkte fra Bullpadel, ikke Padelpoint'
)
ON CONFLICT (brand) DO NOTHING;

-- Avpubliser eksisterende Bullpadel-produkter
UPDATE public.products
SET published = false
WHERE lower(brand) LIKE '%bullpadel%'
  AND published = true;
