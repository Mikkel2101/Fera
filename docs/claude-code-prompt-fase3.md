# Fera Padel — Handoff til neste Claude-sesjon (fase 4)
**Oppdatert:** 20. juni 2026

---

## Les dette først
Les `AGENTS.md` og alle filer i `memory/` i sin helhet før du gjør noe.

---

## Protokoll: "times up ny chat"
Når Mikkel skriver **"times up ny chat"**, skal du alltid gjøre dette FØR du avslutter:
1. Oppdater alle relevante memory-filer i `/Users/Mikkel/.claude/projects/-Users-Mikkel-Documents-Projects-Fera/memory/` (project-fera-foundation.md, og opprett nye hvis nødvendig)
2. Oppdater `MEMORY.md`-indeksen
3. Overskriv `docs/claude-code-prompt-fase3.md` med en fullstendig, oppdatert handoff-prompt til neste chat — inkluder alt som er gjort, alt som gjenstår, og neste sesjon sine prioriteter
4. Bekreft at minne og prompt er lagret

---

## Overordnet mål for denne og kommende sesjoner
Backend er solid. Nå er fokuset **kundereisen og konvertering** — FeraShop skal føles som en verdensklasse nettbutikk, ikke en prototype. Norske padel-entusiaster betaler gjerne for premium hvis opplevelsen er premium.

---

## Oppgave 1 (gjør dette FØR du koder): Konkurranseanalyse og best practice-research

Bruk WebSearch og WebFetch til å analysere hva de beste nettbutikkene gjør. Skriv funnene til `docs/shop-research-2026.md` — bruk dette som grunnlag for all koding i denne sesjonen.

### Norske referanser å se på:
- **outnorth.no** — premium outdoor, sterk UX og produktpresentasjon
- **stormberg.no** — norsk merkevare, enkel og tillitsvekkende
- **helly-hansen.com** — internasjonal kvalitet, god mobilopplevelse
- **xxl.no** — stor katalog, hvordan håndterer de søk og filtrering?
- **norrøna.com** — premium nettbutikk, visuelt sterk

### Internasjonale padel/sport-referanser:
- **padelnuestro.com** — verdens største padel-shop, se på produktside og UX
- **tennis-point.com** — racket-sport nettbutikk med god UX
- **end.clothing** / **ssense.com** — premium layout og produktpresentasjon

### Baymard Institute (bransjebibel for e-commerce UX):
- Søk etter: "Baymard Institute checkout usability best practices"
- Søk etter: "Baymard product listing page best practices"
- Søk etter: "Baymard product detail page mobile best practices"

### Spørsmål research skal besvare:
1. Hva gjør de beste **produktkortene** annerledes? (hover-effekter, info-hierarki, CTA-plassering)
2. Hva er **filtreringsopplevelsen** på de beste butikkene?
3. Hva gjør de beste **produktsidene**? (bildekarusell, størrelsesveiledning, trust signals, anbefalinger)
4. Hva er **mobile checkout best practices** i 2025/2026?
5. Hvilke **trust signals** konverterer best for norske kunder?
6. Hva gjør en **handlekurv-drawer** fra god til utmerket?

---

## Oppgave 2: FeraShop UI-overhaling

Basert på research-funnene: gi hele shoppen en visuell og UX-messig overhaling. Tenk brukerreise fra første besøk til betaling.

### Brukerreise å designe for:
```
Hjemmeside → Butikk (/shop) → Produktkategori/søk → Produktside → Legg i kurv → Checkout → Bekreftelse
```

### 2a. Butikkliste-siden (`/shop/page.tsx`) — gjør dette:
- **Hero-banner** øverst: "570+ produkter fra verdens beste padel-merkevarer" med et sterkt bilde
- **Kategorinavigasjon** som ikoner/pills øverst (Racketer 🎾 / Sko 👟 / Vesker 👜 / Baller / Klær / Tilbehør)
- **Søkefelt** (fritekst på navn + brand, Supabase `ilike`) — searchParams i Next.js 16 = Promise
- **Sortering**: Pris lav→høy, høy→lav, Nyeste, Salg
- **Produktgrid**: Større kort, bedre bildeproporsjon — se på hva research sier
- **Merke-filter** i sidebar eller som pills
- **Antall produkter** synlig: "Viser 24 av 570 produkter"
- **Tom tilstand**: Hvis ingen resultater → foreslå andre kategorier

### 2b. Produktkort (`/components/shop/ProductCard.tsx`) — gjør dette:
- **Hover-effekt**: sekundærbilde vises ved hover (hvis `images[1]` finnes)
- **Raskere kjøp**: "Legg i kurv"-knapp vises ved hover på desktop
- **Salg-badge**: allerede implementert — gjør den mer prominent
- **Brand-badge**: subtil øverst i kortet
- **Bilde-ratio**: konsistent, produktet skal fylle rammen godt

