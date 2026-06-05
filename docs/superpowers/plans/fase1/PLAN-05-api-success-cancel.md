---
plan: "05-api-success-cancel"
title: "API-routes (checkout + webhook) + bekreftelsessider"
wave: 4
depends_on: ["02-db-travels-list"]
files_modified:
  - app/api/travels/checkout/route.ts
  - app/api/webhooks/stripe/route.ts
  - app/travels/[id]/book/success/page.tsx
  - app/travels/[id]/book/cancel/page.tsx
autonomous: true
phase: "Fera Padel Fase 1"
spec: "docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md"
---

## Objective

Implementer POST /api/travels/checkout (Zod-validering → Supabase INSERT → Stripe
Checkout Session), fullfør /api/webhooks/stripe (signatursjekkk → deposit_status update),
og bygg success/cancel-sider. Disse kjøres parallelt med PLAN-04 (booking UI).

## must_haves

- /api/travels/checkout oppretter booking med deposit_status='pending' FØR Stripe-redirect
- Stripe checkout.sessions.create har metadata.booking_id satt
- Webhook verifiserer Stripe-signatur (constructEventAsync) — ingen hardkodet secret i kode
- success-side viser bookinginfo hentet via session_id
- Alle secrets via process.env

---

## Task 5.1 — POST /api/travels/checkout

<read_first>
- lib/supabase/types.ts (bookings Insert-type: alle felt og typer)
- lib/booking/schema.ts (bookingSchema — importer herfra)
- app/api/webhooks/stripe/route.ts (eksisterende stub — for mønster)
- lib/supabase/server.ts (createClient — brukes for supabase service_role)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §8 (API-spec)
- node_modules/next/dist/docs/ (Next.js 16 Route Handler API)
- node_modules/stripe/dist/ (Stripe SDK v22 — checkout.sessions.create API)
</read_first>

<action>
Opprett app/api/travels/checkout/route.ts:

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { bookingSchema } from '@/lib/booking/schema'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })

export async function POST(request: NextRequest) {
  try {
    // 1. Parse og Zod-validering
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    // 2. Hent tur for å validere og hente deposit_eur
    const supabase = await createClient()
    const { data: trip } = await supabase
      .from('trips')
      .select('id, title, deposit_eur, status, published')
      .eq('id', data.trip_id)
      .single()
    if (!trip || !trip.published || trip.status === 'full') {
      return NextResponse.json({ error: 'Tur ikke tilgjengelig' }, { status: 422 })
    }

    // 3. Opprett booking med deposit_status: 'pending'
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id:          data.trip_id,
        first_name:       data.first_name,
        last_name:        data.last_name,
        email:            data.email,
        phone:            data.phone ?? null,
        padel_level:      data.padel_level ?? null,
        room_type:        data.room_type,
        roommate_name:    data.roommate_name ?? null,
        selected_extras:  data.selected_extras,
        deposit_status:   'pending',
        gdpr_consent:     data.gdpr_consent,
        terms_accepted:   data.terms_accepted,
      })
      .select('id')
      .single()
    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Kunne ikke opprette booking' }, { status: 500 })
    }

    // 4. Beregn total depositum (inkl. extras)
    const { data: tripFull } = await supabase
      .from('trips')
      .select('extras')
      .eq('id', data.trip_id)
      .single()
    const extrasTotal = data.selected_extras.reduce((sum: number, extraName: string) => {
      const extras = (tripFull?.extras ?? []) as Array<{ name: string; price_eur: number }>
      const extra = extras.find(e => e.name === extraName)
      return sum + (extra?.price_eur ?? 0)
    }, 0)
    const totalEur = trip.deposit_eur + extrasTotal

    // 5. Opprett Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'eur',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(totalEur * 100),
          product_data: { name: `Depositum — ${trip.title}` },
        },
      }],
      customer_email: data.email,
      metadata: { booking_id: booking.id },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/travels/${data.trip_id}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}/travels/${data.trip_id}/book/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('checkout error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}

Merk: apiVersion-streng skal matche stripe SDK v22 — sjekk node_modules/stripe/dist/
for korrekt verdi hvis TypeScript klager på '2025-05-28.basil'.
</action>

<acceptance_criteria>
- app/api/travels/checkout/route.ts eksisterer
- Inneholder `bookingSchema.safeParse(body)`
- Inneholder INSERT til 'bookings' med deposit_status: 'pending'
- Inneholder `stripe.checkout.sessions.create`
- Inneholder `metadata: { booking_id: booking.id }`
- Inneholder `success_url` med `{CHECKOUT_SESSION_ID}` template
- Ingen hardkodet stripe-nøkkel — bruker process.env.STRIPE_SECRET_KEY
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 5.2 — POST /api/webhooks/stripe (fullfør stub)

<read_first>
- app/api/webhooks/stripe/route.ts (eksisterende stub — erstatt innhold)
- lib/supabase/types.ts (bookings Update-type: deposit_status, deposit_date, stripe_session_id)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §8 webhook-spec
- node_modules/stripe/dist/ (Stripe SDK v22: webhooks.constructEventAsync, event typer)
- node_modules/next/dist/docs/ (Next.js 16: request.text() for raw body)
</read_first>

<action>
Erstatt app/api/webhooks/stripe/route.ts med fullstendig implementasjon:

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature mismatch' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id
    if (bookingId) {
      const supabase = await createClient()
      await supabase
        .from('bookings')
        .update({
          deposit_status:    'paid',
          deposit_date:      new Date().toISOString(),
          stripe_session_id: session.id,
        })
        .eq('id', bookingId)
    }
  }

  return NextResponse.json({ received: true })
}

Viktig: request.text() MÅ brukes (ikke request.json()) for å beholde rå body
for signatursjekkk. Stripe verifiserer signatur mot den ubehandlede request-body.

