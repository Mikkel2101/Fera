---
plan: "03-trip-detail"
title: "/travels/[id] — turdetaljside"
wave: 3
depends_on: ["01-tokens-nav", "02-db-travels-list"]
files_modified:
  - app/travels/[id]/page.tsx
  - app/travels/[id]/not-found.tsx
  - components/travels/detail/TripHero.tsx
  - components/travels/detail/TripMetaBar.tsx
  - components/travels/detail/TripProgram.tsx
  - components/travels/detail/TripIncluded.tsx
  - components/travels/detail/TripExtras.tsx
  - components/travels/detail/TripCoaches.tsx
  - components/travels/detail/TripPrices.tsx
  - components/travels/detail/TripFaq.tsx
  - components/travels/detail/WaitlistForm.tsx
autonomous: true
phase: "Fera Padel Fase 1"
spec: "docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md"
---

## Objective

Bygg `/travels/[id]` som henter én tur fra Supabase og renderer hero, metadata-rad og
alle innholdsseksjoner (program, inkludert, tilvalg, coacher, priser, FAQ).
Hvis tur ikke finnes: notFound(). Hvis full: vis venteliste-form i stedet for booking.

## must_haves

- Siden er async Server Component, [id] er Supabase UUID
- `notFound()` kalles hvis tur ikke eksisterer eller published=false
- Booking-CTA er sticky på mobile
- Alle farger via CSS-tokens

---

## Task 3.1 — Opprett app/travels/[id]/page.tsx

<read_first>
- lib/supabase/server.ts (createClient for server)
- lib/supabase/types.ts (trips Row-type, alle felt)
- app/globals.css (color-dark, color-dark-mid, color-gold, color-border, color-surface, color-sand)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §6 (alle seksjoner)
- node_modules/next/dist/docs/ (Next.js 16 dynamic route params, notFound, generateMetadata)
</read_first>

<action>
Opprett app/travels/[id]/page.tsx som async Server Component.

Params: `{ params: Promise<{ id: string }> }` (Next.js 16 — params er en Promise)
Destructure: `const { id } = await params`

Data-fetching:
  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()
  if (!trip) notFound()

generateMetadata:
  export async function generateMetadata({ params }: ...) {
    const { id } = await params
    // hent title fra Supabase
    return { title: `${trip.title} — Fera Padel` }
  }

Page-layout:
  <TripHero trip={trip} />
  <TripMetaBar trip={trip} />
  <div className="divide-y divide-[--color-border]">
    <section className="bg-[--color-surface] ..."><p>{trip.description}</p></section>
    <TripProgram program={trip.program} />
    <TripIncluded included={trip.included} />
    <TripExtras extras={trip.extras as Extra[]} />
    <TripCoaches coaches={trip.coaches as Coach[]} />
    <TripPrices trip={trip} />
    <TripFaq faq={trip.faq as FaqItem[]} />
  </div>
  {trip.status === 'full' && <WaitlistForm tripId={trip.id} />}

Definer lokale typer:
  type Extra = { name: string; price_eur: number }
  type Coach = { name: string; title: string; bio: string }
  type FaqItem = { question: string; answer: string }
</action>

<acceptance_criteria>
- app/travels/[id]/page.tsx eksisterer
- Inneholder `const { id } = await params` (Next.js 16 async params)
- Inneholder `notFound()` hvis tur ikke finnes
- Inneholder `generateMetadata`
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 3.2 — TripHero og TripMetaBar

<read_first>
- app/globals.css (color-dark, color-dark-mid, color-gold, color-cta, color-success, color-border)
- lib/supabase/types.ts (trips Row: title, status, main_image, start_date, end_date,
  destination, price_double_eur, deposit_eur, max_participants, registered_count)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §6 Hero og Metadata-rad
- next.config.ts (remotePatterns — legg til Supabase storage hostname hvis nødvendig)
</read_first>

<action>
Opprett components/travels/detail/TripHero.tsx (Server Component):

Props: `{ trip: TripRow }`

Struktur:
  - relative, min-h-[50vh] eller h-96, overflow-hidden
  - Bakgrunn: bg-gradient-to-b from-[--color-dark] to-[--color-dark-mid]
  - Hvis main_image: Next.js Image fill, objectFit='cover', + overlay div bg-black/50
  - Status-badge (grønn pill): bg-[--color-success], text-white, px-3 py-1, rounded-full, text-sm
    Vis kun hvis published og ikke full
  - Heading: trip.title, font-display, text-white, text-5xl lg:text-7xl, max-w-3xl

Opprett components/travels/detail/TripMetaBar.tsx (Server Component):

Props: `{ trip: TripRow }`

Struktur:
  - Sticky? Nei — statisk under hero. (Sticky CTA er separat knapp på mobil)
  - bg-white, border-b border-[--color-border], py-4 px-6
  - Flex row (scroll på mobil): ikonpills med tekst
      📅 start_date – end_date
      📍 destination
      💶 Fra {price_double_eur} EUR
      👥 {max_participants - registered_count} plasser igjen
  - Til høyre: "Book din plass"-knapp
      Link til /travels/{id}/book
      bg-[--color-cta] text-white px-6 py-3 rounded-full font-semibold
      Skjult hvis status='full'

Ingen hardkodet hex. Bruk Trip-type fra lib/supabase/types.ts.
</action>

<acceptance_criteria>
- components/travels/detail/TripHero.tsx eksisterer
- components/travels/detail/TripMetaBar.tsx eksisterer
- TripHero inneholder `from-[--color-dark]` og `to-[--color-dark-mid]`
- TripMetaBar inneholder `bg-[--color-cta]` og Link til `/travels/${trip.id}/book`
- Ingen hex-koder i noen av filene
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 3.3 — Innholdsseksjoner: Program, Included, Extras, Coaches, Priser

