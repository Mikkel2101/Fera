<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Fera Padel — Agent Context

## Hva er dette prosjektet?

**Fera Padel** er en norsk plattform for padel-entusiaster.

> **FOKUS (besluttet okt 2026): Travels + community.** All ny utvikling og design går til FeraTravels og (etter hvert) et medlemsområde. FeraShop ligger i dvale til lanseringen av egne FERA-varer og Padelpoint-API-et (2027). **Ikke bygg nye shop-funksjoner, og ikke slett shop-koden** — den skal brukes igjen.

- **FeraTravels** (`/travels`) — padelreiser til Spania. Uforpliktende reservasjon (Stripe-depositum kommer senere).
- **FeraShop** (`/shop`) — i dvale bak `NEXT_PUBLIC_SHOP_ENABLED`. `/shop/*` sender til `/kolleksjon`: venteliste for egne FERA-varer (påmeldinger i `newsletter_subscribers` med `brands = ['kolleksjon']`).

Målgruppe: norske padel-spillere. Alle brukervendte tekster er på norsk.

---

## Nåværende status (per 14. oktober 2026)

**Siden er offentlig:** `COMING_SOON=false` i Vercel Production (åpnet 13. oktober for brukertest). Sjekken ligger øverst i `proxy()` i `proxy.ts` — nye rewrites/redirects MÅ ligge etter den blokka. `COMING_SOON` er ikke satt for Preview. Å bytte verdien krever ny deploy før den trer i kraft.

**Publiserte turer:** fire Padelcamp-turer på Costa Blanca i april 2027 (`trip_type = 'Padelcamp'`). Alle fire viser nå samme FAQ (Bergens opprinnelige 7 spørsmål, synkronisert i migrasjon 051) — placeholder-FAQ fra 036 er historie. Hotell-, Alicante- og Costa Blanca-teksten og «+300 enkeltrom» er hardkodet i turdetalj-komponentene; det må gjøres datadrevet før en tur til et annet sted publiseres.

**E-post:** all avsender- og kontaktadresse er `post@ferapadel.com` (Resend, domenet er verifisert).

**Neste ledige migrasjon: 052** (001–051 er kjørt i prod).

**Ferdig:**
- FeraTravels: turlisteside `/travels`, turdetaljside `/travels/[id]`, booking er nå **uforpliktende reservasjon** (ingen Stripe-depositum ennå), admin-panel `/admin` med bekreft/kanseller/CSV-eksport
- FeraShop: produktliste `/shop`, produktdetaljside `/shop/[id]`, cart-drawer med React Context + localStorage, fritekst-søk på produkt/merke (`components/shop/ProductGrid.tsx`)
- FeraShop checkout: `app/shop/checkout/` — ett-stegs skjema (ikke 3-stegs som travels) → Stripe-hostet Checkout med server-side prisverifisering, fraktadresse (NO/SE/DK/FI), betalingslogoer (Visa/Mastercard/Vipps) i `CartDrawer.tsx`
- Stripe webhook (`app/api/webhooks/stripe/route.ts`, 176 linjer) — **ikke lenger stub**: håndterer `checkout.session.completed` for både bookings og shop-orders, sender bekreftelses-e-post (Resend), trigger auto-bestilling hos Padelpoint via GitHub Actions-dispatch
- Konto-sider: `/account/orders`, `/account/addresses`, `/account/profile`
- Delt Nav (`components/shared/Nav.tsx`) med cart-ikon og badge
- Hjemmeside `/` med hero, nyeste produkter, kommende turer, blogg-teaser

**FeraShop er skjult** bak `NEXT_PUBLIC_SHOP_ENABLED` (av som standard). Nattlig Padelpoint-sync er slått av (`.github/workflows/padelpoint-sync.yml`, kan kjøres manuelt). Ingen salgs-/rabattvisning (avtale med Padelpoint), og Bullpadel kan ikke selges (`restricted_brands`, migrasjon 022).