### 2c. Produktdetaljside (`/shop/[id]/page.tsx`) — gjør dette:
- **Bildekarusell**: klikk mellom bilder, thumbnails under (allerede delvis bygget — forbedre)
- **"Sticky" kjøp-seksjon** på mobile: pris + "Legg i kurv"-knapp følger med ned
- **Trust bar** under kjøp-knapp: 🔒 Trygg betaling · ↩️ 14 dagers angrerett · 🚚 Frakt til Norge
- **Produktdetaljer-seksjon**: Merke, kategori, vist som strukturert tabell
- **"Du ser også på"**: relaterte produkter fra samme kategori (allerede delvis implementert)
- **Brødsmuler** øverst: Home → Shop → [Kategori] → [Produktnavn]

### 2d. CartDrawer (`/components/shop/CartDrawer.tsx`) — gjør dette:
- **Frakt-progress**: "Legg til kr 340 for gratis frakt!" med progressbar
- **Betalingslogoer**: Vipps + Visa + Mastercard som SVG-ikoner i footer
- **Produktbilde**: allerede der — sørg for at det er stort nok
- **Upsell**: "Kunder kjøper også" — ett relevant produkt fra samme kategori som siste tillagte

### 2e. Checkout-siden (`/shop/checkout/`) — MANGLER HELT, bygg fra scratch:
Dette er den viktigste siden å bygge — CartDrawer lenker hit men siden eksisterer ikke.

Bygg:
- `app/shop/checkout/page.tsx` — selve checkout-siden (Client Component)
- `app/shop/checkout/success/page.tsx` — takk-siden etter betaling
- `app/shop/checkout/cancel/page.tsx` — avbryt-siden

Checkout-siden skal:
- Vise cart-innhold (readonly) med produktbilder, navn, antall, NOK-pris
- Skjema: Fornavn, Etternavn, E-post, Telefon (valgfritt), huk av for vilkår
- Vise NOK-total + fraktlinje ("Gratis" eller "+ kr 240 frakt")
- Vise tollvarsel i sand-boks (ikke skjule den, det er et tillits-signal at vi er ærlige)
- Knapp "Gå til betaling →" → `POST /api/shop/checkout` → redirect til Stripe URL
- Loading-tilstand mens Stripe-session opprettes
- Feilhåndtering hvis API returnerer 422 (utsolgt produkt)

---

## Oppgave 3 (etter UI-overhaling): Tekniske fikser

### B6 — Opprett Stripe-sesjon FØR ordre i DB
`app/api/shop/checkout/route.ts` — ordre opprettes i DB før Stripe bekrefter (race condition).
**Fix:** Opprett Stripe-sesjon FØRST → insert ordre med `stripe_session_id` kjent fra start.

### B9 — EUR i /account/orders
`app/account/orders/page.tsx` viser `€`-symbol. Stripe charger i NOK nå. Vis NOK konsekvent.
`total_eur` beholdes i DB for B2B, men konverter for visning: `formatNok(eurToNok(total_eur, nokRate))`.

---

## Hva er gjort (du trenger ikke gjøre dette igjen)

### Sesjon 1 (fase 3)
- `/account`-seksjon: oversikt, ordrehistorikk, reisehistorikk, profilredigering, leveringsadresser
- Auth-callback åpen redirect lukket
- Stripe webhook: bruker `createServiceClient()` (ikke cookie-klient)
- Cron-endepunkt: krever alltid CRON_SECRET
- Server Actions (`lib/actions/trips.ts`): `requireAdmin()` guard
- Migrasjon 017: `addresses`-tabell med RLS + trigger ✅ KJØRT
- Vipps-integrasjon: `vipps_preview=v1` header, NOK-valuta i begge checkout-routes
- Best-in-class review av 5 agenter — action-liste i `docs/review-action-list-2026-06-20.md`

### Sesjon 2 (fase 4 del 1)
- **K1:** Prismanipulasjon fikset — `app/api/shop/checkout/route.ts` henter pris fra `products`-tabellen server-side, ignorerer klient-pris, validerer `published` + `stock_status`
- **K4:** Ordrebekreftelse e-post til kunden — `sendCustomerOrderConfirmation()` i `lib/shop/email.ts`, sendes fra webhook med NOK-total fra `session.amount_total`
- **K6/N1:** Tollvarsel (25% MVA) og 14 dagers angrerett synlig i CartDrawer og produktdetaljside
- **B4:** Stripe webhook idempotens — sjekker `stripe_session_id` mot DB, hopper over duplikater
- **B5/B4:** Migrasjon 018 — UNIQUE constraints + DB-indekser på alle fremmednøkler ✅ KJØRT
- **B7:** Migrasjon 019 — booking INSERT-policy krever `auth.uid() IS NOT NULL`, travels checkout bruker `createServiceClient()` for insert ✅ KJØRT
- **B10:** Error boundaries — `app/error.tsx`, `app/shop/error.tsx`, `app/travels/error.tsx`
- **N2:** Org.nr placeholder i footer — `[FYLL INN]` i `components/shared/Footer.tsx` linje ~93