<read_first>
- app/globals.css (color-gold, color-success, color-surface, color-sand, color-muted)
- lib/supabase/types.ts (trips.program: text, trips.included: text[], trips.extras: Json,
  trips.coaches: Json, trips.price_double_eur, trips.price_single_eur, trips.deposit_eur)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §6 (seksjonsdetaljer)
</read_first>

<action>
Opprett disse Server Components (alle i components/travels/detail/):

TripProgram.tsx — Props: { program: string | null }
  - Seksjonstittel: "Dag-for-dag program", font-display, text-2xl
  - Tekst: whitespace-pre-wrap, text-[--color-muted] for program-innhold
  - Vis ingenting hvis program er null

TripIncluded.tsx — Props: { included: string[] }
  - Seksjonstittel: "Hva er inkludert"
  - Liste med grønne checkmarks: ✓ i text-[--color-success], tekst i text-[--color-text]
  - ul med li per item

TripExtras.tsx — Props: { extras: Array<{ name: string; price_eur: number }> }
  - Seksjonstittel: "Tilvalg"
  - Liste: navn + "+ {price_eur} EUR" i text-[--color-gold]
  - Vis ingenting hvis extras er tom

TripCoaches.tsx — Props: { coaches: Array<{ name: string; title: string; bio: string }> }
  - Seksjonstittel: "Møt coachene"
  - Per coach: avatar-sirkel (initialer fra name, bg-[--color-gold], text-white, 48px rund)
    + name (font-semibold) + title (text-[--color-muted], text-sm) + bio

TripPrices.tsx — Props: { trip: TripRow } (price_double_eur, price_single_eur, deposit_eur)
  - Seksjonstittel: "Priser"
  - Tabell eller flex-grid:
      Dobbeltrom: {price_double_eur} EUR
      Enkeltrom: {price_single_eur} EUR
      Depositum: {deposit_eur} EUR (tekst: "Betales nå — resten faktureres")
  - Priser i text-[--color-gold], font-bold, text-2xl

Ingen hardkodede hex i noen filer.
</action>

<acceptance_criteria>
- Alle 5 komponentfiler eksisterer under components/travels/detail/
- TripIncluded inneholder `text-[--color-success]`
- TripPrices inneholder `text-[--color-gold]`
- TripCoaches viser initialer fra coach.name
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 3.4 — TripFaq (accordion) og WaitlistForm

<read_first>
- app/globals.css (color-border, color-text, color-muted)
- lib/supabase/types.ts (trips.faq: Json)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §6 FAQ og Waitlist
- lib/supabase/client.ts (browser-client for waitlist POST)
</read_first>

<action>
Opprett components/travels/detail/TripFaq.tsx (`'use client'`):
  Props: { faq: Array<{ question: string; answer: string }> }
  - Seksjonstittel: "FAQ"
  - Per spørsmål: accordion-item med useState[openIndex]
    - Spørsmål: knapp med chevron (▾/▴), border-b border-[--color-border]
    - Svar: collapsible div, text-[--color-muted]
  - Vis ingenting hvis faq er tom

Opprett components/travels/detail/WaitlistForm.tsx (`'use client'`):
  Props: { tripId: string }
  - Vises kun hvis trip.status === 'full' (sjekkes i parent page.tsx)
  - Heading: "Meld deg på venteliste"
  - Input: e-post, border border-[--color-border], rounded-lg, px-4 py-3
  - Knapp: "Meld meg på", bg-[--color-cta], text-white, rounded-full
  - onSubmit: POST til Supabase waitlist-tabell via client.ts:
      const supabase = createClient()
      await supabase.from('waitlist').insert({ trip_id: tripId, email })
  - Suksess: "Du er på ventelisten! Vi gir deg beskjed hvis en plass blir ledig."
  - Feil: "Noe gikk galt — prøv igjen."
  - useState for email, loading, success, error
</action>

<acceptance_criteria>
- components/travels/detail/TripFaq.tsx eksisterer med `'use client'`
- components/travels/detail/WaitlistForm.tsx eksisterer med `'use client'`
- WaitlistForm inneholder `supabase.from('waitlist').insert`
- TripFaq bruker useState for accordion
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 3.5 — app/travels/[id]/not-found.tsx

<read_first>
- app/globals.css (color-text, color-muted, color-cta)
- node_modules/next/dist/docs/ (Next.js 16 not-found.tsx konvensjon)
</read_first>

<action>
Opprett app/travels/[id]/not-found.tsx:
  - Heading: "Tur ikke funnet"
  - Tekst: "Denne turen finnes ikke eller er ikke lenger tilgjengelig."
  - Link tilbake til /travels: "Se alle turer →"
    bg-[--color-cta] text-white px-6 py-3 rounded-full

Next.js 16: not-found.tsx er en standard notFound-side for denne rute-gruppen.
</action>

<acceptance_criteria>
- app/travels/[id]/not-found.tsx eksisterer
- Inneholder Link til `/travels`
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Verification

```bash
npx tsc --noEmit
npm run build
ls app/travels/[id]/page.tsx
ls components/travels/detail/TripHero.tsx
ls components/travels/detail/WaitlistForm.tsx
grep "await params" app/travels/\[id\]/page.tsx
grep "notFound" app/travels/\[id\]/page.tsx
grep -r "#[0-9A-Fa-f]" components/travels/detail/ && echo "FAIL" || echo "OK"
```
