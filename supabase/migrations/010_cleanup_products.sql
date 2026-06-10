-- Remove all old products without proper images + wrong products
DELETE FROM public.products WHERE slug IN (
  'babolat-air-viper',
  'dunlop-aero-star',
  'head-delta-motion',
  'head-zephyr',
  'wilson-bela-pro-v2',
  'adidas-metalbone-3-3',
  'nox-at10-luxury-genius-18k',
  'nox-ml10-pro-cup-3k',
  'bullpadel-vertex-04-ctr',
  'bullpadel-hack-04-ltd'
);

-- Remove non-racket products that use generic Unsplash images
DELETE FROM public.products WHERE category IN ('bag', 'shoes', 'balls', 'clothing', 'accessories')
  AND images[1] LIKE '%unsplash%';

-- Fix Lamborghini prices to correct retail price
UPDATE public.products
SET price_eur = 800.00
WHERE slug IN ('babolat-lamborghini-azul-2026', 'babolat-lamborghini-blanco-2026');
