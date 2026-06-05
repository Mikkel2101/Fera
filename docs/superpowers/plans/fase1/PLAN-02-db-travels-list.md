---
plan: "02-db-travels-list"
title: "Supabase-migrasjon + /travels listevisning"
wave: 2
depends_on: ["01-tokens-nav"]
files_modified:
  - supabase/migrations/002_travels_fase1.sql
  - app/travels/page.tsx
  - components/travels/TripCard.tsx
  - components/travels/TripFilters.tsx
autonomous: true
phase: "Fera Padel Fase 1"
spec: "docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md"
---

## Objective

Opprett Supabase-migrasjon for `trips`-tabellen (med alle felt fra types.ts),
bygg `/travels`-listevisningen med mørk hero, client-side dropdown-filtrering
og kortgrid. Server-side fetch fra Supabase `trips` (published = true).

## must_haves

- `trips`-tabellen matcher felt i `lib/supabase/types.ts` Database['public']['Tables']['trips']
- `/travels` rendres server-side og sender tripdata til klient
- Kortgrid viser riktig status-badge basert på `status`-felt og kapasitet
- Alle farger via CSS-tokens (ingen hardkodede hex)
- Filter skjer client-side uten ny fetch

---

## Task 2.1 — Supabase-migrasjon 002_travels_fase1.sql

<read_first>
- lib/supabase/types.ts (trips-tabellen Row-type — alle felt og typer)
- supabase/config.toml (prosjektkonfig)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §6 (trips-felt brukt i detail)
</read_first>

<action>
Opprett supabase/migrations/002_travels_fase1.sql med:

Trips-tabell (basert på types.ts Row):
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
  title text NOT NULL
  slug text UNIQUE
  destination text
  start_date date
  end_date date
  price_double_eur numeric(10,2) NOT NULL
  price_single_eur numeric(10,2) NOT NULL
  deposit_eur numeric(10,2) NOT NULL DEFAULT 500
  early_bird_price_double numeric(10,2)
  early_bird_price_single numeric(10,2)
  early_bird_deadline date
  max_participants integer
  registered_count integer NOT NULL DEFAULT 0
  status text NOT NULL DEFAULT 'draft'   -- 'draft'|'published'|'full'
  trip_type text   -- 'bedrift'|'klubb'|'venner'|'skole'
  description text
  program text
  included text[] NOT NULL DEFAULT '{}'
  not_included text[] NOT NULL DEFAULT '{}'
  extras jsonb NOT NULL DEFAULT '[]'
  coaches jsonb NOT NULL DEFAULT '[]'
  faq jsonb NOT NULL DEFAULT '[]'
  main_image text
  gallery_images text[] NOT NULL DEFAULT '{}'
  published boolean NOT NULL DEFAULT false
  created_at timestamptz NOT NULL DEFAULT now()

Bookings-tabell (basert på types.ts Row):
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id uuid REFERENCES auth.users(id)
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE RESTRICT
  first_name text NOT NULL
  last_name text NOT NULL
  email text NOT NULL
  phone text
  room_type text   -- 'double'|'single'
  roommate_name text
  padel_level text
  selected_extras text[] NOT NULL DEFAULT '{}'
  deposit_status text NOT NULL DEFAULT 'pending'   -- 'pending'|'paid'|'failed'
  deposit_date timestamptz
  rest_paid boolean NOT NULL DEFAULT false
  stripe_session_id text
  referral_code text
  special_requests text
  gdpr_consent boolean NOT NULL DEFAULT false
  terms_accepted boolean NOT NULL DEFAULT false
  created_at timestamptz NOT NULL DEFAULT now()

Waitlist-tabell:
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE
  email text NOT NULL
  created_at timestamptz NOT NULL DEFAULT now()
  UNIQUE(trip_id, email)

RLS-policies:
  trips: SELECT public (published = true), alle operasjoner for service_role
  bookings: INSERT og SELECT for autentiserte brukere (egne bookinger)
  waitlist: INSERT for alle

Kjør: npx supabase db push etter denne filen er opprettet.
</action>

<acceptance_criteria>
- supabase/migrations/002_travels_fase1.sql eksisterer
- Inneholder `CREATE TABLE trips`
- Inneholder `CREATE TABLE bookings`
- Inneholder `CREATE TABLE waitlist`
- Inneholder `ALTER TABLE trips ENABLE ROW LEVEL SECURITY`
- SQL er syntaktisk korrekt (kan valideres med `npx supabase db lint`)
</acceptance_criteria>

---

## Task 2.2 — Bygg TripCard-komponent

<read_first>
- app/globals.css (alle token-navn: color-dark-card, color-gold, color-cta, color-success, color-muted)
- lib/supabase/types.ts (trips-tabellen Row-type — felt som vises i kortet)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §5 (kortspesifikasjon)
</read_first>

<action>
Opprett components/travels/TripCard.tsx som Server Component (ingen 'use client').

Props: `trip: Database['public']['Tables']['trips']['Row']`

Kortstruktur (bg-[--color-dark-card], rounded-[14px], overflow-hidden):