**Fikset oktober 2026:** webhook-idempotens, atomisk lagerlås + NOK-kurssnapshot på ordre, fokus-trap i AuthModal, Vipps-badge som CSS-token.

**Bekreftet fortsatt ikke bygget:**
- Ordresporing (ingen trackingnummer-felt eller fraktintegrasjon)
- Klarna (kun nevnt i docs/TODO, ikke implementert i Stripe checkout)

---

## Tech Stack

| Teknologi | Versjon | Merknad |
|---|---|---|
| Next.js | 16.2.7 | App Router. **Mange breaking changes fra v14/v15** |
| React | 19.2.4 | Server Components som standard |
| Tailwind CSS | v4 | Ingen `tailwind.config.js` — konfig i CSS |
| Supabase | `@supabase/ssr` 0.10.3 | Server + browser clients |
| Stripe | v22 | Betaling for reiser |
| TypeScript | v5 | Strict mode |
| Vitest | v4 | Testing |

---

## KRITISKE REGLER — LES DETTE FØRST

### Next.js 16

```ts
// params og searchParams er Promises i Next.js 16 — ALLTID await
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// searchParams likeså
export default async function Page({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams
}
```

### Tailwind v4 — CSS-variabel-syntaks

```tsx
// ✅ RIKTIG — parentessyntaks
<div className="bg-(--color-cta) text-(--color-dark) border-(--color-border)">

// ❌ FEIL — klammeparenteser er ugyldig i v4
<div className="bg-[--color-cta]">

// ❌ FEIL — hardkodede hex-verdier
<div className="bg-[#420016]">
```

**Ingen hardkodede fargeverdier noensinne. Bruk alltid CSS-tokens.**

### Supabase — Server vs. Client

```ts
// Server Components og Route Handlers:
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components ('use client'):
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Server vs. Client Components

- Default: Server Component (ingen direktiv nødvendig)
- Legg til `'use client'` øverst kun når komponenten bruker: `useState`, `useEffect`, `useContext`, event handlers (`onClick` etc.), eller nettleser-APIer
- Cart-komponenter er alltid Client Components (bruker `useCart`)

---

## Design System

### Fargepaletten

Alle tokens er definert i `app/globals.css` under `@theme {}`:

| Token | Hex | Bruksområde |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Sidebackgrunn |
| `--color-surface` | `#FFFFFF` | Kortbakgrunn (lys) |
| `--color-sand` | `#FFE1B0` | Varm accent-bakgrunn |
| `--color-ice` | `#D3ECED` | Kald accent-bakgrunn |
| `--color-ice-light` | `#E9F4F4` | Lysere is-nyanse |
| `--color-dark` | `#420016` | Mørk hero-bakgrunn, primær CTA |
| `--color-dark-mid` | `#7C0023` | Sekundær mørk nyanse |
| `--color-dark-card` | `#420016` | Kortbakgrunn i mørke seksjoner |
| `--color-text` | `#1C0008` | Brødtekst |
| `--color-muted` | `#9B7888` | Sekundærtekst, labels |
| `--color-subtle` | `#7A5868` | Tertiærtekst |
| `--color-gold` | `#7C0023` | Priser, merkevare-accent |
| `--color-cta` | `#420016` | Primærknapper |
| `--color-success` | `#3D7A4A` | Suksess, "på lager"-badges |
| `--color-border` | `#EDD8C8` | Kantlinjer, dividers |

### Typografi

```tsx
// Playfair Display — overskrifter, display
<h1 className="font-display font-bold">
<h2 className="font-display font-semibold">

// DM Sans — brødtekst, UI-elementer (standard)
<p className="font-sans">
<button className="font-sans font-medium">
```

Fontene lastes via `next/font` i layoutene. Bruk `font-display` og `font-sans` — **ikke** fontnavnene direkte.

### Typiske UI-mønstre

