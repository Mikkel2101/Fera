---
plan: "04-booking-flow"
title: "/travels/[id]/book — 3-stegs bookingflyt (UI)"
wave: 4
depends_on: ["01-tokens-nav", "02-db-travels-list", "03-trip-detail"]
files_modified:
  - app/travels/[id]/book/page.tsx
  - app/travels/[id]/book/layout.tsx
  - components/booking/BookingShell.tsx
  - components/booking/ProgressBar.tsx
  - components/booking/Step1PersonInfo.tsx
  - components/booking/Step2RoomExtras.tsx
  - components/booking/Step3Payment.tsx
autonomous: true
phase: "Fera Padel Fase 1"
spec: "docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md"
---

## Objective

Bygg fullstendig 3-stegs bookingflyt som Client Component. State flyts gjennom
BookingShell. Steg 3 POSTer til `/api/travels/checkout` og redirecter til Stripe.
Validering med Zod på blur (steg 1). Ingen hardkodede hex.

## must_haves

- BookingShell holder all state (step, formData) og sender ned som props
- Steg 1 validerer med Zod (fornavn, etternavn, e-post er required)
- Steg 3 POSTer til /api/travels/checkout og redirecter til Stripe URL
- Progress-bar viser korrekt aktivt steg
- "← Tilbake til turen"-lenke finnes i layout

---

## Task 4.1 — app/travels/[id]/book/layout.tsx

<read_first>
- app/globals.css (color-border, color-surface)
- app/travels/layout.tsx (mønster for layout med Nav)
- node_modules/next/dist/docs/ (Next.js 16 nested layout, params som Promise)
</read_first>

<action>
Opprett app/travels/[id]/book/layout.tsx:

Props: `{ children: React.ReactNode; params: Promise<{ id: string }> }`
Destructure: `const { id } = await params`

