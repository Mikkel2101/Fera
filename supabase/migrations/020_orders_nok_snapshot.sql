-- Migration 020: NOK-snapshot på orders
-- Fikser B9: /account/orders konverterte total_eur med DAGENS valutakurs
-- ved rendering, mens beløpet som faktisk ble belastet i Stripe ble regnet
-- med kursen PÅ KJØPSTIDSPUNKTET. Uten snapshot avviker visningen fra det
-- kunden faktisk betalte, og avviket driver over tid etter hvert som kursen
-- endrer seg.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS total_nok numeric(10,2),
  ADD COLUMN IF NOT EXISTS nok_rate  numeric(10,4);

COMMENT ON COLUMN public.orders.total_nok IS 'Faktisk NOK-beløp belastet i Stripe på kjøpstidspunktet — bruk denne i visning, ikke total_eur konvertert med dagens kurs.';
COMMENT ON COLUMN public.orders.nok_rate  IS 'EUR→NOK-kurs (inkl. buffer) brukt til å regne ut line items ved checkout — for visning av enkeltprodukter i historikk.';
