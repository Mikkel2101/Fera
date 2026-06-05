-- Migration 002: Komplett Fera-skjema
-- Felles tabeller, FeraTravels, FeraShop og RLS med is_admin()-funksjon.
-- Dette er facit-skjemaet som ble kjørt direkte mot databasen.

-- ── FELLES TABELLER ─────────────────────────────────────────

create table public.users (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  phone              text,
  padel_level        text check (padel_level in ('Nybegynner','Nybegynner+','Viderekommen-','Viderekommen+','Proff')),
  newsletter_consent boolean not null default false,
  created_at         timestamptz not null default now()
);

create table public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete set null,
  brand      text not null check (brand in ('feratravels','ferashop')),
  text       text not null,
  rating     int check (rating between 1 and 5),
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  brands        text[] not null default '{}',
  subscribed_at timestamptz not null default now()
);

-- ── FERATRAVELS ─────────────────────────────────────────────

create table public.trips (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  destination             text not null,
  hotel                   text,
  start_date              date not null,
  end_date                date not null,
  price_double_eur        numeric not null,
  price_single_eur        numeric,
  deposit_eur             numeric not null default 300,
  early_bird_price_double numeric,
  early_bird_price_single numeric,
  early_bird_deadline     date,
  max_participants        int,
  registered_count        int not null default 0,
  status                  text not null default 'Utkast'
    check (status in ('Utkast','Åpen','Få plasser','Fullbooket','Avlyst','Gjennomført')),
  trip_type               text
    check (trip_type in ('Åpen tur','Klubbtur','Privat','Bedrift')),
  description             text,
  program                 text,
  included                text[] not null default '{}',
  not_included            text[] not null default '{}',
  extras                  jsonb not null default '[]',
  coaches                 jsonb not null default '[]',
  faq                     jsonb not null default '[]',
  main_image              text,
  gallery_images          text[] not null default '{}',
  published               boolean not null default false,
  created_at              timestamptz not null default now()
);

create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.users(id) on delete set null,
  trip_id           uuid not null references public.trips(id) on delete restrict,
  first_name        text not null,
  last_name         text not null,
  email             text not null,
  phone             text,
  room_type         text check (room_type in ('Dobbel','Single')),
  roommate_name     text,
  padel_level       text,
  selected_extras   text[] not null default '{}',
  deposit_status    text not null default 'Ventende'
    check (deposit_status in ('Ventende','Betalt','Refundert')),
  deposit_date      date,
  rest_paid         boolean not null default false,
  stripe_session_id text,
  referral_code     text,
  special_requests  text,
  gdpr_consent      boolean not null default false,
  terms_accepted    boolean not null default false,
  created_at        timestamptz not null default now()
);

create table public.referrals (
  id             uuid primary key default gen_random_uuid(),
  partner_name   text not null,
  code           text unique not null,
  commission_eur numeric,
  active         boolean not null default true,
  uses_count     int not null default 0,
  notes          text,
  created_at     timestamptz not null default now()
);

create table public.waitlist (
  id        uuid primary key default gen_random_uuid(),
  trip_id   uuid not null references public.trips(id) on delete cascade,
  email     text not null,
  user_id   uuid references public.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  unique (trip_id, email)
);

create table public.b2b_inquiries (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  organization           text,
  type                   text check (type in ('Klubb','Trener','Bedrift')),
  email                  text not null,
  phone                  text,
  city                   text,
  estimated_participants int,
  preferred_season       text,
  message                text,
  status                 text not null default 'Ny'
    check (status in ('Ny','Kontaktet','Tilbud sendt','Vunnet','Tapt')),
  created_at             timestamptz not null default now()
);

-- ── FERASHOP ────────────────────────────────────────────────

create table public.products (
  id                 uuid primary key default gen_random_uuid(),
  name_no            text not null,
  description_no     text,
  price_nok          numeric not null,
  original_price_eur numeric,
  brand              text,
  category           text,
  images             text[] not null default '{}',
  ean                text,
  sku                text,
  stock_status       text not null default 'in_stock'
    check (stock_status in ('in_stock','out_of_stock','coming_soon')),
  padelpoint_id      text,
  published          boolean not null default false,
  created_at         timestamptz not null default now()
);

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.users(id) on delete set null,
  email               text not null,
  status              text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','cancelled')),
  total_nok           numeric not null,
  stripe_session_id   text,
  shipping_address    jsonb,
  padelpoint_order_id text,
  items               jsonb not null,
  created_at          timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

alter table public.users                  enable row level security;
alter table public.testimonials           enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.trips                  enable row level security;
alter table public.bookings               enable row level security;
alter table public.referrals              enable row level security;
alter table public.waitlist               enable row level security;
alter table public.b2b_inquiries          enable row level security;
alter table public.products               enable row level security;
alter table public.orders                 enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
$$;

create policy "users: les egen rad"      on public.users for select using (auth.uid() = id);
create policy "users: oppdater egen rad" on public.users for update using (auth.uid() = id);
create policy "users: admin leser alle"  on public.users for select using (public.is_admin());

create policy "trips: alle leser publiserte" on public.trips for select using (published = true);
create policy "trips: admin leser alle"      on public.trips for select using (public.is_admin());
create policy "trips: admin skriver"         on public.trips for all    using (public.is_admin());

create policy "bookings: bruker leser egne"  on public.bookings for select using (auth.uid() = user_id);
create policy "bookings: alle kan opprette"  on public.bookings for insert with check (true);
create policy "bookings: admin leser alle"   on public.bookings for select using (public.is_admin());
create policy "bookings: admin oppdaterer"   on public.bookings for update using (public.is_admin());

create policy "products: alle leser publiserte" on public.products for select using (published = true);
create policy "products: admin skriver"         on public.products for all    using (public.is_admin());

create policy "orders: bruker leser egne (via email)" on public.orders for select using (
  auth.uid() = user_id or
  (select email from auth.users where id = auth.uid()) = email
);
create policy "orders: alle kan opprette" on public.orders for insert with check (true);
create policy "orders: admin leser alle"  on public.orders for select using (public.is_admin());
create policy "orders: admin oppdaterer" on public.orders for update using (public.is_admin());

create policy "referrals: kun admin" on public.referrals for all using (public.is_admin());

create policy "waitlist: alle kan melde seg på" on public.waitlist for insert with check (true);
create policy "waitlist: admin leser"           on public.waitlist for select using (public.is_admin());

create policy "b2b: alle kan sende inn" on public.b2b_inquiries for insert with check (true);
create policy "b2b: admin leser"        on public.b2b_inquiries for select using (public.is_admin());
create policy "b2b: admin oppdaterer"   on public.b2b_inquiries for update using (public.is_admin());

create policy "testimonials: alle leser godkjente" on public.testimonials for select using (approved = true);
create policy "testimonials: admin skriver"        on public.testimonials for all    using (public.is_admin());

create policy "newsletter: alle kan abonnere" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter: admin leser"       on public.newsletter_subscribers for select using (public.is_admin());
