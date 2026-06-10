-- Migration 011: Merkevarebegrensninger (Padelpoint fase 1)

-- Tabell over forbudte brands
CREATE TABLE IF NOT EXISTS public.restricted_brands (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand         text NOT NULL UNIQUE,
  reason        text NOT NULL,
  restricted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restricted_brands ENABLE ROW LEVEL SECURITY;

-- Alle kan lese (brukes til å vise årsak i admin og sync)
CREATE POLICY "Public kan lese restricted_brands" ON public.restricted_brands
  FOR SELECT USING (true);

CREATE POLICY "Admin kan administrere restricted_brands" ON public.restricted_brands
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed: Babolat er eksplisitt forbudt av Padelpoint
INSERT INTO public.restricted_brands (brand, reason)
VALUES ('Babolat', 'Padelpoint har ikke distribusjonsrett for Babolat i Norge')
ON CONFLICT (brand) DO NOTHING;

-- Trigger: hindre publisering av produkter med begrenset brand
CREATE OR REPLACE FUNCTION public.check_restricted_brand()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true THEN
    IF EXISTS (
      SELECT 1 FROM public.restricted_brands
      WHERE lower(brand) = lower(NEW.brand)
    ) THEN
      RAISE EXCEPTION 'Brand "%" er begrenset og kan ikke publiseres: %',
        NEW.brand,
        (SELECT reason FROM public.restricted_brands WHERE lower(brand) = lower(NEW.brand));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_brand_restriction ON public.products;
CREATE TRIGGER enforce_brand_restriction
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.check_restricted_brand();

-- Avpubliser alle Babolat-produkter (inkl. Babolat Lamborghini)
UPDATE public.products
SET published = false
WHERE lower(brand) LIKE '%babolat%';
