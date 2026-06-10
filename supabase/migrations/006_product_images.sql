-- Add placeholder product images (Unsplash) for visual demo
-- Run this after 005_contact_and_products.sql

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
  'https://images.unsplash.com/photo-1617130994653-4b78e979fd8c?w=800&q=80'
] WHERE slug = 'bullpadel-vertex-04-ctr' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1617130994653-4b78e979fd8c?w=800&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80'
] WHERE slug = 'bullpadel-hack-04-ltd' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&q=80'
] WHERE slug = 'nox-at10-luxury-genius-18k' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&q=80'
] WHERE slug = 'nox-ml10-pro-cup-3k' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80'
] WHERE slug = 'head-delta-motion' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80'
] WHERE slug = 'head-zephyr' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&q=80'
] WHERE slug = 'wilson-bela-pro-v2' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1617130994653-4b78e979fd8c?w=800&q=80'
] WHERE slug = 'adidas-metalbone-3-3' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1617130994653-4b78e979fd8c?w=800&q=80'
] WHERE slug = 'babolat-air-viper' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&q=80'
] WHERE slug = 'dunlop-aero-star-tour' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=800&q=80'
] WHERE category = 'bag' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80'
] WHERE category = 'shoes' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1589820022776-4b56a2dac8f7?w=800&q=80'
] WHERE category = 'balls' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80'
] WHERE category = 'clothing' AND (images IS NULL OR images = '{}');

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1617130994653-4b78e979fd8c?w=800&q=80'
] WHERE category = 'accessories' AND (images IS NULL OR images = '{}');