Bildedel (top, aspect-ratio 16/9):
  - Hvis main_image: Next.js Image med mørk overlay (bg-black/40)
  - Ellers: gradient bg-gradient-to-br from-[--color-dark] to-[--color-dark-mid]
  - "FERA"-watermark: font-display, text-[--color-gold]/20, absolute bottom-left
  - Status-badge (top-right, absolute):
      published + available (> 20% plasser): bg-[--color-success] "Åpen"
      < 20% plasser igjen: bg-[--color-cta] "{N} plasser igjen"
      full: bg-white/20 "Utsolgt"
      draft: ikke vis kortet (filtreres i parent)
  - Early bird badge (bottom-left, hvis early_bird_price_double og deadline ikke passert):
      bg-[--color-gold] "Early bird"

Kortinnhold (padding 16px):
  - trip_type i small-caps, text-[--color-muted], text-xs
  - title: font-display, text-white, text-xl, font-semibold
  - Metadata-linje: dato · destinasjon · (max_participants - registered_count) plasser igjen
    i text-[--color-muted], text-sm
  - Footer: pris i text-[--color-gold] text-2xl font-bold (price_double_eur)
    + "Se detaljer →" eller "Venteliste →" (hvis full)
    Knapp: Link til /travels/[id], bg-[--color-cta], text-white, rounded-full

Ingen hardkodet hex.
Importer Database-type fra lib/supabase/types.
</action>

<acceptance_criteria>
- components/travels/TripCard.tsx eksisterer
- Inneholder `Database['public']['Tables']['trips']['Row']` som type
- Ingen `'use client'`-direktiv (server component)
- Inneholder `text-[--color-gold]`, `bg-[--color-dark-card]`, `bg-[--color-cta]`
- Ingen `#` hex i komponentfilen
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 2.3 — Bygg TripFilters-komponent

<read_first>
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §5 (filter-rad)
- app/globals.css (color-border, color-surface)
- lib/supabase/types.ts (trip_type og destination felt)
</read_first>

<action>
Opprett components/travels/TripFilters.tsx som Client Component (`'use client'`).

Props:
  trips: Trip[] (alle turer fra server)
  onFilter: (filtered: Trip[]) => void

Render:
  - filter-rad: bg-white, border-b border-[--color-border], px-6 py-3
  - Tre <select>-dropdowns:
      1. "Alle aktiviteter" (filtrerer på trip_type)
      2. "Alle destinasjoner" (filtrerer på destination)
      3. "Alle typer" (bedrift | klubb | venner | skole)
  - Alternativene bygges dynamisk fra unike verdier i trips-arrayet
  - onChange: kjør client-side filter og kall onFilter(result)
  - select-styling: border border-[--color-border], rounded-lg, px-3 py-2, text-sm

useState for valgte filterVerdier.
useEffect for å re-filtrere når trips-prop endres.
</action>

<acceptance_criteria>
- components/travels/TripFilters.tsx eksisterer
- Inneholder `'use client'`
- Props-type inkluderer `onFilter` callback
- Inneholder `border-[--color-border]`
- Ingen hardkodede hex
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 2.4 — Bygg /travels page.tsx

<read_first>
- app/travels/page.tsx (nåværende placeholder — skal erstattes)
- lib/supabase/server.ts (createClient() for server-side Supabase)
- lib/supabase/types.ts (Database-type)
- components/travels/TripCard.tsx (nettopp opprettet)
- components/travels/TripFilters.tsx (nettopp opprettet)
- app/globals.css (color-dark, color-dark-mid, color-gold, color-sand)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §5
- node_modules/next/dist/docs/ (Next.js 16 Server Component data-fetching)
</read_first>

<action>
Erstatt app/travels/page.tsx med en async Server Component.

Data-fetching:
  const supabase = await createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('published', true)
    .order('start_date', { ascending: true })

Struktur:
  1. Hero-seksjon (mørk):
     - bg-gradient-to-b from-[--color-dark] to-[--color-dark-mid]
     - Label: "KOMMENDE TURER" — text-[--color-gold], tracking-widest, small-caps, text-xs
     - Heading: "Finn ditt neste " + <em className="italic text-[--color-gold]">eventyr</em>
       font-display, text-white, text-4xl md:text-6xl
     - Ingress: text-[--color-muted], max-w-xl

  2. FilterWrapper (Client Component — opprett inline eller separat):
     Wrapper som holder useState for filtered trips og sender til TripFilters + kortgrid.
     Oppretter components/travels/TripListClient.tsx ('use client') som mottar
     initialTrips og renderer TripFilters + kortgrid.

  3. Kortgrid (via TripListClient):
     - bg-[--color-sand], min-h-screen
     - grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6
     - TripCard per tur (ikke draft-status)
     - Tom tilstand: "Ingen turer matcher filtrene dine" i text-[--color-muted]

VIKTIG: Page er async Server Component. Kortgrid + filtrering håndteres av
TripListClient som tar initialTrips som prop.
</action>

<acceptance_criteria>
- app/travels/page.tsx er async og henter fra Supabase med .eq('published', true)
- Siden har hero-seksjon med `text-[--color-gold]` og `from-[--color-dark]`
- components/travels/TripListClient.tsx eksisterer med `'use client'`
- Kortgrid bruker TripCard
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
</acceptance_criteria>

---

## Verification

```bash
npx tsc --noEmit
npm run build
ls supabase/migrations/002_travels_fase1.sql
ls components/travels/TripCard.tsx
ls components/travels/TripFilters.tsx
ls components/travels/TripListClient.tsx
grep -r "from-\[--color-dark\]" app/travels/page.tsx
grep "color-gold" components/travels/TripCard.tsx
```