Render:
  <div className="min-h-screen bg-[--color-surface]">
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/travels/${id}`} className="text-[--color-subtle] text-sm hover:text-[--color-text]">
        ← Tilbake til turen
      </Link>
      {children}
    </div>
  </div>

Metadata: title: 'Book din plass — Fera Padel'
</action>

<acceptance_criteria>
- app/travels/[id]/book/layout.tsx eksisterer
- Inneholder `const { id } = await params` (Next.js 16 async params)
- Inneholder Link til `/travels/${id}`
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 4.2 — Zod-skjema og BookingShell

<read_first>
- lib/supabase/types.ts (bookings Insert-type: felt og typer)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §7 (alle felter)
- app/globals.css (color-cta, color-border, color-text, color-muted)
</read_first>

<action>
Opprett lib/booking/schema.ts med Zod-skjema:

  import { z } from 'zod'

  export const step1Schema = z.object({
    first_name: z.string().min(1, 'Fornavn er påkrevd'),
    last_name:  z.string().min(1, 'Etternavn er påkrevd'),
    email:      z.email('Ugyldig e-post'),
    phone:      z.string().optional(),
    padel_level: z.enum(['beginner','intermediate','advanced','elite']).optional(),
  })

  export const step2Schema = z.object({
    room_type:    z.enum(['double','single']),
    roommate_name: z.string().optional(),
    selected_extras: z.array(z.string()).default([]),
  })

  export const bookingSchema = step1Schema.merge(step2Schema).extend({
    trip_id:       z.string().uuid(),
    gdpr_consent:  z.boolean().refine(v => v, 'GDPR-samtykke er påkrevd'),
    terms_accepted: z.boolean().refine(v => v, 'Vilkår må aksepteres'),
  })

  export type Step1Data = z.infer<typeof step1Schema>
  export type Step2Data = z.infer<typeof step2Schema>
  export type BookingData = z.infer<typeof bookingSchema>

Opprett components/booking/BookingShell.tsx (`'use client'`):

Props:
  trip: { id: string; title: string; extras: Extra[]; deposit_eur: number;
          price_double_eur: number; price_single_eur: number }

State:
  const [step, setStep] = useState<1|2|3>(1)
  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({})
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({ room_type: 'double', selected_extras: [] })

Render:
  <ProgressBar currentStep={step} />
  {step === 1 && <Step1PersonInfo data={step1Data} onNext={(d) => { setStep1Data(d); setStep(2) }} />}
  {step === 2 && <Step2RoomExtras trip={trip} data={step2Data} onBack={() => setStep(1)} onNext={(d) => { setStep2Data(d); setStep(3) }} />}
  {step === 3 && <Step3Payment trip={trip} step1={step1Data as Step1Data} step2={step2Data as Step2Data} onBack={() => setStep(2)} />}
</action>

<acceptance_criteria>
- lib/booking/schema.ts eksisterer med step1Schema, step2Schema, bookingSchema
- step1Schema.parse({ first_name: '', email: 'bad' }) kaster ZodError
- components/booking/BookingShell.tsx eksisterer med `'use client'`
- BookingShell har useState for step (1|2|3)
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 4.3 — ProgressBar og Step1PersonInfo

<read_first>
- app/globals.css (color-cta, color-border, color-muted, color-text)
- lib/booking/schema.ts (step1Schema, Step1Data)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §7 Steg 1
</read_first>

<action>
Opprett components/booking/ProgressBar.tsx (`'use client'`):
Props: { currentStep: 1 | 2 | 3 }
  - 3 steg med labels: "Opplysninger" · "Rom & tilvalg" · "Betaling"
  - Linje mellom steg: bg-[--color-border] base, bg-[--color-cta] for fullførte steg
  - Aktivt steg: sirkel bg-[--color-cta] text-white, inaktivt: bg-[--color-border] text-[--color-muted]

Opprett components/booking/Step1PersonInfo.tsx (`'use client'`):
Props: { data: Partial<Step1Data>; onNext: (data: Step1Data) => void }

State:
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', padel_level: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

Felter (alle med label + input + feilmelding):
  - Fornavn* (text input)
  - Etternavn* (text input)
  - E-post* (email input)
  - Telefon (tel input, optional)
  - Padelnivå (select: Begynner | Mellomnivå | Avansert | Elite, optional)

Validering onBlur: kjør step1Schema.safeParse() per felt, sett errors.
Validering onSubmit: kjør step1Schema.parse(formData), kall onNext(parsed) eller sett alle feil.

Input-styling: border border-[--color-border], rounded-lg, px-4 py-3, w-full,
  focus:border-[--color-cta] focus:outline-none
Feilmelding: text-red-500 text-sm (rød er akseptabelt her, ikke en merkevaretoken)
CTA-knapp: "Neste: Rom & tilvalg →", bg-[--color-cta], text-white, px-6 py-3, rounded-full
</action>

<acceptance_criteria>
- components/booking/ProgressBar.tsx eksisterer
- components/booking/Step1PersonInfo.tsx eksisterer
- Step1PersonInfo inneholder Zod-validering via step1Schema.safeParse
- Ingen hardkodede hex (rød for feil er ok: text-red-500 er Tailwind-klasse)
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 4.4 — Step2RoomExtras

<read_first>
- app/globals.css (color-cta, color-border, color-gold, color-muted, color-surface)
- lib/booking/schema.ts (step2Schema, Step2Data)
- lib/supabase/types.ts (trips: extras Json type)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §7 Steg 2
</read_first>

<action>
Opprett components/booking/Step2RoomExtras.tsx (`'use client'`):

Props:
  trip: { extras: Array<{ name: string; price_eur: number }>; deposit_eur: number;
          price_double_eur: number; price_single_eur: number }
  data: Partial<Step2Data>
  onBack: () => void
  onNext: (data: Step2Data) => void

State:
  const [roomType, setRoomType] = useState<'double'|'single'>(data.room_type ?? 'double')
  const [roommateName, setRoommateName] = useState(data.roommate_name ?? '')
  const [selectedExtras, setSelectedExtras] = useState<string[]>(data.selected_extras ?? [])

Seksjoner:

1. Romtype (radio):
   - Dobbeltrom — {price_double_eur} EUR
   - Enkeltrom — {price_single_eur} EUR
   - Radio-input med border border-[--color-border] rounded-lg p-4, checked:border-[--color-cta]
   - Hvis dobbeltrom: vis tekstfelt "Hvem deler du rom med?" (roommate_name, optional)

2. Tilvalg (checkboxes, hvis extras.length > 0):
   - Per tilvalg: checkbox + navn + "+ {price_eur} EUR" i text-[--color-gold]
   - Toggle: legg til/fjern fra selectedExtras-array

3. Prisoppsummering:
   - "Depositum (betales nå):" {deposit_eur} EUR — text-[--color-gold] font-bold
   - Per valgt ekstra: "+ {name} {price_eur} EUR"
   - Total depositum (depositum + ekstrakostnader)

Knapper:
  - "← Tilbake" (ghost, text-[--color-subtle])
  - "Gå til betaling →" (bg-[--color-cta], rounded-full)
    Kaller onNext med step2Schema.parse({ room_type: roomType, roommate_name, selected_extras: selectedExtras })
</action>

<acceptance_criteria>
- components/booking/Step2RoomExtras.tsx eksisterer
- Inneholder radio-inputs for room_type
- Inneholder prisoppsummering med deposit_eur
- Inneholder `text-[--color-gold]` for priser
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 4.5 — Step3Payment

<read_first>
- app/globals.css (color-cta, color-gold, color-border, color-surface)
- lib/booking/schema.ts (BookingData, bookingSchema)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §7 Steg 3
</read_first>

<action>
Opprett components/booking/Step3Payment.tsx (`'use client'`):

Props:
  trip: { id: string; title: string; deposit_eur: number }
  step1: Step1Data
  step2: Step2Data
  onBack: () => void

State:
  const [gdprConsent, setGdprConsent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

Render:
  - Oppsummering: navn (step1.first_name + last_name), e-post, rom, tilvalg, depositum
  - Checkbox: GDPR-samtykke (required)
  - Checkbox: "Jeg aksepterer vilkårene" (required)
  - Knapper:
      "← Tilbake"
      "Betal depositum {deposit_eur} EUR →" — bg-[--color-cta], rounded-full, disabled under loading
  - Feilmelding (hvis error er satt): text-red-500

handleSubmit:
  1. Valider gdprConsent og termsAccepted, sett error hvis ikke
  2. setLoading(true)
  3. const body: BookingData = { ...step1, ...step2, trip_id: trip.id, gdpr_consent: gdprConsent, terms_accepted: termsAccepted }
  4. const res = await fetch('/api/travels/checkout', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
  5. Hvis !res.ok: sett error, setLoading(false)
  6. Ellers: const { url } = await res.json(); window.location.href = url
</action>

<acceptance_criteria>
- components/booking/Step3Payment.tsx eksisterer
- Inneholder `fetch('/api/travels/checkout', { method: 'POST' ... })`
- Inneholder `window.location.href = url` (Stripe redirect)
- Inneholder GDPR og vilkår checkboxes
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 4.6 — app/travels/[id]/book/page.tsx

<read_first>
- app/travels/[id]/book/layout.tsx (omslutter siden)
- components/booking/BookingShell.tsx
- lib/supabase/server.ts
- lib/supabase/types.ts (trips Row)
- node_modules/next/dist/docs/ (Next.js 16 async params i page)
</read_first>

<action>
Opprett app/travels/[id]/book/page.tsx som async Server Component:

const { id } = await params

Hent tur fra Supabase:
  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('id, title, deposit_eur, price_double_eur, price_single_eur, extras, status')
    .eq('id', id)
    .eq('published', true)
    .single()
  if (!trip) notFound()
  if (trip.status === 'full') redirect(`/travels/${id}`)

Render:
  <BookingShell trip={{ ...trip, extras: trip.extras as Extra[] }} />

Definer lokalt: type Extra = { name: string; price_eur: number }
</action>

<acceptance_criteria>
- app/travels/[id]/book/page.tsx eksisterer
- Inneholder `const { id } = await params`
- Inneholder redirect til `/travels/${id}` hvis status='full'
- Inneholder notFound() hvis tur ikke finnes
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
</acceptance_criteria>

---

## Verification

```bash
npx tsc --noEmit
npm run build
ls components/booking/BookingShell.tsx
ls components/booking/Step1PersonInfo.tsx
ls components/booking/Step2RoomExtras.tsx
ls components/booking/Step3Payment.tsx
ls lib/booking/schema.ts
grep "step1Schema" lib/booking/schema.ts
grep "fetch.*checkout" components/booking/Step3Payment.tsx
grep -r "#[0-9A-Fa-f]" components/booking/ && echo "FAIL hex" || echo "OK"
```
