-- Migration 017: Lagrede leveringsadresser for innloggede brukere

CREATE TABLE public.addresses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label       text,                       -- "Hjemme", "Jobb" etc.
  full_name   text        NOT NULL,
  address1    text        NOT NULL,
  address2    text,
  postal_code text        NOT NULL,
  city        text        NOT NULL,
  country     text        NOT NULL DEFAULT 'NO',
  is_default  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses: bruker leser egne"      ON public.addresses FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "addresses: bruker oppretter egne"  ON public.addresses FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses: bruker oppdaterer egne" ON public.addresses FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "addresses: bruker sletter egne"    ON public.addresses FOR DELETE  USING (auth.uid() = user_id);
CREATE POLICY "addresses: admin leser alle"       ON public.addresses FOR SELECT  USING (public.is_admin());

-- Sikre maks én default per bruker via trigger
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.addresses
    SET    is_default = false
    WHERE  user_id = NEW.user_id
      AND  id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_default_address
AFTER INSERT OR UPDATE OF is_default ON public.addresses
FOR EACH ROW WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.ensure_single_default_address();
