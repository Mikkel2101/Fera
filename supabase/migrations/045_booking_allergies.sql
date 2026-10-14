-- Migration 045: Eget felt for allergier og preferanser på booking
-- Skilt ut fra special_requests ("Ønsker for turen") så vi kan samle inn
-- allergier/kostbehov direkte i booking-skjemaet i stedet for før avreise.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS allergies_preferences text;

COMMENT ON COLUMN public.bookings.allergies_preferences IS
  'Allergier, spesialkost og andre preferanser kunden oppga i booking-skjemaet.';

DROP FUNCTION IF EXISTS public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text[], jsonb, numeric, boolean, boolean);

CREATE OR REPLACE FUNCTION public.reserve_trip_spot(
  p_user_id              uuid,
  p_trip_id              uuid,
  p_first_name           text,
  p_last_name            text,
  p_email                text,
  p_phone                text,
  p_padel_level          text,
  p_room_type            text,
  p_room_preference      text,
  p_roommate_name        text,
  p_room_share_gender    text,
  p_trip_goal            text,
  p_special_requests     text,
  p_allergies_preferences text,
  p_selected_extras      text[],
  p_extras_detail        jsonb,
  p_price_total_eur      numeric,
  p_gdpr_consent         boolean,
  p_terms_accepted       boolean
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
    trip_goal, special_requests, allergies_preferences, selected_extras, extras_detail, price_total_eur,
    status, gdpr_consent, terms_accepted
  ) VALUES (
    p_user_id, p_trip_id, p_first_name, p_last_name, p_email, p_phone, p_padel_level,
    p_room_type, p_room_preference, p_roommate_name, p_room_share_gender,
    p_trip_goal, p_special_requests, p_allergies_preferences, COALESCE(p_selected_extras, '{}'),
    COALESCE(p_extras_detail, '[]'::jsonb), p_price_total_eur,
    'Reservert', p_gdpr_consent, p_terms_accepted
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Kun server-side (service role) skal kunne kalle den
REVOKE ALL ON FUNCTION public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text[], jsonb, numeric, boolean, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_trip_spot(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text[], jsonb, numeric, boolean, boolean) TO service_role;
