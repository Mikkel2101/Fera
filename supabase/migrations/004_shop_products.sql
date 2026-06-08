-- Products table for FeraShop
CREATE TABLE public.products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  brand          text NOT NULL,
  category       text NOT NULL CHECK (category IN ('racket','shoes','bag','balls','clothing','accessories')),
  description    text,
  price_eur      numeric(10,2) NOT NULL,
  images         text[] DEFAULT '{}',
  stock_status   text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  padelpoint_id  text,
  padelpoint_url text,
  published      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
  USING (is_admin())
  WITH CHECK (is_admin());

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND is_admin());
