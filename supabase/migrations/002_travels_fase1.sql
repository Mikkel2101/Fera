-- Migration 002: Travels fase 1
-- trips, bookings, waitlist med RLS

CREATE TABLE IF NOT EXISTS trips (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      text NOT NULL,
  destination               text NOT NULL,
  hotel                     text,
  start_date                date NOT NULL,
  end_date                  date NOT NULL,
  price_double_eur          numeric(10,2) NOT NULL,
  price_single_eur          numeric(10,2),
  deposit_eur               numeric(10,2) NOT NULL DEFAULT 500,
  early_bird_price_double   numeric(10,2),
  early_bird_price_single   numeric(10,2),
  early_bird_deadline       date,
  max_participants          integer,
  registered_count          integer NOT NULL DEFAULT 0,
  status                    text NOT NULL DEFAULT 'draft',
  trip_type                 text,
  description               text,
  program                   text,
  included                  text[] NOT NULL DEFAULT '{}',
  not_included              text[] NOT NULL DEFAULT '{}',
  extras                    jsonb NOT NULL DEFAULT '[]',
  coaches                   jsonb NOT NULL DEFAULT '[]',
  faq                       jsonb NOT NULL DEFAULT '[]',
  main_image                text,
  gallery_images            text[] NOT NULL DEFAULT '{}',
  published                 boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id),
  trip_id           uuid NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  email             text NOT NULL,
  phone             text,
  room_type         text,
  roommate_name     text,
  padel_level       text,
  selected_extras   text[] NOT NULL DEFAULT '{}',
  deposit_status    text NOT NULL DEFAULT 'pending',
  deposit_date      timestamptz,
  rest_paid         boolean NOT NULL DEFAULT false,
  stripe_session_id text,
  referral_code     text,
  special_requests  text,
  gdpr_consent      boolean NOT NULL DEFAULT false,
  terms_accepted    boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  email      text NOT NULL,
  user_id    uuid REFERENCES auth.users(id),
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, email)
);

-- RLS
ALTER TABLE trips    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- trips: offentlig lesing av publiserte turer
DROP POLICY IF EXISTS "trips_public_read" ON trips;
CREATE POLICY "trips_public_read"
  ON trips FOR SELECT
  USING (published = true);

-- trips: full tilgang for service_role (bypass RLS via service key)
-- service_role bypasser RLS automatisk; ingen eksplisitt policy trengs.

-- bookings: autentiserte brukere kan lese og opprette egne bookinger
DROP POLICY IF EXISTS "bookings_insert_auth" ON bookings;
CREATE POLICY "bookings_insert_auth"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- waitlist: alle kan melde seg på
DROP POLICY IF EXISTS "waitlist_insert_public" ON waitlist;
CREATE POLICY "waitlist_insert_public"
  ON waitlist FOR INSERT
  WITH CHECK (true);