```tsx
// Primærknapp
<button className="bg-(--color-cta) text-white font-sans font-semibold rounded-full px-6 py-3 hover:bg-(--color-dark-mid) transition-colors">

// Sekundærknapp / outline
<button className="border border-(--color-border) text-(--color-text) font-sans font-medium rounded-full px-6 py-3 hover:bg-(--color-surface)">

// Badge / pill
<span className="bg-(--color-success) text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">

// Seksjon med mørk bakgrunn
<section className="bg-(--color-dark) text-white">

// Seksjon med sand-bakgrunn
<section className="bg-(--color-sand)">

// Kort (lys)
<div className="bg-white border border-(--color-border) rounded-2xl p-6">

// Kort (mørk — brukes i TripCard)
<div className="bg-(--color-dark-card) rounded-[14px] overflow-hidden">
```

---

## Fil- og mappestruktur

```
app/
  layout.tsx              ← Root layout (fonter, metadata)
  page.tsx                ← Hjemmeside /
  globals.css             ← Alle CSS-tokens (@theme), body-stiler
  travels/
    layout.tsx            ← FeraTravels layout (Nav + CartProvider)
    page.tsx              ← Turliste /travels
    [id]/
      page.tsx            ← Turdetalj /travels/[id]
      book/               ← Booking-flyt (3 steg)
  shop/
    layout.tsx            ← FeraShop layout (Nav + CartProvider + CartDrawer)
    page.tsx              ← Produktliste /shop
    [id]/
      page.tsx            ← Produktdetalj /shop/[id]
  admin/                  ← Admin-panel (beskyttet)
  api/
    auth/callback/        ← Supabase auth-callback
    travels/checkout/     ← Stripe checkout for reiser
    webhooks/stripe/      ← Stripe webhook (bookings + shop-orders)

components/
  shared/
    Nav.tsx               ← Delt navigasjon (Travels + Shop + Cart-ikon)
    AuthModal.tsx         ← Innloggingsmodal
  shop/
    ProductCard.tsx       ← Produktkort (brukes i grid og homepage)
    ProductGrid.tsx       ← Grid + kategorifilter
    CartDrawer.tsx        ← Slide-in handlekurv
    AddToCartButton.tsx   ← "Legg i kurv"-knapp (Client Component)
  travels/
    TripCard.tsx          ← Turkort (mørkt design)
    TripFilters.tsx       ← Filterrad for turer
    TripListClient.tsx    ← Klientside filter-logikk
    Nav.tsx               ← Re-eksporterer fra shared/Nav (bakoverkompatibilitet)
    detail/               ← Alle seksjoner på turdetaljside
      TripHero.tsx
      TripMetaBar.tsx
      TripProgram.tsx
      TripCoaches.tsx
      TripPrices.tsx
      TripIncluded.tsx
      TripExtras.tsx
      TripFaq.tsx
      WaitlistForm.tsx
  booking/
    BookingShell.tsx      ← Steg-basert booking-wrapper
    ProgressBar.tsx
    Step1PersonInfo.tsx
    Step2RoomExtras.tsx
    Step3Payment.tsx
  home/
    HomeCartProvider.tsx  ← CartProvider for hjemmeside
  admin/
    AdminNav.tsx
    TripForm.tsx

lib/
  supabase/
    server.ts             ← Supabase-klient for Server Components
    client.ts             ← Supabase-klient for Client Components
    types.ts              ← Auto-genererte DB-typer (Database type)
    proxy.ts              ← Proxy-klient (intern bruk)
  cart/
    context.tsx           ← CartProvider + useCart hook
    types.ts              ← CartItem, CartState typer
  booking/
    schema.ts             ← Zod-validering for booking-skjema
  actions/
    trips.ts              ← Server Actions for turer

supabase/migrations/
  002_travels_fase1.sql   ← Alle tabeller: users, trips, bookings, waitlist, etc.
  003_admin_rls.sql       ← Row Level Security for admin
  004_shop_products.sql   ← Products-tabell
```