---

## Manuelle steg som GJENSTÅR (Mikkel må gjøre disse selv)

1. ~~Roter SUPABASE_SERVICE_ROLE_KEY~~ ✅ GJORT — ny Supabase secret key opprettet, Vercel + GitHub Secrets oppdatert. Husk å slette den gamle "default" secret-nøkkelen i Supabase-dashbordet.

2. **Aktiver Vipps** — Stripe Dashboard → Settings → Payment Methods → Vipps MobilePay (Private Beta)

3. **Aktiver Klarna** — Stripe Dashboard → Settings → Payment Methods → Klarna (norsk fakturabetaling)

4. **Aktiver Google OAuth** — Supabase Dashboard → Authentication → Providers → Google
   - Krev Google Cloud Console OAuth-app med Client ID + Secret

5. **Fyll inn org.nr i footer** — søk `[FYLL INN]` i `components/shared/Footer.tsx` linje ~93

6. **Send grossistavtale til Willie** — willie.lizier@grupopadelpoint.com (Padelpoint B2B-oppgradering)

---

## Hva bør denne sesjonen fokusere på (prioritert rekkefølge)

### 1. FeraShop checkout-siden (høyest prioritet — blokkerer salg)
`/shop/checkout` mangler. CartDrawer sender brukeren dit men siden finnes ikke.

Bygg `/app/shop/checkout/page.tsx` + nødvendige komponenter:
- Skjema: fornavn, etternavn, e-post, telefon, aksept av vilkår
- Viser cart-innhold (readonly)
- Viser NOK-total + fraktlinje
- Knapp → `POST /api/shop/checkout` → redirect til Stripe Checkout URL
- Vis tollvarsel (`Merk: Toll og mva. 25% betales til UPS ved levering`)
- Vis 14 dagers angrerett
- Vis `/shop/checkout/success` og `/shop/checkout/cancel` sider (stubs mangler)

### 2. B6 — Opprett Stripe-sesjon FØR ordre i DB
I `app/api/shop/checkout/route.ts` linje ~35 opprettes ordren i DB før Stripe bekrefter.
Hvis Stripe krasjer → foreldreløs `pending_payment`-ordre i DB.

**Fix:**
1. Opprett Stripe-sesjon FØRST
2. Deretter `insert` ordre med `stripe_session_id` allerede kjent
3. Bruk Stripe-sesjonens `metadata` til å lagre ordre-metadata som trengs i webhook

### 3. B9 — EUR-symbol i /account/orders
`app/account/orders/page.tsx` viser `€`-symbol på linjeposter. Etter K5-fiksen charger Stripe i NOK.
Vis NOK konsekvent i ordrehistorikken. `total_eur` lagres fremdeles i DB (for B2B-avstemming), men vis det omregnet til NOK.

### 4. N6 — Fritekst-søk i butikken
570 produkter, ingen søkefunksjon. Implementer Supabase `ilike`-søk:
- Legg til søkefelt i `app/shop/page.tsx` (server component med searchParams)
- `supabase.from('products').select('*').ilike('name', '%${q}%').or('brand.ilike.%${q}%')`
- Remembers: `searchParams` er Promise i Next.js 16 — `const { q } = await searchParams`

### 5. N4 — Betalingslogoer i CartDrawer
Legg til Vipps, Visa og Mastercard SVG-logoer i CartDrawer-footer (under "Gå til kasse"-knappen).
Bruk enkle SVG inline eller legg filer i `public/`. Vis som kleine ikoner på en rad.

---

## Kritiske kode-regler

### Next.js 16
```ts
// params OG searchParams er Promises — alltid await
export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { id } = await params
  const { q } = await searchParams
}
```

### Tailwind v4
```tsx
// ✅ riktig — parentessyntaks
<div className="bg-(--color-cta) text-(--color-dark)">
// ❌ feil — klamme
<div className="bg-[--color-cta]">
// ❌ feil — hardkodet hex
<div className="bg-[#420016]">
```

### Supabase — riktig klient
```ts
// Server Components / Route Handlers (cookie-basert auth):
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components ('use client'):
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Webhooks / bakgrunns-API (bypasser RLS):
import { createServiceClient } from '@/lib/supabase/service'
const supabase = createServiceClient()
```

### Stripe (Vipps krever NOK)
```ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-05-27.dahlia; vipps_preview=v1' as any,
})
// currency: 'nok', unit_amount: eurToNok(price, rate) * 100 // øre
```

