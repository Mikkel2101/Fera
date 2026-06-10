-- Migration 013: Priskontroll-kø for Padelpoint-sync

CREATE TABLE IF NOT EXISTS public.price_review_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  padelpoint_url  text NOT NULL,
  product_name    text NOT NULL,
  current_price   numeric(10,2),
  proposed_price  numeric(10,2) NOT NULL,
  reason          text NOT NULL,
  reviewed        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.price_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin kan lese price_review_queue" ON public.price_review_queue
  FOR SELECT USING (public.is_admin());

-- INSERT skjer fra service role (cron-endepunkt)
CREATE POLICY "Alle kan opprette price_review_entries" ON public.price_review_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin kan oppdatere price_review_queue" ON public.price_review_queue
  FOR UPDATE USING (public.is_admin());