---

## Datamodell

### Product (FeraShop)

```ts
type Product = {
  id: string
  name: string
  slug: string
  brand: string
  category: 'racket' | 'shoes' | 'bag' | 'balls' | 'clothing' | 'accessories'
  price_eur: number
  description: string | null
  images: string[]          // URL-array, images[0] er primærbilde
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  padelpoint_url: string | null
  published: boolean
  created_at: string
}
```

### Trip (FeraTravels)

```ts
type Trip = {
  id: string
  name: string
  destination: string
  hotel: string | null
  start_date: string        // ISO date
  end_date: string
  price_double_eur: number
  price_single_eur: number | null
  deposit_eur: number
  early_bird_price_double: number | null
  early_bird_deadline: string | null
  max_participants: number | null
  registered_count: number
  status: 'Utkast' | 'Åpen' | 'Få plasser' | 'Fullbooket' | 'Avlyst' | 'Gjennomført'
  trip_type: 'Åpen tur' | 'Klubbtur' | 'Privat' | 'Bedrift' | null
  description: string | null
  included: string[]
  not_included: string[]
  extras: Json              // [{name, price_eur, description}]
  coaches: Json             // [{name, bio, image}]
  faq: Json                 // [{question, answer}]
  main_image: string | null
  gallery_images: string[]
  published: boolean
}
```

---

## Cart-systemet

### CartProvider

Wrapper rundt shop-sider og hjemmeside. Gir tilgang til `useCart()`.

```tsx
// Sett opp i layout:
import { CartProvider } from '@/lib/cart/context'
<CartProvider>{children}</CartProvider>
```

### useCart() hook

```ts
const {
  items,           // CartItem[]
  addItem,         // (item: Omit<CartItem, 'quantity'>) => void — åpner cart automatisk
  removeItem,      // (product_id: string) => void
  updateQuantity,  // (product_id: string, quantity: number) => void
  clearCart,       // () => void
  totalItems,      // number — antall produkter (inkl. antall av hver)
  totalEur,        // number — total pris
  isOpen,          // boolean — om drawer er åpen
  openCart,        // () => void
  closeCart,       // () => void
} = useCart()
```

Cart persisteres i `localStorage` under nøkkelen `fera-cart`.

---

## Routing-oversikt

| URL | Komponent | Beskrivelse |
|---|---|---|
| `/` | `app/page.tsx` | Hjemmeside |
| `/travels` | `app/travels/page.tsx` | Turliste |
| `/travels/[id]` | `app/travels/[id]/page.tsx` | Turdetalj |
| `/travels/[id]/book` | `app/travels/[id]/book/page.tsx` | Booking steg 1 |
| `/shop` | `app/shop/page.tsx` | Produktliste |
| `/shop/[id]` | `app/shop/[id]/page.tsx` | Produktdetalj |
| `/admin` | `app/admin/(protected)/dashboard/page.tsx` | Admin |

---

## Supabase-mønstre

```ts
// Server Component — hent data
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
}

// Client Component — mutasjoner
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
await supabase.from('waitlist').insert({ email, trip_id })
```

**Proxy:** Supabase-klienten ruter gjennom `/api/supabase` (se `proxy.ts`). Dette er satt opp og skal ikke endres.

---

## Samarbeidsworkflow

Fra 14. oktober 2026 eier **Ida** (`ida-rebne`) den daglige utviklingen — design, kode og migrasjoner. Mikkel er tilgjengelig for beslutninger som ikke kan angres (se under).

### Branches

```
main                  ← alltid deploybar, aldri commit direkte (beskyttet)
design/[feature]      ← design/UI-endringer
feature/[feature]     ← ny funksjonalitet
fix/[bug]             ← bugfiks
```

