-- Migration 012: Oppdater orders-tabell for FeraShop fase 1
-- Legger til manglende kolonner; konverterer status-constraint.

-- Legg til manglende kundefelter
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS first_name    text,
  ADD COLUMN IF NOT EXISTS last_name     text,
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS id_passport   text,
  ADD COLUMN IF NOT EXISTS total_eur     numeric(10,2);

-- Migrer eksisterende status-verdier til ny terminologi
UPDATE public.orders SET status = 'pending_payment' WHERE status = 'pending';
UPDATE public.orders SET status = 'ordered_at_supplier' WHERE status = 'delivered';

-- Bytt ut status CHECK-constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment','paid','ordered_at_supplier','shipped','cancelled'));

-- pending_notifications: fallback når Resend-domenet ikke er verifisert ennå
CREATE TABLE IF NOT EXISTS public.pending_notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid REFERENCES public.orders(id),
  payload    jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin kan lese pending_notifications" ON public.pending_notifications
  FOR SELECT USING (public.is_admin());

-- NOTE: INSERT skjer fra service role (webhook) — service role bypasser RLS
CREATE POLICY "Alle kan opprette pending_notifications" ON public.pending_notifications
  FOR INSERT WITH CHECK (true);
