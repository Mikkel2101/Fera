---
spec: "fera-admin-panel"
title: "Fera Admin Panel"
date: "2026-06-05"
phase: "Fera Admin Fase 1"
status: "approved"
---

## Objective

Bygg et intern admin-panel for Fera Padel som lar Petter (og Mikkel) opprette og administrere padelreiser, se bookinger, venteliste og økonomi-oversikt. Panelet er kun tilgjengelig for brukere med `role: admin` i Supabase app_metadata.

## Scope

Fire seksjoner:
1. **Dashboard** — statskort + siste bookinger
2. **Turer** — CRUD for trips-tabellen, publiser/avpubliser
3. **Bookinger** — oversikt over alle bookinger, filtrerbar per tur
4. **Venteliste** — se hvem som står på venteliste per tur

## Layout

Toppmeny-basert (horisontal nav). `AdminNav`-komponent inneholder:
- Logo/navn: "Fera Admin"
- Lenker: Dashboard · Turer · Bookinger · Venteliste
- "Ny tur"-knapp i høyre hjørne (→ `/admin/trips/new`)

Eksisterende `app/admin/layout.tsx` utvides med `AdminNav` — auth-guard (redirect hvis ikke admin) er allerede implementert.

## Ruter

| Rute | Type | Beskrivelse |
|------|------|-------------|
| `/admin/dashboard` | Server Component | Stats + siste 10 bookinger |
| `/admin/trips` | Server Component | Turliste med rediger/slett/publiser |
| `/admin/trips/new` | Server Component + TripForm | Opprett ny tur |
| `/admin/trips/[id]/edit` | Server Component + TripForm | Rediger eksisterende tur |
| `/admin/bookings` | Server Component | Alle bookinger, filtrerbar per tur |
| `/admin/waitlist` | Server Component | Venteliste per tur |

## Komponenter

### `components/admin/AdminNav.tsx`
Client Component. Bruker `usePathname()` for å markere aktivt element. Farger fra design tokens (mørk bakgrunn: `--color-dark`, aktiv: `--color-cta`).

### `components/admin/TripForm.tsx`
Client Component — all interaktivitet (dynamiske lister, preview). Props: `trip?: TripRow` (undefined = opprett, satt = rediger). Kaller server action `createTrip` eller `updateTrip` ved submit.

**Felt i skjemaet (én lang scrollbar side):**

| Seksjon | Felt | Type |
|---------|------|------|
| Grunninfo | name, destination, hotel | text inputs |
| Datoer | start_date, end_date | date inputs |
| Meta | trip_type (select), status (select), published (toggle), max_participants | — |
| Priser | price_double_eur, price_single_eur, deposit_eur | number inputs |
| Early bird | early_bird_price_double, early_bird_price_single, early_bird_deadline | number + date |
| Innhold | description (textarea), program (textarea), main_image (URL input) | — |
| Lister | included[], not_included[] | dynamisk string-liste (legg til/fjern) |
| Extras | extras: [{name, price_eur}] | dynamisk liste med to felt per rad |
| Coaches | coaches: [{name, title, bio, image}] | dynamisk liste med fire felt per rad |
| FAQ | faq: [{question, answer}] | dynamisk liste med to felt per rad |

Validering: required-felt valideres client-side før submit. Feilmelding vises inline.

## Server Actions (`lib/actions/trips.ts`)

```ts
createTrip(formData: TripFormData): Promise<{ id: string }>
updateTrip(id: string, formData: TripFormData): Promise<void>
deleteTrip(id: string): Promise<void>
setPublished(id: string, published: boolean): Promise<void>
```

Alle actions bruker `createClient()` (anon + auth cookie). Returnerer strukturerte feil ved Supabase-feil.

## Dashboard-stats

Fire kort øverst:
- **Aktive turer** — count trips WHERE status IN ('Åpen','Få plasser') AND published = true
- **Totale bookinger** — count bookings
- **Betalte deposita** — count bookings WHERE deposit_status = 'Betalt'
- **Inntekt (EUR)** — sum deposit_eur for betalte bookinger (JOIN med trips)

Under kortene: tabell med siste 10 bookinger (navn, tur, status, dato).

## Bookings-side

Tabell med kolonner: Navn, E-post, Tur, Romtype, Status, Dato.
Dropdown-filter øverst: "Alle turer" + liste over turer.
Sortering: nyeste først.
Ingen handlinger utover visning i fase 1 (status endres via Stripe webhook).

## Venteliste-side

Tabell: E-post, Tur, Dato lagt til.
Dropdown-filter per tur.

## Supabase RLS-migrasjon

Ny migrasjon `003_admin_rls.sql` legger til policies:

```sql
-- trips: admin kan INSERT/UPDATE/DELETE
CREATE POLICY "admin_trips_write" ON trips
  FOR ALL USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- bookings: admin kan SELECT
CREATE POLICY "admin_bookings_read" ON bookings
  FOR SELECT USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- waitlist: admin kan SELECT
CREATE POLICY "admin_waitlist_read" ON waitlist
  FOR SELECT USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
```

## Design tokens

Følger eksisterende Palett C Dorado tokens fra `app/globals.css`. Admin-panelet bruker:
- Bakgrunn nav: `--color-dark`
- Aktiv lenke: `--color-cta`
- Kort/flater: `--color-surface`, `--color-sand`
- Statusfarger: `--color-success` (Betalt), `--color-gold` (Ventende), `--color-muted` (Utkast)

Ingen hardkodede hex-verdier.

## Out of scope (fase 2)

- Bildeopplasting (bruker URL-felt nå, Supabase Storage-integrasjon kommer)
- E-postbekreftelse til bookinger
- Manuell statusendring på bookinger
- Referral-administrasjon
- B2B-henvendelser
