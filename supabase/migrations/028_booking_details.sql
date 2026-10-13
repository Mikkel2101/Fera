-- Migration 028: Utvidet påmelding (reservasjon fase 1)
-- Aktivt romvalg, padelnivå med ny skala, mål for turen, ønsker,
-- tillegg med størrelse og antall, og prisen kunden så ved reservasjon.
-- Per 2026-10-13 finnes ingen bookinger og ingen brukere med nivå i prod,
-- så ingen data må flyttes.
--
-- NB: reserve_trip_spot() får ny signatur og den gamle droppes. Kjør
-- migrasjonen rett før koden som kaller den nye versjonen deployes.

-- Ny nivåskala, felles for booking og profil
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_padel_level_check;
UPDATE public.users SET padel_level = NULL
 WHERE padel_level IS NOT NULL
   AND padel_level NOT IN ('nybegynner', 'middels_minus', 'middels_pluss', 'hoyt', 'usikker');
ALTER TABLE public.users ADD CONSTRAINT users_padel_level_check
  CHECK (padel_level IN ('nybegynner', 'middels_minus', 'middels_pluss', 'hoyt', 'usikker'));

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_padel_level_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_padel_level_check
  CHECK (padel_level IN ('nybegynner', 'middels_minus', 'middels_pluss', 'hoyt', 'usikker')) NOT VALID;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS room_preference text
    CHECK (room_preference IN ('single', 'partner', 'match')),
  ADD COLUMN IF NOT EXISTS room_share_gender text
    CHECK (room_share_gender IN ('kvinne', 'mann')),
  ADD COLUMN IF NOT EXISTS trip_goal text
    CHECK (trip_goal IN ('utvikling', 'jevne_kamper', 'sosialt', 'kombinasjon')),
  ADD COLUMN IF NOT EXISTS extras_detail jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS price_total_eur numeric;

COMMENT ON COLUMN public.bookings.extras_detail IS
  'Valgte tillegg: [{name, size, quantity, unit_price_eur}]. selected_extras har samme valg som lesbar tekst.';
COMMENT ON COLUMN public.bookings.price_total_eur IS
  'Totalpris per person (rom + tillegg) slik kunden så den ved reservasjon.';

DROP FUNCTION IF EXISTS public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text[], boolean, boolean);

-- Som i 021: radlåsen på turen gjør at to samtidige forespørsler aldri
-- begge får den siste plassen.
CREATE OR REPLACE FUNCTION public.reserve_trip_spot(
  p_user_id           uuid,
  p_trip_id           uuid,
  p_first_name        text,
  p_last_name         text,
  p_email             text,
  p_phone             text,
  p_padel_level       text,
  p_room_type         text,
  p_room_preference   text,
  p_roommate_name     text,
  p_room_share_gender text,
  p_trip_goal         text,
  p_special_requests  text,
  p_selected_extras   text[],
  p_extras_detail     jsonb,
  p_price_total_eur   numeric,
  p_gdpr_consent      boolean,
  p_terms_accepted    boolean
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
    room_type, room_preference, roommate_name, room_share_gender,
    trip_goal, special_requests, selected_extras, extras_detail, price_total_eur,
    status, gdpr_consent, terms_accepted
  ) VALUES (
    p_user_id, p_trip_id, p_first_name, p_last_name, p_email, p_phone, p_padel_level,
    p_room_type, p_room_preference, p_roommate_name, p_room_share_gender,
    p_trip_goal, p_special_requests, COALESCE(p_selected_extras, '{}'),
    COALESCE(p_extras_detail, '[]'::jsonb), p_price_total_eur,
    'Reservert', p_gdpr_consent, p_terms_accepted
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Kun server-side (service role) skal kunne kalle den
REVOKE ALL ON FUNCTION public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text[], jsonb, numeric, boolean, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text[], jsonb, numeric, boolean, boolean) TO service_role;
