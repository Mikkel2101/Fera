# Fera Padel — Best-in-Class Review: Prioritert Action-liste
**Dato:** 20. juni 2026  
**Gjennomgang av:** Pen-tester, UI/UX-spesialist, CTO, Cybersikkerhet, E-commerce-spesialist

---

## KRITISK — Fiks umiddelbart (blokkerer produksjonsklar status)

### K1 · Prismanipulasjon i shop-checkout ✅ FIKSET
`app/api/shop/checkout/route.ts` — Pris (`price_eur`) hentes nå fra `products`-tabellen server-side. Klient-pris ignoreres.  
Legg til: validering av `published` og `stock_status` — returnerer 422 hvis produkt ikke finnes eller er utsolgt.

### K2 · Roter SUPABASE_SERVICE_ROLE_KEY ⚠️ MANUELL HANDLING
Cybersecurity-agenten fant `SUPABASE_SERVICE_ROLE_KEY` i `.env.local` (ikke i git, men på disk). Service role-nøkkelen bypasser all RLS.  
**Fix:** Roter nøkkelen umiddelbart i Supabase-dashbordet → Settings → API → Regenerate service role key. Oppdater i Vercel. Bruk aldri `vercel env pull` i prosjektkatalogen.  
**Prioritet:** 🔴 Kritisk

### K3 · Åpen redirect i auth-callback ✅ FIKSET
`app/api/auth/callback/route.ts` — `?next=//evil.com` omdirigerte til ekstern URL.  
**Status:** Fikset — validerer nå at `next` starter med `/` og ikke `//`.

### K4 · Ingen kunde-e-post ved ordrebekreftelse ✅ FIKSET
`lib/shop/email.ts` — `sendCustomerOrderConfirmation()` lagt til. Sender ordrebekreftelse med produktliste, NOK-total (fra `session.amount_total`), leveringsadresse, tollvarsel og 14 dagers angrerett-info.

### K5 · Stripe belaster i EUR, norske kunder forventer NOK ✅ FIKSET
Begge checkout-routes bruker `currency: 'nok'` og `eurToNok()` konvertering. Vipps Private Beta aktivt.

### K6 · Toll og MVA advarselen er ikke synlig ved checkout ✅ FIKSET
Advarsel vist i CartDrawer (sand-boks) og produktdetaljside.

---

## BØR FIKSES — Høy prioritet

### B1 · Server Actions har ingen auth-guard ✅ FIKSET
`lib/actions/trips.ts` — Admin-mutasjoner (create/update/delete trip) kunne kalles direkte uten autentisering.  
**Status:** Fikset — `requireAdmin()` helper lagt til alle eksporterte Server Actions.

### B2 · Cron-endepunkt var åpent når CRON_SECRET ikke er satt ✅ FIKSET
`app/api/cron/padelpoint-sync/route.ts` — Auth-check med `&&` betydde at manglende secret = alltid åpen.  
**Status:** Fikset — sjekker nå alltid og krever at CRON_SECRET er satt.

### B3 · Webhook brukte cookie-klient for booking-oppdatering ✅ FIKSET
`app/api/webhooks/stripe/route.ts` — `createClient()` i en webhook-kontekst (ingen sesjon) → RLS blokket booking-oppdatering.  
**Status:** Fikset — bruker nå `createServiceClient()` i begge brancher.

### B4 · Ingen idempotens-guard i Stripe-webhook ✅ FIKSET
`018_indexes_and_idempotency.sql` — UNIQUE constraint på `orders.stripe_session_id` og `bookings.stripe_session_id`. Webhook sjekker om session allerede er prosessert før oppdatering.

### B5 · Null DB-indekser på fremmednøkler ✅ FIKSET — kjør migrasjon 018 i Supabase
Alle 17 migrasjoner — ingen index på `bookings.trip_id`, `bookings.user_id`, `orders.user_id`, `products.category`, osv.  
**Fix:** Lag migrasjon `018_indexes.sql`:
```sql
CREATE INDEX ON bookings(trip_id);
CREATE INDEX ON bookings(user_id);
CREATE INDEX ON orders(user_id);
CREATE INDEX ON orders(stripe_session_id);
CREATE INDEX ON orders(status);
CREATE INDEX ON products(category, published);
CREATE INDEX ON products(brand);
```

### B6 · Shop-ordre opprettes FØR Stripe bekrefter betaling ✏️ TODO
`app/api/shop/checkout/route.ts:36` — Ordre med `pending_payment` innsettes, deretter kalles Stripe. Hvis Stripe krasjer, er ordren foreldreløs i DB.  
**Fix:** Opprett Stripe-sesjonen først, deretter insert ordren med `stripe_session_id` allerede kjent.

### B7 · Booking INSERT-policy tillater anonym spam ✅ FIKSET — kjør migrasjon 019 i Supabase
`019_booking_insert_policy.sql` — booking INSERT krever nå `auth.uid() IS NOT NULL`. Travels checkout bruker serviceClient for insert (bypasser RLS).

