# Fera Shop v2 — Design Spec

**Dato:** 2026-06-19  
**Status:** Godkjent av Mikkel Rebne  
**Kontekst:** Willie Lizier (PadelPoint) møte 2026-06-10 — wholesale-reseller-avtale, scraping godkjent, agentic ordre diskutert.

---

## Oversikt

Fire parallelle forbedringer av Fera Shop:

| Modul | Hva | Prioritet |
|---|---|---|
| 1 | GitHub Actions cron-sync (pris, salg, nyheter) | Høy |
| 2 | NOK-valuta med ECB-kurs, avrunding til nærmeste 10 | Høy |
| 3 | Playwright auto-reorder til tiendapadelpoint.com | Høy |
| 4 | Full katalog-import (PADELPOINT_MAX_PAGES=20) | Umiddelbar |

---

## Modul 1: GitHub Actions cron-sync

### Problem
Vercel blokkeres av tiendapadelpoint.com (CDG1/Paris IP-ranges). Sync kjøres manuelt fra Mac.

### Løsning
GitHub Actions kjører på Microsoft Azure-infrastruktur (egne IP-ranges). Daily cron 02:00 UTC.

### Fallback
Hvis GitHub Actions også blokkeres: legg til Webshare gratis proxy-lag (én env-var og to linjer i scraper). Ikke blokkerende for implementasjonen.

### Ny funksjonalitet i sync

**Salg-deteksjon:**
- Threshold: pris faller >10 % siden forrige sync → `is_on_sale = true`, `previous_price_eur = gammel pris`
- Reset: neste sync der pris er ≥ forrige → `is_on_sale = false`, `previous_price_eur = null`
- Eksisterende sanity-check (>40 % → price_review_queue) er separat og uendret

**Nyheter:**
- `created_at` i products-tabellen er allerede satt ved første upsert
- Produkter < 30 dager gamle vises med "Ny"-badge i UI — ingen ekstra DB-felt

### Filer
- `.github/workflows/padelpoint-sync.yml` — cron-workflow
- `supabase/migrations/015_product_sale_fields.sql` — `is_on_sale boolean default false`, `previous_price_eur numeric`
- `lib/padelpoint/sync.ts` — oppdatert med salg-logikk

### GitHub Secrets (må settes i repo-settings)
```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PADELPOINT_MAX_PAGES=20
```

### Cron-schedule
```yaml
schedule:
  - cron: '0 2 * * *'   # 02:00 UTC = 03:00/04:00 norsk tid
```

---

## Modul 2: NOK-valuta

### Krav
- Vis NOK som primærvaluta overalt i shoppen
- Avrund til nærmeste 10 (f.eks. "2 360 kr", "890 kr")
- Legg til 3 % buffer over ECB-kurs for å matche reell bankvaluta
  - Effektiv visningskurs: `ecbRate * 1.03`
  - Eksempel: ECB 11,80 → visningskurs 12,15
- Stripe beholder EUR internt (ikke endre checkout-API)
- Kundevendt tekst: "Betaling gjennomføres i EUR via Stripe"

### Kurskilder
**Primær:** Frankfurter API (gratis, ECB-data, ingen nøkkel)
```
https://api.frankfurter.app/latest?from=EUR&to=NOK
```
Cachet 24 timer via Next.js `fetch` med `{ next: { revalidate: 86400 } }`.

**Fallback:** Hardkodet `11.80` ved API-feil.

### Avrundingslogikk
```ts
export function roundToNearest10(nok: number): number {
  return Math.round(nok / 10) * 10
}

export function eurToNok(eur: number, rate: number): number {
  return roundToNearest10(eur * rate * 1.03)
}

export function formatNok(nok: number): string {
  return `${nok.toLocaleString('nb-NO')} kr`
}
```

### Filer som endres
- `lib/currency.ts` — ny fil med utility-funksjoner og rate-fetcher
- `components/shop/ProductCard.tsx` — NOK-pris
- `app/shop/[id]/page.tsx` — NOK-pris + "Betaling i EUR"-note
- `app/shop/checkout/page.tsx` — NOK i knapp og ordresammendrag
- `components/shop/CartDrawer.tsx` — NOK-totalt
- `app/page.tsx` — NOK på hjemmeside-produkter

