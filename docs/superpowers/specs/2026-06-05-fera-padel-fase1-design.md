# Fera Padel — Fase 1 Design Spec

**Dato:** 2026-06-05  
**Status:** Klar for implementering  
**Neste steg:** Implementasjonsplan (writing-plans)

---

## 1. Produktbeskrivelse

**Fera Padel** er én samlet nettside som tilbyr padelutstyr (shop) og profesjonelle padelreiser til Spania (eventer). Fase 1 dekker eventer-delen med turliste, turdetaljer og depositumbooking via Stripe. Shoppen er fase 2.

**Tagline:** "Alt du trenger til padel og profesjonelle padelreiser til Spania"

---

## 2. Design Tokens (globals.css)

Alle verdier bor i `globals.css` under `@theme` — samboeren bytter uttrykket ved å endre denne ene filen.

```css
@theme {
  /* === PALETT C — DORADO ===
     Inspirasjon: sen kveld på terrassen, espresso,
     stearinlys og gyllent lys i Alicante */

  /* Bakgrunner */
  --color-bg:        #FFFCF5;   /* varm elfenben — sidebakgrunn */
  --color-surface:   #FFFFFF;   /* kortbakgrunn */
  --color-sand:      #F5F0E8;   /* alternerende seksjoner */

  /* Hero / mørk seksjon */
  --color-dark:      #1C1410;   /* dyp espresso */
  --color-dark-mid:  #3D2A1C;   /* varm mellomton */
  --color-dark-card: #2C1A0E;   /* kortbakgrunn i hero */

  /* Tekst */
  --color-text:      #1C1410;   /* primærtekst */
  --color-muted:     #B0A090;   /* sekundærtekst / metadata */
  --color-subtle:    #7A6A5A;   /* nav-lenker */

  /* Merkevare */
  --color-gold:      #C49A3C;   /* logo-aksent, priser, italic */
  --color-cta:       #E8752A;   /* CTA-knapper, badges */
  --color-success:   #5D9E6A;   /* "Åpen"-badge */

  /* Border */
  --color-border:    #EDE5D8;   /* subtile skillelinjer */

  /* Fonter (settes av next/font i layout) */
  --font-display: var(--font-playfair);   /* Playfair Display — headings */
  --font-sans:    var(--font-dm-sans);    /* DM Sans — brødtekst */
}
```

> **For UI/UX-designer:** Bytt farger og fonter her. Legg til ny `--font-*` variabel og oppdater `next/font`-importen i `app/travels/layout.tsx`.

---

## 3. Routes

```
/travels                      → Turlistevisning
/travels/[id]                 → Turdetaljside  ([id] = Supabase UUID, f.eks. "6a064f8c-...")
/travels/[id]/book            → Bookingflyt (3 steg)
/travels/[id]/book/success    → Bekreftelsesside etter Stripe
/travels/[id]/book/cancel     → Avbrytside

/api/travels/checkout         → POST — oppretter Stripe Checkout Session
/api/webhooks/stripe          → POST — oppdaterer booking etter betaling
```

---

## 4. Nav

### Desktop
```
[FERA \ PADEL]    Shop  Eventer ▾  Inspirasjon         Profil  🛒
```

- Logo: "FERA" i `font-display` bold, `\ PADEL` i `color-gold` regular
- Nav-lenker: `color-subtle`, 13px DM Sans
- Eventer-dropdown: Bedrifter · Klubber & trenere · Lag & vennegjenger · Skoler & foreninger
- CTA "Se turer": `color-cta` pill-knapp
- Bakgrunn: `#fff`, border-bottom `color-border`
- Sticky på scroll

### Mobil
Hamburger-meny. Dropdown kollapser til enkel liste.

---

## 5. Turlistevisning (`/travels`)

### Hero-seksjon (mørk)
- Bakgrunn: gradient `color-dark` → `color-dark-mid`
- Label: "KOMMENDE TURER" i small-caps, `color-gold`
- Heading: "Finn ditt neste *eventyr*" — *eventyr* i Playfair italic, `color-gold`
- Ingress: lys muted tekst

### Filter-rad (lys)
- Bakgrunn: `#fff`, border-bottom `color-border`
- Tre `<select>` dropdowns: Alle aktiviteter | Alle destinasjoner | Alle typer
- Filtrering skjer client-side (ingen ny fetch)

### Kortgrid
- Bakgrunn: `color-sand`
- 3 kolonner desktop, 2 tablet, 1 mobil
- Kort: `color-dark-card` bakgrunn, `border-radius: 14px`
- Innhold per kort:
  - Bildeplass (top): mørk gradient + "FERA" watermark + status-badge (top-right) + early-bird-badge (bottom-left)
  - Korttype (small-caps muted)
  - Turnavnet (Playfair, hvit)
  - Metadata: dato · destinasjon · ledige plasser (muted tekst)
  - Footer: pris i `color-gold` (stor) + "Se detaljer →" eller "Venteliste →"

**Status-badges:**
| Status | Farge | Tekst |
|--------|-------|-------|
| `published, open` | `color-success` grønn | "Åpen" |
| `< 20% plasser igjen` | `color-cta` amber | "X plasser igjen" |
| `full` | rgba hvit 20% | "Utsolgt" |
| `draft` | vises ikke |  |

**Data:** Server-side fetch fra Supabase `trips` tabell, `published = true`, sortert på `start_date`.

---

