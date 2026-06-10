-- Fix product images: use real Padelpoint product images

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-vertex-05-hybrid-2026-800x800.webp'
] WHERE slug = 'bullpadel-vertex-04-ctr';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-bullpadel-paquito-navarro-hack-04-2026-800x800.webp'
] WHERE slug = 'bullpadel-hack-04-ltd';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-nox-agustin-tapia-at10-luxury-genius-18k-2023-255x255.webp'
] WHERE slug = 'nox-at10-luxury-genius-18k';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-nox-agustin-tapia-at10-luxury-genius-18k-2023-255x255.webp'
] WHERE slug = 'nox-ml10-pro-cup-3k';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-head-extreme-pro-2023-255x255.webp'
] WHERE slug = 'head-delta-motion';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-head-speed-motion-2023-255x255.webp'
] WHERE slug = 'head-zephyr';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-wilson-bela-lt-v2-5--1-255x255.webp'
] WHERE slug = 'wilson-bela-pro-v2';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-adidas-metalbone-carbon-3-4-2025-255x255.webp'
] WHERE slug = 'adidas-metalbone-3-3';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-babolat-lamborghini-azul-2026-800x800.webp'
] WHERE slug = 'babolat-air-viper';

UPDATE public.products SET images = ARRAY[
  'https://www.tiendapadelpoint.com/image/cache/catalog/pala-siux-pegasus-3-2025-255x255.webp'
] WHERE slug = 'dunlop-aero-star';
