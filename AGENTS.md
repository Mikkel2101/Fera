<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Fera Padel — Agent Context

## Hva er dette prosjektet?

**Fera Padel** er en norsk netthandel- og reiseplattform for padel-entusiaster. To produkter under samme merkevare:

- **FeraTravels** (`/travels`) — padelreiser til Spania. Booking med Stripe-betaling.
- **FeraShop** (`/shop`) — padelutstyr (racketer, sko, vesker, baller etc.). Handlekurv med localStorage-persistering.

Målgruppe: norske padel-spillere. Alle brukervendte tekster er på norsk.

---

## Nåværende status (per 9. juni 2026)

**Ferdig og i produksjon:**
- FeraTravels: turlisteside `/travels`, turdetaljside `/travels/[id]`, booking-flyt (3 steg + Stripe), admin-panel `/admin`
- FeraShop: produktliste `/shop`, produktdetaljside `/shop/[id]`, cart-drawer med React Context + localStorage
- Delt Nav (`components/shared/Nav.tsx`) med cart-ikon og badge
- Hjemmeside `/` med hero, nyeste produkter, kommende turer, blogg-teaser

**Under arbeid / neste prioritet:**
- Stripe webhook for shop-checkout (`/api/webhooks/stripe` — stub finnes)
- FeraShop checkout-flyt

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
    webhooks/stripe/      ← Stripe webhook (stub)

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

## Samarbeidsworkflow (Mikkel + designer)

### Branches

```
main                  ← alltid deploybar, aldri commit direkte
design/[feature]      ← designerens branch (f.eks. design/shop-detail-polish)
feature/[feature]     ← utviklerbranch for ny funksjonalitet
fix/[bug]             ← bugfiks
```

### Ansvarsfordeling

| Område | Hvem |
|---|---|
| `components/shop/`, `components/travels/`, `components/shared/Nav.tsx` | Designer fritt territorium |
| `app/*/page.tsx`, `app/*/layout.tsx` (kun markup/styling) | Designer, men koordiner |
| `lib/`, `app/api/`, `supabase/` | Mikkel — ikke rør uten avtale |
| `app/globals.css` | Koordiner — fargetokens er felles |

### Workflow

1. Designer lager branch: `git checkout -b design/feature-navn`
2. Gjør endringer, commit med beskrivende melding
3. Push og lag PR på GitHub
4. Mikkel reviewer og merger

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
