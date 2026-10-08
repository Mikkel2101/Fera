-- Migration 021: Booking som uforpliktende reservasjon
-- Fera har ikke org.nr. ennå og kan derfor ikke ta betalt via Stripe.
-- Booking lagres som en reservasjon som tar en plass på turen. Betaling
-- (deposit_status) håndteres senere, når betalingsløsningen er på plass.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Reservert'
    CHECK (status IN ('Reservert', 'Bekreftet', 'Kansellert'));

-- Én aktiv reservasjon per kunde per tur
CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_active_per_user_trip
  ON public.bookings (user_id, trip_id)
  WHERE status <> 'Kansellert' AND user_id IS NOT NULL;

-- Reserverer en plass atomisk: teller opp registered_count kun hvis turen
-- er åpen og har ledig kapasitet, og oppretter bookingen i samme transaksjon.
-- UPDATE-en radlåser turen, så to samtidige forespørsler kan aldri begge
-- få den siste plassen.
CREATE OR REPLACE FUNCTION public.reserve_trip_spot(
  p_user_id         uuid,
  p_trip_id         uuid,
  p_first_name      text,
  p_last_name       text,
  p_email           text,
  p_phone           text,
  p_padel_level     text,
  p_room_type       text,
  p_roommate_name   text,
  p_selected_extras text[],
  p_gdpr_consent    boolean,
  p_terms_accepted  boolean
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip       public.trips%ROWTYPE;
  v_booking_id uuid;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id = p_user_id AND trip_id = p_trip_id AND status <> 'Kansellert'
  ) THEN
    RAISE EXCEPTION 'ALREADY_RESERVED';
  END IF;

  UPDATE public.trips
     SET registered_count = registered_count + 1
   WHERE id = p_trip_id
     AND published = true
     AND status IN ('Åpen', 'Få plasser')
     AND (max_participants IS NULL OR registered_count < max_participants)
  RETURNING * INTO v_trip;

  IF NOT FOUND THEN
    IF EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = p_trip_id AND published = true AND status IN ('Åpen', 'Få plasser', 'Fullbooket')
    ) THEN
      RAISE EXCEPTION 'TRIP_FULL';
    END IF;
    RAISE EXCEPTION 'TRIP_UNAVAILABLE';
  END IF;

  IF v_trip.max_participants IS NOT NULL
     AND v_trip.registered_count >= v_trip.max_participants THEN
    UPDATE public.trips SET status = 'Fullbooket' WHERE id = p_trip_id;
  END IF;

  INSERT INTO public.bookings (
    user_id, trip_id, first_name, last_name, email, phone, padel_level,
    room_type, roommate_name, selected_extras, status, gdpr_consent, terms_accepted
  ) VALUES (
    p_user_id, p_trip_id, p_first_name, p_last_name, p_email, p_phone, p_padel_level,
    p_room_type, p_roommate_name, COALESCE(p_selected_extras, '{}'), 'Reservert',
    p_gdpr_consent, p_terms_accepted
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Kansellerer en reservasjon og frigjør plassen. Idempotent: en allerede
-- kansellert booking gir false og endrer ingenting.
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip_id uuid;
BEGIN
  UPDATE public.bookings
     SET status = 'Kansellert'
   WHERE id = p_booking_id AND status <> 'Kansellert'
  RETURNING trip_id INTO v_trip_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.trips
     SET registered_count = GREATEST(registered_count - 1, 0),
         status = CASE WHEN status = 'Fullbooket' THEN 'Åpen' ELSE status END
   WHERE id = v_trip_id;

  RETURN true;
END;
$$;

-- Kun server-side (service role) skal kunne kalle disse
REVOKE ALL ON FUNCTION public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text[], boolean, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_booking(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text[], boolean, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO service_role;
