-- Migration 018: DB-indekser for ytelse + idempotens-garanti på Stripe-sesjoner
-- Kjøres som postgres-rolle i Supabase SQL Editor

-- Idempotens: forhindre duplikat-prosessering av Stripe-events
ALTER TABLE public.orders
  ADD CONSTRAINT orders_stripe_session_id_unique UNIQUE (stripe_session_id);

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_stripe_session_id_unique UNIQUE (stripe_session_id);

-- Fremmednøkkel-indekser (Postgres legger IKKE til disse automatisk)
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id    ON public.bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email      ON public.bookings(email);

CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email            ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status           ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_products_category_published ON public.products(category, published);
CREATE INDEX IF NOT EXISTS idx_products_brand              ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_slug               ON public.products(slug);

CREATE INDEX IF NOT EXISTS idx_waitlist_trip_id ON public.waitlist(trip_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email   ON public.waitlist(email);