## 6. Turdetaljside (`/travels/[id]`)

### Hero (mørk, fullbredde)
- Bakgrunn: gradient `color-dark` → `color-dark-mid`
- Status-badge (grønn pill)
- Heading: turavnets i Playfair Display, hvit, stor (48px+)
- Evt. stor hero-bildefil hvis `main_image` finnes — med mørk overlay

### Metadata-rad (lys)
- Bakgrunn: `#fff`, border-bottom `color-border`
- Ikonpills: 📅 Dato · 📍 Destinasjon · 🏨 Hotell · 💶 Pris fra · 👥 Ledige plasser
- Sticky "Book din plass"-knapp til høyre (amber, pill, `color-cta`)

### Innholdsseksjoner (alternerende `#fff` og `color-sand`)
1. **Beskrivelse** — brødtekst fra `description`
2. **Dag-for-dag program** — fra `program` (markdown/tekst)
3. **Hva er inkludert** — grønne checkmarks fra `included[]`
4. **Tilvalg (extras)** — fra `extras` JSON: navn + pris
5. **Møt coachene** — fra `coaches` JSON-array: `[{ name, title, bio }]` — avatar-sirkel med initialer
6. **Priser** — dobbeltrom / enkeltrom fra `price_double_eur` / `price_single_eur`, depositum `deposit_eur`
7. **FAQ** — accordion fra `faq` JSON

### Waitlist (utsolgt)
Hvis `status = 'full'`: skjul "Book din plass", vis "Meld deg på venteliste" — enkel e-post-input som poster til `waitlist`-tabellen.

---

## 7. Bookingflyt (`/travels/[id]/book`)

Multi-steg på hel side. Tre steg + Stripe + Success.

```
Steg 1: Personinfo → Steg 2: Rom & tilvalg → Steg 3: Stripe Checkout → Success
```

### Layout
- Hvit nav (sticky)
- "← Tilbake til turen" lenke
- Progress-bar: 3 steg, `color-cta` fill
- Steg-labels: Opplysninger · Rom & tilvalg · Betaling

### Steg 1 — Personinfo
Felter: Fornavn\* | Etternavn\* | E-post\* | Telefon | Padelnivå (dropdown)  
Validering: Zod på client (blur) og server (POST)  
CTA: "Neste: Rom & tilvalg →"

### Steg 2 — Rom & tilvalg
- Romtype: Dobbeltrom / Enkeltrom (radio)
- Romperson (valgfritt): tekstfelt "Hvem deler du rom med?"
- Tilvalg: checkboxes fra `extras` JSON (navn + pris per stk)
- Prisoppsummering: depositum + valgte tilvalg
- CTA: "Gå til betaling →"

### Steg 3 — Betaling (Stripe)
- Klikk POST til `/api/travels/checkout`
- API:
  1. Validerer data (Zod)
  2. Oppretter `booking` i Supabase med `deposit_status: 'pending'`
  3. Oppretter Stripe Checkout Session (depositum i EUR)
  4. Returnerer `{ url }` → browser redirectes til Stripe

### Bekreftelse (`/travels/[id]/book/success`)
- Stripe returnerer `?session_id=...`
- Side henter booking via `session_id` og viser:
  - "Booking mottatt!" heading
  - Oppsummering: tur, navn, e-post, depositum betalt
  - "Sjekk e-posten din for bekreftelse"
- Webhook (`/api/webhooks/stripe`) oppdaterer `deposit_status: 'paid'` async

### Avbrytside (`/travels/[id]/book/cancel`)
- "Betalingen ble avbrutt" — lenke tilbake til turen

---

## 8. API-routes

### `POST /api/travels/checkout`
```typescript
body: {
  trip_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  padel_level?: string
  room_type: 'double' | 'single'
  roommate_name?: string
  selected_extras: string[]
  gdpr_consent: boolean
  terms_accepted: boolean
}

// 1. Zod-validering
// 2. INSERT booking (deposit_status: 'pending')
// 3. Stripe checkout.sessions.create
//    - line_items: depositum (trip.deposit_eur)
//    - success_url: /travels/[id]/book/success?session_id={CHECKOUT_SESSION_ID}
//    - cancel_url: /travels/[id]/book/cancel
//    - metadata: { booking_id }
// 4. Return { url: session.url }
```

### `POST /api/webhooks/stripe`
```typescript
// Verifiser Stripe-signatur
// Håndter: checkout.session.completed
//   → UPDATE bookings SET deposit_status='paid', deposit_date=now(),
//              stripe_session_id=session.id
//     WHERE id = metadata.booking_id
```

---

## 9. Token-system for fremtidig redesign

Designerens arbeidsflyt:
1. Åpne `app/globals.css`
2. Endre `@theme`-variablene
3. Ev. bytt fonter i `app/travels/layout.tsx` (next/font-import)
4. Alt arver automatisk — ingen komponent-filer trenger endres for farger

Alle komponenter bruker kun token-navn (`bg-[--color-surface]`, `text-[--color-gold]`) — aldri hardkodede hex-verdier.

---

## 10. Utenfor scope (Fase 1)

- Webshop (produkter, kasse, Padelpoint-integrasjon)
- Inspirasjon/blogg
- B2B-sider (klubber, bedrifter, skoler)
- Admin-panel for å redigere turer
- Fullt betalt (rest av reisekost) — kun depositum nå
- Innlogging / brukerprofil (kobles på i fase 2)
- Referral-koder