### Kjent begrensning
Kunden ser NOK på FeraShop, men Stripe viser EUR. Dette er standard for norske nettbutikker med europeisk leverandør og kommuniseres tydelig i UI.

---

## Modul 3: Playwright auto-reorder

### Kontekst
Willie sa eksplisitt i møtet: "you will have to go into my website, read the manual order — it's the best I can offer." Tilbød også wallet-alternativ: send ~€1 000 på forhånd, ordrene trekkes mot saldoen, Willie trenger bare et varsel.

Mikkel foreslo "agentic maybe" — Willie var positiv. Forretningsmodellen tillater dette.

### Overordnet flyt
```
Kunde betaler → Stripe webhook → DB oppdateres + ops-epost →
lib/shop/github.ts: triggerPadelpointOrder() →
POST til GitHub API (repository_dispatch) →
.github/workflows/padelpoint-order.yml starter →
scripts/padelpoint-order.ts (Playwright):
  1. Naviger til tiendapadelpoint.com
  2. Logg inn med wholesale-konto
  3. For hvert CartItem: åpne padelpoint_url, legg i kurv
  4. Gå til checkout
  5. Fyll inn kundens leveringsadresse (norsk)
  6. Velg betalingsmetode (pre-funded wallet / kredit)
  7. Fullfør ordre
  8. Send bekreftelse til ops-epost med Padelpoint-ordrenummer
```

### Fase 1-begrensning (wallet ikke satt opp ennå)
Inntil Willie-wallet er på plass: Playwright kjører steg 1–5, stopper ved betaling, og sender manuelt varsel til ops. Manuell betaling fullføres av Mikkel. Boten er fortsatt verdifull — sparer tid på kurv-fylling og adresseutfylling.

### Feilhåndtering
| Feil | Handling |
|---|---|
| GitHub dispatch feiler | Logg til `pending_order_automations`, retry ved neste webhook |
| Playwright kan ikke logge inn | Alert-epost til ops, fall tilbake til eksisterende manuell ops-epost |
| Produkt ikke funnet på siden | Skip produkt, logg, ops-varsel med manuell lenke |
| Generell Playwright-feil | Screenshot lagres til Supabase Storage, alert sendes |

### Produktvarianter — kjent begrensning
CartItem lagrer ikke valgt variant (størrelse, farge). For rackets og accessories er dette OK (ingen størrelsesvalg). Begrensning dokumenteres; løses når sko/klær legges til.

### Filer
- `.github/workflows/padelpoint-order.yml`
- `scripts/padelpoint-order.ts` — Playwright-skript
- `lib/shop/github.ts` — `triggerPadelpointOrder(order, items, shippingAddress)`
- `supabase/migrations/016_pending_order_automations.sql`
- `app/api/webhooks/stripe/route.ts` — kaller trigger etter vellykket ordre

### GitHub Secrets (ordre-workflow)
```
PADELPOINT_WHOLESALE_EMAIL
PADELPOINT_WHOLESALE_PASSWORD
RESEND_API_KEY
OPS_EMAIL
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## Modul 4: Full katalog-import

Kjøres som første steg i implementasjonen:
```bash
PADELPOINT_MAX_PAGES=20 npm run sync:padelpoint
```

Forventer ~1 000–2 000 produkter (3 sider ga 570). Sanity-checks er på plass (>40 % prisendring → price_review_queue).

---

## Hva som IKKE inngår i denne spesifikasjonen

- Stripe NOK-konvertering (Stripe beholder EUR)
- Flerspråklig i18n / språkvelger
- Sko/klær i SYNC_CATEGORIES (Willie advarte om returrate)
- Willie-wallet-oppsett (kommersielt steg, ikke teknisk)
- Eksklusivitetsavtale med Willie

---

## Avhengigheter og forutsetninger

| Forutsetning | Status | Ansvarlig |
|---|---|---|
| GitHub repo er privat/public med Actions aktivert | Ukjent | Mikkel |
| GitHub Secrets satt opp | Gjenstår | Mikkel |
| Willie-wallet (pre-funded credit) | Gjenstår | Petter/Mikkel |
| Supabase-migrasjoner kjørt i prod | Gjenstår | Mikkel |
| GitHub Actions ikke blokkert av tiendapadelpoint.com | Ukjent — testes ved første kjøring | — |
