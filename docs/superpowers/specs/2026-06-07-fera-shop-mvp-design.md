# Fera Padel — FeraShop MVP + FeraTravels Design-Spec

**Dato:** 2026-06-07
**Status:** Klar for implementering
**Scope:** FeraShop MVP + FeraTravels design-spec implementering + Stripe webhook + Vercel deploy
**Mål:** Fungerende, deployet platform til Padelpoint-møte onsdag 2026-06-11

---

## 1. Overordnet arkitektur

```
Supabase
  └── products (nytt) + trips/bookings (eksisterende)

/travels/*         → FeraTravels (eksisterende funksjonalitet, ny design)
/shop              → FeraShop produktliste
/shop/[id]         → FeraShop produktdetalj
Cart               → Global React Context + localStorage (slide-in drawer)

/api/webhooks/stripe → Fullfører eksisterende stub
Vercel             → Deploy av hele appen
```

---

## 2. Database — `products`-tabell

```sql
CREATE TABLE public.products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  brand           text NOT NULL,
  category        text NOT NULL,          -- 'racket' | 'shoes' | 'bag' | 'balls' | 'clothing' | 'accessories'
  description     text,
  price_eur       numeric(10,2) NOT NULL,
  images          text[] DEFAULT '{}',    -- Supabase Storage URLs
  stock_status    text DEFAULT 'in_stock', -- 'in_stock' | 'low_stock' | 'out_of_stock'
  padelpoint_id   text,                   -- referanse til Padelpoint-produktID
  padelpoint_url  text,                   -- direkte URL til kildeprodukt
  published       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- RLS: public read, admin write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON public.products
  FOR SELECT USING (published = true);
CREATE POLICY "Admin can manage products" ON public.products
  USING (is_admin());
```

**Produktimport:** 10–20 produkter importeres manuelt via Supabase Studio fra tiendapadelpoint.com. Bilder lastes opp til Supabase Storage bucket `products/`.

---

## 3. Design-tokens

Samme `@theme`-tokens som FeraTravels (Palett C — Dorado). Ingen nye tokens trengs. FeraShop bruker lys variant av paletten:

- Sidebakgrunn: `color-bg` (#FFFCF5)
- Kortbakgrunn: `color-surface` (#FFFFFF)
- Alternerende seksjoner: `color-sand` (#F5F0E8)
- Priser og aksenter: `color-gold` (#C49A3C)
- CTA-knapper: `color-cta` (#E8752A)

---

## 4. Navigasjon (delt)

Nav oppdateres til å håndtere begge brands:

```
Desktop:
[FERA \ PADEL]   Shop   Eventer   Inspirasjon      🛒 (antall)

- Logo: "FERA" i font-display bold, "\ PADEL" i color-gold
- "Shop" lenker til /shop, "Eventer" til /travels
- 🛒 åpner cart-drawer; viser antall produkter i kurven som badge
- Bakgrunn: #fff, border-bottom color-border, sticky
```

Mobil: hamburger-meny, cart-ikon alltid synlig i header.

**Implementasjon:** `components/travels/Nav.tsx` flyttes til `components/shared/Nav.tsx` og oppdateres. Begge `app/travels/layout.tsx` og `app/shop/layout.tsx` importerer fra ny plassering.

---

## 5. FeraShop — `/shop`

### Hero-seksjon
- Bakgrunn: `color-sand`
- Label: "PADELUTSTYR & TILBEHØR" i small-caps, `color-gold`
- Heading: "Padelutstyr fra *Spania*" — *Spania* i Playfair italic, `color-gold`
- Ingress: "Offisiell Padelpoint-partner — rask levering til Norge"

### Filter-rad
- Bakgrunn: `#fff`, border-bottom `color-border`
- To `<select>` dropdowns: Alle merker | Alle kategorier
- Filtrering skjer client-side

### Produktgrid
- Bakgrunn: `color-bg`
- 3 kolonner desktop, 2 tablet, 1 mobil
- Hvite kort (`color-surface`), `border-radius: 12px`, border `color-border`
- Per kort:
  - Produktbilde (top, `aspect-ratio: 1`)
  - Brand (small-caps, `color-muted`)
  - Produktnavn (DM Sans medium, `color-text`)
  - Pris i `color-gold` (stor)
  - Lagerstatus-badge (grønn "På lager" / amber "Få igjen" / grå "Utsolgt")
  - "Se detaljer →" lenke

---

## 6. FeraShop — `/shop/[id]`

### Layout (desktop: 2 kolonner)
**Venstre:** Produktbilder (primærbilde stor, thumbnails under)
**Høyre:**
- Brand (small-caps, `color-muted`)
- Produktnavn (Playfair Display, stor)
- Pris i `color-gold`
- Lagerstatus-badge
- Beskrivelse (DM Sans, `color-text`)
- "Legg i kurv"-knapp (`color-cta`, pill, full bredde)
  - Åpner cart-drawer automatisk etter klikk
- "← Tilbake til butikken"-lenke

### Mobil
Bildene stables over produktinfo, én kolonne.

---

## 7. Cart-drawer

Global state via React Context + localStorage. Persisteres på tvers av sidenavigasjon.

### Struktur
```
[Overlay — klikk for å lukke]
[Drawer — glir inn fra høyre, max-width: 400px]
  Header: "Handlekurv (N)" + ✕-knapp
  Produktliste:
    - Bilde (40x40) + navn + antall-kontroll (- N +) + pris
    - Fjern-lenke per produkt
  Footer:
    - "Totalt: € X"
    - "Gå til kasse →" CTA (color-cta) — Stripe-integrasjon er fase 2
    - "Fortsett å handle"-lenke (lukker drawer)
```

### State-shape (localStorage: `fera-cart`)
```typescript
type CartItem = {
  product_id: string
  name: string
  brand: string
  price_eur: number
  image: string
  quantity: number
}
type CartState = {
  items: CartItem[]
}
```

---

## 8. FeraTravels — design-spec implementering

Implementerer eksisterende spec `docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md` fullt ut. Spesifikasjonen er komplett — se den for alle detaljer.

**Komponenter som oppdateres:**
- `components/travels/Nav.tsx` — logo-format, font, sticky, cart-ikon
- `components/travels/TripCard.tsx` — mørk kortbakgrunn, Playfair heading, gold pris
- `app/travels/page.tsx` + `components/travels/TripListClient.tsx` — mørk hero, filter-rad
- `components/travels/detail/*` — alle seksjoner per spec
- `components/booking/*` — progress-bar, steg-layout

---

## 9. Stripe webhook

Fullfører `app/api/webhooks/stripe/route.ts`:

```typescript
// 1. Verifiser Stripe-signatur (stripe.webhooks.constructEvent)
// 2. Håndter: checkout.session.completed
//    → UPDATE bookings
//       SET deposit_status = 'paid',
//           deposit_date = now(),
//           stripe_session_id = session.id
//       WHERE id = session.metadata.booking_id
// 3. Return 200
```

---

## 10. Vercel deploy

**Miljøvariabler som må settes i Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Stripe webhook endpoint:** Etter deploy registreres `https://<domain>/api/webhooks/stripe` i Stripe Dashboard → Webhooks. Event: `checkout.session.completed`.

**Etter deploy:** Produkter importeres manuelt via Supabase Studio (Table Editor → products). Bilder lastes opp til Storage bucket `products/`.

---

## 11. Utenfor scope (denne fasen)

- Stripe-betaling i FeraShop (fase 2)
- Automatisk produktsynk mot Padelpoint API
- Brukerprofil / innlogging for shop-kunder
- Admin-panel for produkter
- Inspirasjon/blogg
- VOEC/MVA-håndtering