### Valuta
```ts
import { fetchEurNokRate, eurToNok, formatNok } from '@/lib/currency'
// Server: const nokRate = await fetchEurNokRate()
// Client: const nokRate = useNokRate() fra '@/lib/currency/context'
```

---

## Fargesystem

Alle tokens i `app/globals.css` under `@theme {}`. Viktigste:
- `--color-cta` / `--color-dark` = `#420016` (mørk burgunder — primær)
- `--color-sand` = `#FFE1B0` (varm accent-boks)
- `--color-ice-light` = `#E9F4F4` (lys kort-bakgrunn)
- `--color-text` = `#1C0008`, `--color-muted` = `#9B7888`, `--color-border` = `#EDD8C8`
- `--color-success` = `#3D7A4A`, `--color-gold` = `#7C0023` (priser)

Typografi: `font-display` (Playfair Display — overskrifter), `font-sans` (DM Sans — brødtekst)

---

## Fil- og mappestruktur (viktigste)

```
app/
  account/
    layout.tsx, page.tsx, orders/page.tsx, trips/page.tsx
    profile/page.tsx + _components/ProfileForm.tsx
    addresses/page.tsx + _components/AddressForm.tsx
    _components/AccountSidebar.tsx
  shop/
    layout.tsx
    page.tsx                    ← Produktliste (har kategorifilter)
    [id]/page.tsx               ← Produktdetalj (har tollvarsel + angrerett)
    checkout/                   ← MANGLER — høyeste prioritet å bygge
    error.tsx
  travels/
    layout.tsx, page.tsx, [id]/page.tsx, [id]/book/page.tsx
    error.tsx
  api/
    shop/checkout/route.ts      ← Server-side prisvalidering fra DB
    travels/checkout/route.ts   ← NOK, serviceClient for insert
    webhooks/stripe/route.ts    ← Idempotent, sender kunde-email
  error.tsx

components/
  shared/
    Nav.tsx, Footer.tsx (org.nr: [FYLL INN] linje ~93), AuthModal.tsx
  shop/
    ProductCard.tsx, CartDrawer.tsx, AddToCartButton.tsx

lib/
  supabase/server.ts / client.ts / service.ts / types.ts
  currency.ts / currency/context.tsx
  cart/context.tsx              ← useCart()
  shop/email.ts                 ← sendOpsOrderEmail() + sendCustomerOrderConfirmation()
  shop/schema.ts                ← shopCheckoutSchema

supabase/migrations/            ← 001–019 alle kjørt
```

---

## Datamodell

### Product
```ts
{ id, name, slug, brand, category, price_eur, description, images: string[],
  stock_status: 'in_stock'|'low_stock'|'out_of_stock', padelpoint_url, published,
  is_on_sale, previous_price_eur }
```

### Order
```ts
{ id, first_name, last_name, email, phone, status, items: CartItemData[],
  total_eur, stripe_session_id (UNIQUE), shipping_address: jsonb, created_at }
// status: 'pending_payment' | 'paid' | 'ordered_at_supplier' | 'shipped' | 'delivered' | 'cancelled'
```

### Booking
```ts
{ id, trip_id, user_id, first_name, last_name, email, phone, padel_level,
  room_type, roommate_name, selected_extras, deposit_status, deposit_date,
  stripe_session_id (UNIQUE), gdpr_consent, terms_accepted }
```

### Address
```ts
{ id, user_id, label, full_name, address1, address2, postal_code, city,
  country (default 'NO'), is_default, created_at }
```

---

## Padelpoint B2B

- Kontakt: **Willie Lizier** — willie.lizier@grupopadelpoint.com
- Scraper-bruker: post@ferabrand.com på tiendapadelpoint.com
- Playwright auto-reorder bot: **IKKE produksjonsklar** — venter Willie sin grossist-oppgradering
- **Babolat er forbudt å selge** (eksklusiv distribusjonsavtale)
- Frakt: fra Spania — kunder betaler toll + 25% MVA til UPS ved levering

---

## Env vars (alle satt i Vercel ✅)

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY  ← ROTER DENNE (se manuelle steg)
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_BASE_URL=https://ferabrand.com
RESEND_API_KEY, OPS_EMAIL=post@ferabrand.com
CRON_SECRET
FERAGIT_DISPATCH_TOKEN, FERAGIT_OWNER=Mikkel2101, FERAGIT_REPO=Fera
```

---

## Verktøy på maskinen

- **brew:** `/usr/local/bin/brew` (Intel Mac)
- **gh CLI:** `/usr/local/bin/gh`, innlogget som Mikkel2101
- **Vercel:** `npx vercel`, innlogget som mikkel2101
- **Supabase SQL Editor:** postgres-rolle for DDL. `CREATE POLICY IF NOT EXISTS` er ugyldig PostgreSQL — bruk `DROP POLICY IF EXISTS` + `CREATE POLICY`.