### B8 · Auth-modal har ingen fokus-trap ✏️ TODO
`components/shared/AuthModal.tsx` — keyboard-brukere kan Tab ut av modalen (WCAG 2.1 SC 2.1.2).  
**Fix:** Legg til `role="dialog" aria-modal="true"` og implementer fokus-fange (f.eks. `@radix-ui/react-dialog`).

### B9 · Kundene ser EUR på ordrene, ikke NOK ✏️ TODO
`app/account/orders/page.tsx` — Linjeposter vises med `€`-symbol, men ordreoversikten viser NOK-beløp (inkonsistent etter K5-fiks).  
**Fix:** Konverter til NOK på alle steder (henger på K5).

### B10 · Ingen feilgrenser (error boundaries) ✅ FIKSET
`app/error.tsx`, `app/shop/error.tsx`, `app/travels/error.tsx` lagt til med "Prøv igjen"-knapp og link til forsiden.

---

## NORSK MARKED — E-commerce krav

### N1 · Angrerett ikke synlig før kjøp ✅ FIKSET
Vist i CartDrawer-footer og produktdetaljside (trust badges).

### N2 · Org.nr og adresse mangler i footer ⚠️ DELVIS FIKSET
Footer har nå `Org.nr: [FYLL INN]` — Mikkel må bytte inn det ekte org.nr i `components/shared/Footer.tsx` linje ~93.

### N3 · Klarna-faktura bør aktiveres ✏️ TODO
Norske kunder forventer fakturaalternativ (14 dager). Klarna støttes via Stripe — én konfigurasjonsjusterting.  
**Fix:** Aktivér Klarna i Stripe-dashbordet → Payment Methods.

### N4 · Betalingsmetode-logoer mangler ✏️ TODO
Vipps + Visa + Mastercard-logoer mangler på siden (CartDrawer, produktsider). Norske kunder forventer å se Vipps-logoen.  
**Fix:** Legg til `vipps-badge.svg`, `visa.svg`, `mc.svg` i CartDrawer-footer.

### N5 · Ingen ordresporings-URL ✏️ TODO
Kunder kan ikke spore forsendelsen etter "Sendt"-status.  
**Fix:** Legg til `tracking_number text, tracking_url text` kolonner i `orders`-tabellen. Vis i `/account/orders`.

### N6 · Søk mangler for 570 produkter ✏️ TODO
Ingen fritekst-søk. Kunder som søker etter spesifikk racket finner ingenting.  
**Fix:** Supabase `ilike`-spørring på `name` + `brand` med søkeinput i Nav/butikk-header.

---

## NICE TO HAVE

- **Merknader etter redusert bevegelse** — Legg til `@media (prefers-reduced-motion: reduce)` i `globals.css`
- **Frakt-progress i CartDrawer** — "Legg til X kr for gratis frakt"-melding
- **Kurv på tvers av enheter** — Synkroniser kurv til Supabase for innloggede brukere
- **"Varsle meg ved ny beholdning"** — E-post-opt-in for `out_of_stock`-produkter
- **Sorteringsalternativ** — Sorter produkter etter pris og merke
- **Produktanmeldelser** — Trustpilot-widget eller intern anmeldelses-tabell
- **Seksjoner med tilgjengelig navn** — Legg til `aria-labelledby` på alle `<section>` elementer

---

## Oppsummering av utført arbeid i denne sesjonen

### Nytt kode
| Fil | Beskrivelse |
|-----|-------------|
| `app/account/layout.tsx` | Auth-beskyttet layout med Nav + sidebar |
| `app/account/page.tsx` | Oversiktsside med siste ordrer + reiser |
| `app/account/orders/page.tsx` | Komplett ordrehistorikk |
| `app/account/trips/page.tsx` | Reisehistorikk med turdetaljer |
| `app/account/profile/page.tsx` | Profilredigeringsside |
| `app/account/profile/_components/ProfileForm.tsx` | Client-komponent for skjemainnsending |
| `app/account/addresses/page.tsx` | Leveringsadresser |
| `app/account/addresses/_components/AddressForm.tsx` | Client-komponent for adresseadministrasjon |
| `app/account/_components/AccountSidebar.tsx` | Navigasjon med utloggingsknapp |
| `supabase/migrations/017_user_addresses.sql` | Addresses-tabell med RLS + trigger |

### Sikkerhetsfikser
| Fil | Fiks |
|-----|------|
| `app/api/auth/callback/route.ts` | Forhindrer åpen redirect-angrep |
| `app/api/webhooks/stripe/route.ts` | Bruker serviceClient (ikke cookie-klient) for booking-oppdatering |
| `app/api/cron/padelpoint-sync/route.ts` | Cron-endepunkt krever alltid CRON_SECRET |
| `lib/actions/trips.ts` | Admin Server Actions beskyttet med `requireAdmin()` |

### Vipps betaling
Ingen kodeendring nødvendig — aktiver i Stripe-dashbordet:  
**Stripe Dashboard → Settings → Payment Methods → Vipps MobilePay → Aktiver**

### Google OAuth
Allerede implementert i `AuthModal.tsx`. Aktivér i Supabase-dashbordet:  
**Supabase Dashboard → Authentication → Providers → Google → Lim inn Client ID + Secret**

---

*Kjørt `npx tsc --noEmit` — ingen TypeScript-feil.*