**Lag alltid en ny branch fra oppdatert main for hver PR.** Ikke fortsett på en branch som allerede er merget — etter squash-merge ligger de gamle commitene igjen på branchen og blir med i neste PR.

### Workflow

1. `git checkout main && git pull`, så `git checkout -b design/feature-navn`
2. Små, hyppige PR-er — mindre konflikter
3. Kjør `npx tsc --noEmit` og `npx vitest run` før push. Alle tester skal være grønne
4. Push og lag PR. Vent til Vercel-preview er grønn og se på endringen der
5. **Squash-merge** (`gh pr merge <nr> --squash --delete-branch`) — aldri vanlig merge-commit
6. Etter merge: sjekk at Vercel-deployen av main er ferdig og at ferapadel.com svarer

### Drift: migrasjoner (Supabase)

Det finnes **ingen migrasjonshistorikk** i Supabase — filene i `supabase/migrations/` kjøres manuelt, én gang, mot prod (project id `dbvnuoayzevtoaolhqxd`), via Supabase-connectoren (`execute_sql`) eller SQL Editor (bytt rolle til `postgres` for DDL).

- **Nummer:** bruk neste ledige nummer (står i «Nåværende status» over) og sjekk `ls supabase/migrations` på oppdatert main før du lager fila. Oppdater «Neste ledige migrasjon» i denne fila i samme PR.
- **Aldri endre en migrasjon som er kjørt.** Lag en ny i stedet.
- **Rekkefølge mot deploy:** kjør migrasjoner som bare *legger til* (ny kolonne, ny funksjon) **før** merge, så den nye koden finner dem. Ting som fjerner noe koden i prod bruker (DROP, rename, ny funksjonssignatur som erstatter gammel) kjøres **etter** at den nye koden er deployet — ellers knekker prod i minuttene mellom.
- **DROP, DELETE og sletting av data krever Mikkels godkjenning** først. Det kan ikke angres.
- `CREATE POLICY IF NOT EXISTS` er ugyldig PostgreSQL — bruk `DROP POLICY IF EXISTS` + `CREATE POLICY`.
- Etter endring av funksjoner: `NOTIFY pgrst, 'reload schema';`

### Drift: filer og innhold

- **Repoet er offentlig.** Ingen hemmeligheter, og ingen ubrukte store bilder eller bilder av personer. Bilder som ikke brukes på siden, ligger i det private repoet `Mikkel2101/fera-media`.
- Koden skal ikke peke på filer som ligger i `.gitignore` — de finnes ikke på Vercel.
- Helseopplysninger (f.eks. allergier) er en særlig kategori i GDPR: nye felt som samler slikt må ha samtykketekst og stå i `/personvern`.
- Send aldri e-post eller meldinger til ekte kunder fra lokalt miljø. Lokal `.env.local` peker på **prod-databasen**.

### Lokalt oppsett

Se «Kom i gang» i `README.md`. Kort: `npm install`, kopier `.env.example` til `.env.local` og fyll inn verdiene du får fra Mikkel, `npm run dev`. Service role-, Stripe- og Resend-nøkler for prod ligger bare i Vercel.

---

## Kommandoer

```bash
npm run dev       # Start dev-server på localhost:3000
npm run build     # Bygg for produksjon
npm run lint      # ESLint
npm run test      # Vitest (enhetstester)
```

---

## Vanlige feil å unngå

1. **`params` uten `await`** — krasjer i Next.js 16. Alltid `const { id } = await params`.
2. **`[--color-*]` i Tailwind** — bruk `(--color-*)` med parenteser.
3. **Hardkodede farger** — bruk alltid tokens fra `globals.css`.
4. **`import { createClient } from '@/lib/supabase/server'` i Client Component** — bruk `/client`-varianten.
5. **Cart-hooks i Server Component** — `useCart()` krever `'use client'`.
6. **`<img>` i stedet for `<Image>`** — bruk alltid `next/image` for bilder. Legg til `unoptimized` for eksterne Supabase-URLer.
