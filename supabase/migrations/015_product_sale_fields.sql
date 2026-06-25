ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_on_sale        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS previous_price_eur numeric;