Viktig: Next.js 16 har config-syntax — hvis du trenger å deaktivere body-parsing,
sjekk node_modules/next/dist/docs/ for korrekt export config eller tilleggskonfig.
I Next.js 16 er raw body tilgjengelig via request.text() uten ekstra konfig.
</action>

<acceptance_criteria>
- app/api/webhooks/stripe/route.ts inneholder `request.text()`
- Inneholder `stripe.webhooks.constructEventAsync`
- Inneholder `process.env.STRIPE_WEBHOOK_SECRET`
- Inneholder UPDATE bookings SET deposit_status='paid'
- Returnerer { received: true } ved suksess
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 5.3 — Success-side /travels/[id]/book/success/page.tsx

<read_first>
- lib/supabase/server.ts
- lib/supabase/types.ts (bookings Row: first_name, last_name, email, deposit_status,
  stripe_session_id, trip_id)
- app/globals.css (color-success, color-gold, color-cta, color-text)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §7 Bekreftelse
- node_modules/next/dist/docs/ (Next.js 16 searchParams som Promise i page)
</read_first>

<action>
Opprett app/travels/[id]/book/success/page.tsx som async Server Component:

Props:
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>

const { id } = await params
const { session_id } = await searchParams

Hvis !session_id: redirect til /travels/${id}

Hent booking via session_id:
  const supabase = await createClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('first_name, last_name, email, deposit_status, trip_id')
    .eq('stripe_session_id', session_id)
    .single()

Fallback: Vis suksessside selv om booking ennå ikke er oppdatert av webhook
(webhook er asynkron — siden kan vises før webhooks kjørt).

Render (senter på siden, max-w-lg, mx-auto, py-16):
  - Stor grønn hake ✓ i text-[--color-success] (64px, font-bold)
  - Heading: "Booking mottatt!" — font-display, text-3xl
  - Oppsummering (hvis booking finnes):
      Navn: {first_name} {last_name}
      E-post: {email}
      Depositum: Betalt
  - Tekst: "Sjekk e-posten din for bekreftelse."
  - Link: "Se mine bookinger" → /travels (foreløpig — brukerprofil er fase 2)
  - Link: "Tilbake til alle turer" → /travels
</action>

<acceptance_criteria>
- app/travels/[id]/book/success/page.tsx eksisterer
- Inneholder `const { session_id } = await searchParams` (Next.js 16 async searchParams)
- Inneholder Supabase-fetch via stripe_session_id
- Inneholder `text-[--color-success]`
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 5.4 — Cancel-side /travels/[id]/book/cancel/page.tsx

<read_first>
- app/globals.css (color-cta, color-text, color-muted)
- node_modules/next/dist/docs/ (Next.js 16 page med async params)
</read_first>

<action>
Opprett app/travels/[id]/book/cancel/page.tsx som async Server Component:

const { id } = await params

Render (senter, max-w-lg, mx-auto, py-16):
  - Ikon: ✕ eller ⚠ i text-[--color-cta] (stor)
  - Heading: "Betalingen ble avbrutt"
  - Tekst: "Bookingen din ble ikke fullført. Ingen beløp er trukket."
  - To lenker:
      "Prøv igjen →" → /travels/${id}/book (bg-[--color-cta], rounded-full)
      "Tilbake til turen" → /travels/${id} (ghost, text-[--color-subtle])
</action>

<acceptance_criteria>
- app/travels/[id]/book/cancel/page.tsx eksisterer
- Inneholder `const { id } = await params`
- Inneholder Link til `/travels/${id}/book` og `/travels/${id}`
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 5.5 — .env.local-dokumentasjon og next.config.ts

<read_first>
- .env.local (sjekk hvilke vars som allerede er satt)
- next.config.ts (importer remotePatterns — legg til supabase storage URL)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §7 (NEXT_PUBLIC_BASE_URL)
</read_first>

<action>
Opprett (eller oppdater) .env.local med disse nødvendige variablene (legg til hvis mangler):

  NEXT_PUBLIC_SUPABASE_URL=https://dbvnuoayzevtoaolhqxd.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<fra Supabase Dashboard>
  SUPABASE_SERVICE_ROLE_KEY=<fra Supabase Dashboard>
  STRIPE_SECRET_KEY=<fra Stripe Dashboard>
  STRIPE_WEBHOOK_SECRET=<fra Stripe Dashboard → Webhooks>
  NEXT_PUBLIC_BASE_URL=http://localhost:3000   # endre til produksjons-URL ved deploy

Oppdater next.config.ts: legg til Supabase storage i remotePatterns:
  { hostname: 'dbvnuoayzevtoaolhqxd.supabase.co' }

VIKTIG: Commit IKKE .env.local — sjekk at .gitignore inkluderer .env*.local.
</action>

<acceptance_criteria>
- .env.local inneholder STRIPE_SECRET_KEY og STRIPE_WEBHOOK_SECRET som placeholder-kommentarer
  ELLER faktiske verdier (ikke commit med ekte nøkler)
- next.config.ts inneholder remotePatterns med dbvnuoayzevtoaolhqxd.supabase.co
- .gitignore inneholder .env*.local (sjekk)
- `npm run build` exit 0 (med dummy env vars satt)
</acceptance_criteria>

---

## Verification

```bash
npx tsc --noEmit
npm run build
ls app/api/travels/checkout/route.ts
ls app/travels/[id]/book/success/page.tsx
ls app/travels/[id]/book/cancel/page.tsx
grep "constructEventAsync" app/api/webhooks/stripe/route.ts
grep "booking_id" app/api/travels/checkout/route.ts
grep "session_id" app/travels/\[id\]/book/success/page.tsx
grep "dbvnuoayzevtoaolhqxd" next.config.ts
```
