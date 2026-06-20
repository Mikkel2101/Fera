# FeraShop UX Research — 2026

> Analysert: outnorth.no, padelnuestro.com, tennis-point.com, Baymard Institute (2024–2025)
> Fokus: direkte implementerbare React/Next.js-mønstre for padelutstyr til norske kunder

---

## 1. Produktkort-best practices

### Info-hierarki (topp til bunn)
Standard hierarki fra FoxEcom og industri-praksis i 2025:
1. **Produktbilde** — primærbilde, kvadratisk eller 4:3 ratio
2. **Badge** — "Salg", "Nyhet", "Lav lager" øverst venstre hjørne
3. **Merkevare** — liten muted tekst over produktnavn
4. **Produktnavn** — 2 linjer maks, avkortet med ellipsis
5. **Pris** — prominent, bold. Salgspris i kontrastfarge, original pris strøket gjennom
6. **Lagerindikator** — "Lav lager" / "Utsolgt" ved behov

Kilde: [FoxEcom – How to Design a Product Card](https://foxecom.com/blogs/all/product-card-design)

### Sekundærbilde ved hover (desktop)
- **Svev for å bytte bilde** er standardmønster i 2025 for sport/klær. Viser produktet i bruk eller fra annen vinkel.
- Baymard finner at 80 % av nettbutikker ikke tilbyr nok thumbnails — **minimum 3 bilder** per produkt er anbefalt, helst 5+ for klær og sko.
- Implementering: `onMouseEnter` bytter `src` på `<Image>`, `onMouseLeave` tilbakestiller. Legg begge bilder i `images[]`-arrayet på produktet.
- Sekundærbildet bør **preloades** på hover-intent for å unngå flimring.

Kilde: [Baymard – Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)

### Quick-kjøp / hurtig legg i kurv
- Quick-actions (hjerte for ønskeliste, lupe for quick-view, handlekurv for rask kjøp) vises **kun ved hover** på desktop for å holde kortet rent.
- Posisjoneres **øverst til høyre** på kortet, ikke over bildet.
- For produkter uten varianter (baller, vesker, enkle tilbehør): direkte "Legg i kurv"-knapp på hover fungerer bra.
- For racketer og sko med størrelsesvarianter: "Quick View"-modal er bedre — unngår å sende brukeren til produktsiden bare for å velge størrelse.
- På mobil: quick-actions må alltid være **synlige** (ikke hover-avhengig) og minst 44×44px touch-target.

Kilde: [FoxEcom – Product Card Design](https://foxecom.com/blogs/all/product-card-design)

### Badges og priser
- Salgspris: rød eller kontrastfarge, original pris strøket gjennom ved siden av.
- "Beste selger", "Ny", "Lav lager" som pillbadge øverst venstre.
- Psykologisk prissetting (f.eks. 899,- i stedet for 900,-) fungerer, men er allerede standard.

---

## 2. Filteropplevelse

### Sidebar vs. horisontale piller
Baymard (2025, 219+ brukertester) er tydelig:
- **Sidebar-filtrering er best** for butikker med mange filtertyper (Fera har: kategori, merkevare, pris, lagerStatus, sortering).
- Horisontale filterverktøylinjer fungerer kun for **få filtertyper** (2–3) og passer bedre for enkle kategorier.
- **Problemet med pills/horisontale**: filteralternativene er ikke synlige uten å klikke, noe som gjør det vanskelig å skanne katalogens bredde.

Kilde: [Baymard – Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)

### 5 essensielle filtertyper (51 % av butikker mangler minst én)
Baymard identifiserer disse som obligatoriske:
1. **Pris** (prisklasse-slider)
2. **Brukervurdering** (stjerner) — ikke relevant uten reviews
3. **Størrelse** — kritisk for racketer (grip, balanse) og sko
4. **Merkevare** — Babolat, Bullpadel, Head, NOX, Wilson etc.
5. **Kategori-spesifikke** — for racketer: spiller-nivå (nybegynner/mellom/avansert), balansepunkt, form

Kilde: [Baymard – Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)

### Aktive filter-oversikt (28 % av butikker gjør dette feil)
- **Alle aktive filtre må vises i en oversikt** over produktlisten — ikke bare i sidebarens opprinnelige posisjon.
- Hvert aktivt filter skal ha et ×-ikon for rask fjerning **uten å åpne filterpanelet på nytt**.
- Unngå å kun vise antallet aktive filtre (f.eks. "Filter (3)") — vis de faktiske valgene.
- På mobil: aktive filtre vises som horisontalt scrollbare pills over produktlisten.
- Inkluder filtertype i oversikten når det er tvetydigt: "Merkevare: Bullpadel", "Størrelse: 4.5".
- Ha alltid en "Fjern alle"-lenke.

Kilde: [Baymard – Applied Filters](https://baymard.com/blog/how-to-design-applied-filters)

### Flere filtervalg av samme type
- Brukere skal kunne velge **Bullpadel + Head** samtidig (OR-logikk innen samme filtertype).
- 14 % av butikker støtter ikke dette — det tvinger brukere til å gjøre separate søk.

### Prisslider
- Vis min/maks pris-input-felt ved siden av slideren for presise verdier.
- Oppdater produktlisten **live** ved slipp, ikke ved hvert trekk (debounce 300ms).

---

## 3. Søk

### Instant search vs. submit
I 2025 er **instant search med autocomplete standardforventning**. Submit-søk er foreldret.

### Konkrete krav:
- **Responstid under 100ms** — Algolia-standard. Brukere søker på 1–2 tegn.
- **6–8 søkeforslag** på desktop, **5–6 på mobil**.
- Vis **produktbilder + pris** i autocomplete-dropdownen — ikke bare tekstforslag.
- Vis **kategorier** som snarvei: "Racketer (47)", "Sko (23)".
- Federated autocomplete: skill mellom "Populære søk", "Produkter" og "Merkevarer".
- 75 % av brukere søker for å spare tid — de *forventer* hjelp etter første tegn.

### React-implementering
- **Algolia InstantSearch for React** er industri-standard og har React 19-støtte.
- Alternativ uten kostnad: Supabase full-text search med `to_tsvector` og debounce på `useState`.
- Supabase-tilnærming passer for 570 produkter — Algolia er overkill på dette volumet.

Kilde: [Algolia – Ecommerce autocomplete best practices](https://www.algolia.com/blog/ecommerce/search-autocomplete-on-mobile), [LogRocket – Top tools for React search](https://blog.logrocket.com/top-tools-implementing-ecommerce-search-react/)

---

## 4. Sortering

### 4 obligatoriske sorteringsalternativer (69 % av butikker mangler minst én)
Baymard identifiserer disse som de 4 mest etterspurte av brukere:
1. **Pris: lav til høy**
2. **Pris: høy til lav**
3. **Best selgende** ("Mest populær")
4. **Nyeste**

I tillegg bør FeraShop ha:
5. **På salg** — direkte relevant siden vi har `is_on_sale`-flag i DB
6. **Relevans** (default ved søk)

- Sortering skal oppdatere listen **uten full side-reload** (state-basert i React).
- Vis gjeldende sorteringsvalg tydelig i dropdownen.
- Behold sorteringsvalget ved paginering.

Kilde: [Baymard – Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)

---

## 5. CartDrawer og frakt-progress

### Anatomi for en høy-konverterende cart drawer (basert på 12 butikk-teardowns)

```
┌─────────────────────────────────┐
│  [×] Din handlekurv (3 varer)   │  ← Header med lukk-knapp
├─────────────────────────────────┤
│  ████████░░░░░░  NOK 450 igjen  │  ← Fraktprogress-bar
│  til gratis frakt               │
├─────────────────────────────────┤
│  [Produktbilde] Navn            │  ← Vareliste
│  Merkevare      [−][2][+]  NOK  │
│  [×] Fjern                      │
├─────────────────────────────────┤
│  Anbefalt: Padelball-3-pack     │  ← 1 relevant upsell
│  [Legg til]             NOK 149 │
├─────────────────────────────────┤
│  Total: NOK 1 249,-             │  ← Subtotal (eks. frakt)
│  [GÅ TIL KASSE]                 │  ← Primær CTA, full bredde
│  [Vipps]  [Visa/MC]             │  ← Express betaling
├─────────────────────────────────┤
│  🔒 Sikker betaling  ↩ 14 dg.  │  ← Trust-bar
└─────────────────────────────────┘
```

### Fraktprogress-bar
- Rothy's-mønster: "Legg til NOK 450 for gratis frakt" med fyllt progresjonslinje.
- **Konkret tallverdi** ("450 kr igjen") konverterer bedre enn prosent eller vag tekst ("du er nesten der!").
- Anbefalt frakt-terskel: sett **30 % over nåværende snittkurv** — motiverer uten å virke uoppnåelig.
- For FeraShop: frakt fra Spania er reell kostnad — vis evt. hva frakt koster uten terskel.

### Upsell-taktikk
- **Kun 1 relevant anbefaling** — Baymard: mer enn 1–2 lavkvalitets anbefalinger reduserer konvertering.
- For padelutstyr: baller til racket, strenger til racket, grepstape til racket.
- Plasser anbefalingen **mellom varelisten og total** — ikke under CTA.

### Auto-åpning
- Drawer åpnes automatisk ved "Legg i kurv" — dette er standard og forventes.
- Test: subtil toast (liten melding øverst) + cart-badge-animasjon kan fungere bedre for brukere som handler mange varer.

### Trust i drawer
- Fuel Made A/B-test: slide-out cart med trust-ikonografi ga opp til 18 % konverteringsforbedring og 40 % checkout completion-løft.
- Minibank av ikoner nederst i drawer: lås-ikon + "Sikker betaling", retur-pil + "14 dagers angrerett".

Kilde: [Byte & Buy – Cart Drawer UX 12 Teardowns](https://byteandbuy.com/blog/shopify-cart-drawer-ux-12-teardowns-tests)

---

## 6. Trust signals for norske kunder

### FeraShops spesifikke utfordring
Fera kjøper fra Spania (Padelpoint). Per i dag er Fera **ikke VOEC-registrert** — det betyr at norske kunder betaler 25 % MVA + tollbehandlingsgebyr til UPS ved levering (for varer over NOK 350).

Dette er det **viktigste trust-problemet** å kommunisere ærlig:

### Anbefalte trust-signaler (prioritert)

**1. Tollvarsel — tydelig og tidlig (kritisk)**
- Vis på produktsiden, i cart drawer OG i checkout:
  - "Merk: Varen sendes fra Spania. Du vil motta en faktura fra UPS for 25 % MVA + tollbehandlingsgebyr (ca. NOK 150–250) ved levering."
- VOEC-registrering fjerner dette problemet helt — da kan du i stedet si "MVA inkludert, ingen ekstra kostnader ved levering."

**2. Betalingslogoer (høy prioritet)**
- Vis Stripe, Visa, Mastercard, og Vipps-logo i footer, checkout og gjerne i cart drawer.
- Vipps er norgesstandard for mobilbetaling og en sterk tillitssignal.

**3. Angrerett (lovpålagt og forventet)**
- Norge: 14 dagers angrerett er lovpålagt (Forbrukerkjøpsloven).
- Outnorth.no viser dette **øverst på siden** i header-baren ved siden av "Gratis frakt".
- Implementer på samme måte: "14 dagers åpent kjøp" i en sticky info-bar øverst.

**4. Leveringstid (viktig for utenlandslevering)**
- outnorth.no: "Levering 3–7 virkedager" vises i header-baren.
- For Fera: "Levering 5–8 virkedager fra Spania" — vær konkret, ikke vag.

**5. Skandinavisk friteksttillit**
- outnorth.no bruker: "Klimakompensert frakt" som et differensierende signal.
- Fera kan bruke: "Produkter plukket av padel-entusiaster" eller lignende.

### Outnorth.no header trust-bar (observert direkte)
Outnorth viser en diskret, scrollbar header-bar med fire punkter:
- "Gratis frakt ved kjøp over 999,-"
- "Gratis retur"
- "30 dagers åpent kjøp"
- "Klimakompensert frakt"
- "Levering 3–7 virkedager"

Dette er det mest direkte implementerbare mønsteret for FeraShop.

Kilde: [outnorth.no](https://outnorth.no), [Norway VOEC guide 2025](https://en.pfcexpress.com/blog/norway-customs-tax-import-guide-2025)

---

## 7. Mobiloptimalisering

### Sticky "Legg i kurv"-knapp
- Baymard og industri-data: sticky ATC øker mobil-konvertering 5–12 %, reduserer produktside-exits 8–15 %.
- Knappen er sticky på bunnen av skjermen når den opprinnelige "Legg i kurv"-knappen er scrollet ut av syne.
- Implementering i Next.js:
  ```tsx
  // Bruk IntersectionObserver på den opprinnelige knappen
  // Vis sticky bar i en fixed div bottom-0 når originalknapp er out of viewport
  ```
- Sticky-baren bør inneholde: produktnavn (avkortet), pris, og "Legg i kurv"-knapp.

### Bildekarusell på mobil
- Sveip-karusell (touch-enabled) er standard — ikke thumbnail-grid.
- Vis minst 3–5 bilder: produktbilde rett frem, i bruk, detaljbilde, størrelsesbilde.
- Baymard: 80 % av butikker tilbyr ikke nok thumbnails — 3+ er minimum.
- Indikator-prikker under bildet (ikke numrering) er standard.

### Thumb reach zones
- Viktigste knapper (Legg i kurv, størrelsesvalgknapper) skal plasseres i **nedre 2/3 av skjermen**.
- Filterknapp på PLP: plasser som sticky bar i bunnen, ikke i toppen av siden.
- Sortering og filter som to sidestilte knapper i sticky bunn-bar på mobil (Instagram Shopping-mønster).

### Mobilskjema i checkout
Baymard's 6 mobile checkout-krav:
- Labels **alltid over** inputfeltet (aldri inline/side-ved-side).
- Ingen inline placeholder-labels — de forsvinner og skaper forvirring.
- Riktig `inputmode` og `type` per felt (f.eks. `inputmode="numeric"` for postnummer, `type="email"` for e-post).
- Aktiver autocomplete: `autocomplete="shipping address-line1"` etc.

Kilde: [Baymard – 6 Mobile Checkout Usability Considerations](https://baymard.com/blog/mobile-checkout), [easyappsecom – Sticky Add to Cart Best Practices](https://easyappsecom.com/guides/sticky-add-to-cart-best-practices)

---

## 8. Checkout-design

### Antall skjemafelt (Baymard 2024-benchmark)
- Gjennomsnittlig checkout: **11,3 felt** i 2024 — men optimalt er **8 felt**.
- 18 % av brukere forlater checkout på grunn av kompleksitet.
- Baymard's 5 måter å redusere felt:

**1. Ett enkelt "Fullt navn"-felt** (89 % av butikker bruker fortsatt fornavn + etternavn)
- Brukere tenker på navnet sitt som én enhet. To felt fører til feil og forvirring.

**2. Skjul "Adresselinje 2"** (75 % gjør dette feil)
- 30 % av brukere stoppet opp ved "Adresselinje 2".
- Vis det kun som en lenke: "+ Legg til leilighet/etasje/c/o".

**3. Automatisk adresse-oppslag** (adresse-autocomplete)
- La postnummer fylle ut by og kommune automatisk.
- Bruk Google Places API eller Bring (Posten) sin adresse-API for norske adresser.
- Brukere slipper å fylle ut 3–4 felt manuelt.

**4. Skjul faktureringsadresse** (standard = "samme som leveringsadresse")
- Vis som checkbox: "Faktureringsadresse er den samme" (forhåndsvalgt).

**5. Skjul valgfrie felt bak lenker**
- "Firmanavn" bak "+ Legg til firmanavn".
- Reduserer visuell kompleksitet for de 90 %+ som er privatpersoner.

### Ordresammendrag
- Alltid synlig på høyre side (desktop) eller som kollapset/ekspandert seksjon på mobil.
- Skal vise: bilde, navn, antall, pris per vare, subtotal, fraktkostnad, MVA-info, total.
- Gjennomsnittlig checkout er 5,1 steg i 2024 — hold til 3 steg: Info → Levering → Betaling.

### Steg-indikator
- Progress bar eller nummererte steg synlig øverst i checkout-flyten.
- Viser brukeren hvor de er og hva som gjenstår.

### For FeraShop spesifikt
- Stripe er allerede satt opp — beholde Stripe Elements for kortbetaling.
- Vipps-betaling: integrer som express checkout-knapp før skjema.
- Tollvarsel-boks: vis en info-boks (blå, ikke rød) i leveringssteg: "Din ordre sendes fra Spania. MVA og eventuell toll faktureres separat av UPS."

Kilde: [Baymard – Minimize Form Fields](https://baymard.com/blog/checkout-flow-average-form-fields), [Baymard – Mobile Checkout](https://baymard.com/blog/mobile-checkout)

---

## 9. Konkrete anbefalinger for FeraShop

Prioritert etter antatt ROI og implementeringsvanskelighet:

### Prioritet 1 — Kritisk (høy ROI, rask å implementere)

**1. Tollvarsel-komponent**
Lag en `<TollInfo />` komponent som vises på produktside, i cart drawer og i checkout. Ærlig kommunikasjon om MVA og tollgebyr er den viktigste tillitsfaktoren for norske kunder som handler fra Spania.

**2. Trust-bar i header**
Implementer en info-bar under Nav med 4–5 punkter: frakttid, angrerett, betalingslogoer. Outnorth.no er mal. Komponent: `<TrustBar />` i `app/shop/layout.tsx`.

**3. 4 obligatoriske sorteringsalternativer**
Legg til "Best selgende", "Nyeste", "Pris lav→høy", "Pris høy→lav", "På salg" i ProductGrid. Bruk `useState` for klient-side sortering.

**4. Fraktprogress-bar i CartDrawer**
Legg til en `<ShippingProgressBar />` øverst i CartDrawer. Vis "X kr igjen til gratis frakt" med konkret beløp. Sett terskel-logikk basert på `totalEur` fra `useCart()`.

### Prioritet 2 — Viktig (middels ROI)

**5. Aktive filter-oversikt**
Vis valgte filtre som pills med ×-knapp over produktlisten. Inkluder "Fjern alle". Implementer i `ProductGrid.tsx`.

**6. Sidebar-filtrering med essensielle filtertyper**
Legg til: Kategori, Merkevare (checkbox-liste), Pris (range-slider), LagerStatus. Sidebar på desktop, modal/bottom-sheet på mobil.

**7. Sekundærbilde ved hover**
Bruk `images[1]` fra Supabase-arrayet som hover-bilde i `ProductCard.tsx`. Enkel `onMouseEnter`/`onMouseLeave` som bytter `src` på `<Image>`.

**8. Sticky "Legg i kurv" på mobil**
Legg til `IntersectionObserver` på AddToCartButton i `app/shop/[id]/page.tsx`. Vis sticky bar i bunn når originalknapp er utenfor viewport.

### Prioritet 3 — Ønskelig (lavere ROI, mer arbeid)

**9. Instant search med autocomplete**
Supabase full-text search + `useEffect` med debounce. Vis produktbilde + pris i dropdown. 5–6 resultater.

**10. Checkout-optimering**
Slå sammen fornavn+etternavn til ett felt. Skjul "Adresselinje 2". Legg til postnummer-autocomplete (Bring API). Vis ordresammendrag synlig i hele checkout-flyten.

**11. Quick View modal**
For racketer og sko med størrelser — vis produktbilder, varianter og "Legg i kurv" i en modal uten å forlate PLP.

**12. VOEC-registrering (Skattetaten)**
Teknisk ikke UX, men det fjerner tollvarselet helt. Registrering er gratis og fjerner det største konverteringshinderet for norske kunder som handler fra utlandet. Krav: omsetning over NOK 50 000 til norske kunder.

---

## Kilder

| Kilde | URL |
|---|---|
| Baymard – Product List UX 2025 | https://baymard.com/blog/current-state-product-list-and-filtering |
| Baymard – Applied Filters | https://baymard.com/blog/how-to-design-applied-filters |
| Baymard – Minimize Form Fields | https://baymard.com/blog/checkout-flow-average-form-fields |
| Baymard – Mobile Checkout | https://baymard.com/blog/mobile-checkout |
| Baymard – Checkout Research | https://baymard.com/research/checkout-usability |
| Byte & Buy – Cart Drawer Teardowns | https://byteandbuy.com/blog/shopify-cart-drawer-ux-12-teardowns-tests |
| FoxEcom – Product Card Design | https://foxecom.com/blogs/all/product-card-design |
| Algolia – Autocomplete Mobile | https://www.algolia.com/blog/ecommerce/search-autocomplete-on-mobile |
| easyappsecom – Sticky ATC | https://easyappsecom.com/guides/sticky-add-to-cart-best-practices |
| Norway VOEC Guide 2025 | https://en.pfcexpress.com/blog/norway-customs-tax-import-guide-2025 |
| outnorth.no (observert) | https://outnorth.no |
| tennis-point.com (observert) | https://www.tennis-point.com/padel/ |
| padelnuestro.com (observert) | https://www.padelnuestro.com |
