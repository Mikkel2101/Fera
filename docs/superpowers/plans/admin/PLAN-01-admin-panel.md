# Fera Admin Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg Fera Admin Panel med toppmeny, turskjema (CRUD), bookingoversikt, venteliste og dashboard-stats.

**Architecture:** Server Components henter data via Supabase anon-klient med admin-brukerens cookie. Server Actions (`lib/actions/trips.ts`) håndterer skriveoperasjoner og krever `role: admin` i Supabase app_metadata via RLS. `TripForm` er Client Component som kaller server actions direkte.

**Tech Stack:** Next.js 16 (async params/searchParams), Supabase SSR, Server Actions (`'use server'`), Tailwind v4 CSS tokens.

---

## Viktige avvik fra standard Next.js

- `params` og `searchParams` er **Promises** i Next.js 16 — alltid `await params`
- Stripe API-versjon er `"2026-05-27.dahlia"` (ikke relevant her, men noter for konsistens)
- `trips.name` (ikke `title`), `trips.status` bruker norske verdier
- Design tokens: aldri hardkode hex — bruk `text-[--color-cta]`, `bg-[--color-dark]` osv.

---

## Fil-oversikt

| Fil | Handling | Ansvar |
|-----|----------|--------|
| `supabase/migrations/003_admin_rls.sql` | Opprett | RLS-policies for admin-skriving |
| `lib/actions/trips.ts` | Opprett | Server Actions + TripFormData-type |
| `components/admin/AdminNav.tsx` | Opprett | Toppmeny med usePathname |
| `app/admin/layout.tsx` | Modifiser | Legg til AdminNav |
| `components/admin/TripForm.tsx` | Opprett | Komplett turskjema (Client Component) |
| `app/admin/trips/page.tsx` | Opprett | Turliste med rediger/slett/publiser |
| `app/admin/trips/new/page.tsx` | Opprett | Ny tur (wrapper for TripForm) |
| `app/admin/trips/[id]/edit/page.tsx` | Opprett | Rediger tur (wrapper for TripForm) |
| `app/admin/dashboard/page.tsx` | Modifiser | Stats + siste bookinger |
| `app/admin/bookings/page.tsx` | Opprett | Bookingoversikt med turfilter |
| `app/admin/waitlist/page.tsx` | Opprett | Venteliste per tur |

---

## Task 1: Supabase RLS-migrasjon

**Files:**
- Create: `supabase/migrations/003_admin_rls.sql`

- [ ] **Opprett migrasjonsfilen**

```sql
-- Migration 003: Admin RLS-policies
-- Gir admin-brukere (role: admin i app_metadata) skrivetilgang til trips
-- og lesetilgang til alle bookinger og waitlist-rader.

-- trips: admin kan SELECT (inkl. upubliserte), INSERT, UPDATE, DELETE
CREATE POLICY IF NOT EXISTS "admin_trips_all"
  ON trips FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- bookings: admin kan lese alle bookinger (ikke bare egne)
CREATE POLICY IF NOT EXISTS "admin_bookings_read"
  ON bookings FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- waitlist: admin kan lese alle venteliste-rader
CREATE POLICY IF NOT EXISTS "admin_waitlist_read"
  ON waitlist FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

- [ ] **Commit**

```bash
git add supabase/migrations/003_admin_rls.sql
git commit -m "feat: add admin RLS policies for trips write and bookings/waitlist read"
```

> **Manuelt steg:** Kjør `npx supabase db push` for å aktivere policies i live-databasen. Sett `role: admin` i app_metadata for Mikkel og Petter i Supabase Dashboard → Authentication → Users.

---

## Task 2: Server Actions + TripFormData-type

**Files:**
- Create: `lib/actions/trips.ts`

- [ ] **Opprett `lib/actions/trips.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type TripFormData = {
  name:                    string
  destination:             string
  hotel:                   string
  start_date:              string
  end_date:                string
  trip_type:               string
  status:                  string
  published:               boolean
  max_participants:        number | null
  price_double_eur:        number
  price_single_eur:        number | null
  deposit_eur:             number
  early_bird_price_double: number | null
  early_bird_price_single: number | null
  early_bird_deadline:     string | null
  description:             string
  program:                 string
  main_image:              string
  gallery_images:          string[]
  included:                string[]
  not_included:            string[]
  extras:                  Array<{ name: string; price_eur: number }>
  coaches:                 Array<{ name: string; title: string; bio: string; image: string }>
  faq:                     Array<{ question: string; answer: string }>
}

export async function createTrip(data: TripFormData): Promise<{ id: string }> {
  const supabase = await createClient()
  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      ...data,
      extras:  data.extras  as unknown as import('@/lib/supabase/types').Json,
      coaches: data.coaches as unknown as import('@/lib/supabase/types').Json,
      faq:     data.faq     as unknown as import('@/lib/supabase/types').Json,
    })
    .select('id')
    .single()
  if (error || !trip) throw new Error(error?.message ?? 'Kunne ikke opprette tur')
  revalidatePath('/admin/trips')
  revalidatePath('/travels')
  return { id: trip.id }
}

export async function updateTrip(id: string, data: TripFormData): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('trips')
    .update({
      ...data,
      extras:  data.extras  as unknown as import('@/lib/supabase/types').Json,
      coaches: data.coaches as unknown as import('@/lib/supabase/types').Json,
      faq:     data.faq     as unknown as import('@/lib/supabase/types').Json,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/trips')
  revalidatePath(`/admin/trips/${id}/edit`)
  revalidatePath('/travels')
  revalidatePath(`/travels/${id}`)
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('trips').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/trips')
  revalidatePath('/travels')
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('trips')
    .update({ published })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/trips')
  revalidatePath('/travels')
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

Forventet: exit 0.

- [ ] **Commit**

```bash
git add lib/actions/trips.ts
git commit -m "feat: add trip server actions (create, update, delete, setPublished)"
```

---

## Task 3: AdminNav + oppdater layout

**Files:**
- Create: `components/admin/AdminNav.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Opprett `components/admin/AdminNav.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/trips',     label: 'Turer' },
  { href: '/admin/bookings',  label: 'Bookinger' },
  { href: '/admin/waitlist',  label: 'Venteliste' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-[--color-dark] text-white px-6 py-3 flex items-center gap-6 sticky top-0 z-50">
      <span className="font-display text-[--color-gold] font-semibold mr-2">
        Fera Admin
      </span>
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm transition-colors ${
            pathname === href || pathname.startsWith(href + '/')
              ? 'text-white font-medium'
              : 'text-[--color-muted] hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/admin/trips/new"
        className="ml-auto bg-[--color-cta] text-white text-sm px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
      >
        + Ny tur
      </Link>
    </nav>
  )
}
```

- [ ] **Oppdater `app/admin/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = { title: 'Fera Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?error=not_authenticated')

  const role = user.app_metadata?.role
  if (role !== 'admin') redirect('/?error=not_authorized')

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

Forventet: exit 0.

- [ ] **Commit**

```bash
git add components/admin/AdminNav.tsx app/admin/layout.tsx
git commit -m "feat: add AdminNav and update admin layout with topnav"
```

---

## Task 4: TripForm — komplett skjema

**Files:**
- Create: `components/admin/TripForm.tsx`

Dette er en stor Client Component. Den bruker `useState` for alle felt og kaller `createTrip`/`updateTrip` server actions ved submit.

- [ ] **Opprett `components/admin/TripForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTrip, updateTrip } from '@/lib/actions/trips'
import type { TripFormData } from '@/lib/actions/trips'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

type Extra   = { name: string; price_eur: number }
type Coach   = { name: string; title: string; bio: string; image: string }
type FaqItem = { question: string; answer: string }

const STATUSES  = ['Utkast', 'Åpen', 'Få plasser', 'Fullbooket', 'Avlyst', 'Gjennomført']
const TRIP_TYPES = ['Åpen tur', 'Klubbtur', 'Privat', 'Bedrift']

function toNum(v: string): number        { return parseFloat(v) || 0 }
function toNumOrNull(v: string): number | null { return v ? parseFloat(v) : null }
function toStrOrNull(v: string): string | null { return v.trim() || null }

export default function TripForm({ trip }: { trip?: TripRow }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Grunninfo
  const [name,        setName]        = useState(trip?.name        ?? '')
  const [destination, setDestination] = useState(trip?.destination ?? '')
  const [hotel,       setHotel]       = useState(trip?.hotel       ?? '')
  const [startDate,   setStartDate]   = useState(trip?.start_date  ?? '')
  const [endDate,     setEndDate]     = useState(trip?.end_date    ?? '')
  const [tripType,    setTripType]    = useState(trip?.trip_type   ?? 'Åpen tur')
  const [status,      setStatus]      = useState(trip?.status      ?? 'Utkast')
  const [published,   setPublished]   = useState(trip?.published   ?? false)
  const [maxPart,     setMaxPart]     = useState(String(trip?.max_participants ?? ''))

  // Priser
  const [priceDouble,  setPriceDouble]  = useState(String(trip?.price_double_eur  ?? ''))
  const [priceSingle,  setPriceSingle]  = useState(String(trip?.price_single_eur  ?? ''))
  const [deposit,      setDeposit]      = useState(String(trip?.deposit_eur       ?? '500'))
  const [ebDouble,     setEbDouble]     = useState(String(trip?.early_bird_price_double ?? ''))
  const [ebSingle,     setEbSingle]     = useState(String(trip?.early_bird_price_single ?? ''))
  const [ebDeadline,   setEbDeadline]   = useState(trip?.early_bird_deadline ?? '')

  // Innhold
  const [description, setDescription] = useState(trip?.description ?? '')
  const [program,     setProgram]     = useState(trip?.program     ?? '')
  const [mainImage,   setMainImage]   = useState(trip?.main_image  ?? '')
  const [galleryRaw,  setGalleryRaw]  = useState((trip?.gallery_images ?? []).join('\n'))

  // Lister
  const [included,    setIncluded]    = useState<string[]>(trip?.included     ?? [])
  const [notIncluded, setNotIncluded] = useState<string[]>(trip?.not_included ?? [])
  const [extras,      setExtras]      = useState<Extra[]>(
    (trip?.extras as Extra[] | null) ?? []
  )
  const [coaches,     setCoaches]     = useState<Coach[]>(
    (trip?.coaches as Coach[] | null) ?? []
  )
  const [faq,         setFaq]         = useState<FaqItem[]>(
    (trip?.faq as FaqItem[] | null) ?? []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !destination || !startDate || !endDate || !priceDouble || !deposit) {
      setError('Fyll inn alle obligatoriske felt (*).')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data: TripFormData = {
        name, destination,
        hotel:                   hotel.trim(),
        start_date:              startDate,
        end_date:                endDate,
        trip_type:               tripType,
        status,
        published,
        max_participants:        maxPart ? parseInt(maxPart) : null,
        price_double_eur:        toNum(priceDouble),
        price_single_eur:        toNumOrNull(priceSingle),
        deposit_eur:             toNum(deposit),
        early_bird_price_double: toNumOrNull(ebDouble),
        early_bird_price_single: toNumOrNull(ebSingle),
        early_bird_deadline:     toStrOrNull(ebDeadline),
        description:             description.trim(),
        program:                 program.trim(),
        main_image:              mainImage.trim(),
        gallery_images:          galleryRaw.split('\n').map(s => s.trim()).filter(Boolean),
        included:                included.filter(Boolean),
        not_included:            notIncluded.filter(Boolean),
        extras,
        coaches,
        faq,
      }
      if (trip) {
        await updateTrip(trip.id, data)
      } else {
        await createTrip(data)
      }
      router.push('/admin/trips')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt')
      setSaving(false)
    }
  }

  const inputClass = 'border border-[--color-border] rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[--color-cta] text-sm'
  const labelClass = 'block text-xs font-medium text-[--color-subtle] mb-1'
  const sectionClass = 'bg-[--color-surface] border border-[--color-border] rounded-xl p-5 space-y-4'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-[--color-text]">
          {trip ? 'Rediger tur' : 'Ny tur'}
        </h1>
        <label className="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            className="accent-[--color-cta] w-4 h-4"
          />
          Publisert
        </label>
      </div>

      {/* Grunninfo */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">Grunninfo</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Navn *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Destinasjon *</label>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Hotell</label>
            <input type="text" value={hotel} onChange={e => setHotel(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fra dato *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Til dato *</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Turtype</label>
            <select value={tripType} onChange={e => setTripType(e.target.value)} className={inputClass}>
              {TRIP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Maks deltakere</label>
            <input type="number" value={maxPart} onChange={e => setMaxPart(e.target.value)} className={inputClass} min={1} />
          </div>
        </div>
      </div>

      {/* Priser */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">Priser (EUR)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Pris dobbel *</label>
            <input type="number" value={priceDouble} onChange={e => setPriceDouble(e.target.value)} className={inputClass} required min={0} step={0.01} />
          </div>
          <div>
            <label className={labelClass}>Pris singel</label>
            <input type="number" value={priceSingle} onChange={e => setPriceSingle(e.target.value)} className={inputClass} min={0} step={0.01} />
          </div>
          <div>
            <label className={labelClass}>Depositum *</label>
            <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className={inputClass} required min={0} step={0.01} />
          </div>
          <div>
            <label className={labelClass}>Early bird dobbel</label>
            <input type="number" value={ebDouble} onChange={e => setEbDouble(e.target.value)} className={inputClass} min={0} step={0.01} />
          </div>
          <div>
            <label className={labelClass}>Early bird singel</label>
            <input type="number" value={ebSingle} onChange={e => setEbSingle(e.target.value)} className={inputClass} min={0} step={0.01} />
          </div>
          <div>
            <label className={labelClass}>Early bird deadline</label>
            <input type="date" value={ebDeadline} onChange={e => setEbDeadline(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Innhold */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">Innhold</h2>
        <div>
          <label className={labelClass}>Beskrivelse</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={4} />
        </div>
        <div>
          <label className={labelClass}>Program</label>
          <textarea value={program} onChange={e => setProgram(e.target.value)} className={inputClass} rows={4} />
        </div>
        <div>
          <label className={labelClass}>Hovedbilde URL</label>
          <input type="url" value={mainImage} onChange={e => setMainImage(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className={labelClass}>Galleribilder (én URL per linje)</label>
          <textarea value={galleryRaw} onChange={e => setGalleryRaw(e.target.value)} className={inputClass} rows={3} placeholder={'https://...\nhttps://...'} />
        </div>
      </div>

      {/* Inkludert / ikke inkludert */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">Inkludert / Ikke inkludert</h2>
        <StringListEditor label="Inkludert" items={included} onChange={setIncluded} />
        <StringListEditor label="Ikke inkludert" items={notIncluded} onChange={setNotIncluded} />
      </div>

      {/* Extras */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">Tilvalg (extras)</h2>
        {extras.map((e, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={e.name}
              onChange={ev => setExtras(prev => prev.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}
              placeholder="Navn"
              className={inputClass}
            />
            <input
              type="number"
              value={e.price_eur}
              onChange={ev => setExtras(prev => prev.map((x, j) => j === i ? { ...x, price_eur: parseFloat(ev.target.value) || 0 } : x))}
              placeholder="EUR"
              className="border border-[--color-border] rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-[--color-cta] text-sm"
              min={0} step={0.01}
            />
            <button type="button" onClick={() => setExtras(prev => prev.filter((_, j) => j !== i))}
              className="text-[--color-muted] hover:text-red-500 text-sm px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setExtras(prev => [...prev, { name: '', price_eur: 0 }])}
          className="text-[--color-cta] text-sm hover:underline">+ Legg til tilvalg</button>
      </div>

      {/* Coaches */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">Coaches</h2>
        {coaches.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 border border-[--color-border] rounded-lg p-3">
            <input type="text" value={c.name}  onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}  placeholder="Navn"   className={inputClass} />
            <input type="text" value={c.title} onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, title: ev.target.value } : x))} placeholder="Tittel" className={inputClass} />
            <input type="text" value={c.image} onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, image: ev.target.value } : x))} placeholder="Bilde URL" className={inputClass} />
            <input type="text" value={c.bio}   onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, bio: ev.target.value } : x))}   placeholder="Bio"    className={inputClass} />
            <button type="button" onClick={() => setCoaches(prev => prev.filter((_, j) => j !== i))}
              className="col-span-2 text-[--color-muted] hover:text-red-500 text-xs text-right">Fjern coach</button>
          </div>
        ))}
        <button type="button" onClick={() => setCoaches(prev => [...prev, { name: '', title: '', bio: '', image: '' }])}
          className="text-[--color-cta] text-sm hover:underline">+ Legg til coach</button>
      </div>

      {/* FAQ */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-[--color-text]">FAQ</h2>
        {faq.map((f, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input type="text" value={f.question} onChange={ev => setFaq(prev => prev.map((x, j) => j === i ? { ...x, question: ev.target.value } : x))} placeholder="Spørsmål" className={inputClass} />
              <textarea value={f.answer} onChange={ev => setFaq(prev => prev.map((x, j) => j === i ? { ...x, answer: ev.target.value } : x))} placeholder="Svar" className={inputClass} rows={2} />
            </div>
            <button type="button" onClick={() => setFaq(prev => prev.filter((_, j) => j !== i))}
              className="text-[--color-muted] hover:text-red-500 text-sm px-2 mt-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setFaq(prev => [...prev, { question: '', answer: '' }])}
          className="text-[--color-cta] text-sm hover:underline">+ Legg til FAQ</button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-4 pb-8">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 text-[--color-subtle] hover:text-[--color-text] text-sm transition-colors">
          Avbryt
        </button>
        <button type="submit" disabled={saving}
          className="bg-[--color-cta] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
          {saving ? 'Lagrer…' : trip ? 'Lagre endringer' : 'Opprett tur'}
        </button>
      </div>
    </form>
  )
}

function StringListEditor({
  label, items, onChange,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[--color-subtle] mb-2">{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))}
              className="border border-[--color-border] rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-[--color-cta] text-sm"
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-[--color-muted] hover:text-red-500 text-sm px-2">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ''])}
        className="text-[--color-cta] text-sm hover:underline mt-2">+ Legg til</button>
    </div>
  )
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

Forventet: exit 0.

- [ ] **Commit**

```bash
git add components/admin/TripForm.tsx
git commit -m "feat: add TripForm client component with all trip fields"
```

---

## Task 5: Turliste + ny/rediger-sider

**Files:**
- Create: `app/admin/trips/page.tsx`
- Create: `app/admin/trips/new/page.tsx`
- Create: `app/admin/trips/[id]/edit/page.tsx`

- [ ] **Opprett `app/admin/trips/page.tsx`**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteTrip, setPublished } from '@/lib/actions/trips'

export default async function AdminTripsPage() {
  const supabase = await createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('id, name, destination, start_date, end_date, status, published, registered_count, max_participants')
    .order('start_date', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-[--color-text]">Turer</h1>
        <Link
          href="/admin/trips/new"
          className="bg-[--color-cta] text-white text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          + Ny tur
        </Link>
      </div>

      {!trips?.length && (
        <p className="text-[--color-muted] text-sm">Ingen turer ennå. Opprett din første tur.</p>
      )}

      <div className="space-y-3">
        {trips?.map(trip => (
          <div
            key={trip.id}
            className="bg-[--color-surface] border border-[--color-border] rounded-xl px-5 py-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[--color-text] truncate">{trip.name}</div>
              <div className="text-xs text-[--color-muted] mt-0.5">
                {trip.destination} · {trip.start_date} → {trip.end_date}
              </div>
            </div>
            <div className="text-xs text-[--color-muted]">
              {trip.registered_count}/{trip.max_participants ?? '∞'}
            </div>
            <StatusBadge status={trip.status} />
            <form action={setPublished.bind(null, trip.id, !trip.published)}>
              <button
                type="submit"
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  trip.published
                    ? 'border-[--color-success] text-[--color-success] hover:bg-green-50'
                    : 'border-[--color-border] text-[--color-muted] hover:border-[--color-cta] hover:text-[--color-cta]'
                }`}
              >
                {trip.published ? 'Publisert' : 'Avpublisert'}
              </button>
            </form>
            <Link
              href={`/admin/trips/${trip.id}/edit`}
              className="text-sm text-[--color-cta] hover:underline"
            >
              Rediger
            </Link>
            <form action={deleteTrip.bind(null, trip.id)}>
              <button
                type="submit"
                className="text-sm text-[--color-muted] hover:text-red-500 transition-colors"
                onClick={e => { if (!confirm(`Slett "${trip.name}"?`)) e.preventDefault() }}
              >
                Slett
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    'Åpen':        'bg-green-100 text-[--color-success]',
    'Få plasser':  'bg-yellow-100 text-[--color-gold]',
    'Fullbooket':  'bg-red-100 text-red-600',
    'Utkast':      'bg-[--color-sand] text-[--color-muted]',
    'Avlyst':      'bg-gray-100 text-gray-500',
    'Gjennomført': 'bg-[--color-sand] text-[--color-subtle]',
  }
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full ${colours[status] ?? 'bg-[--color-sand] text-[--color-muted]'}`}>
      {status}
    </span>
  )
}
```

- [ ] **Opprett `app/admin/trips/new/page.tsx`**

```tsx
import TripForm from '@/components/admin/TripForm'

export default function NewTripPage() {
  return <TripForm />
}
```

- [ ] **Opprett `app/admin/trips/[id]/edit/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripForm from '@/components/admin/TripForm'

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (!trip) notFound()

  return <TripForm trip={trip} />
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

Forventet: exit 0.

- [ ] **Commit**

```bash
git add "app/admin/trips/page.tsx" "app/admin/trips/new/page.tsx" "app/admin/trips/[id]/edit/page.tsx"
git commit -m "feat: add admin trip list, new trip, and edit trip pages"
```

---

## Task 6: Dashboard med stats

**Files:**
- Modify: `app/admin/dashboard/page.tsx`

- [ ] **Oppdater `app/admin/dashboard/page.tsx`**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: activeTrips  },
    { count: totalBookings },
    { count: paidBookings  },
    { data:  recentBookings },
    { data:  trips          },
  ] = await Promise.all([
    supabase.from('trips').select('*', { count: 'exact', head: true })
      .in('status', ['Åpen', 'Få plasser']).eq('published', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .eq('deposit_status', 'Betalt'),
    supabase.from('bookings')
      .select('id, first_name, last_name, email, deposit_status, created_at, trip_id, trips(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('trips')
      .select('id, deposit_eur')
      .eq('published', true),
  ])

  // Beregn total innbetalt depositum
  // NB: forenklet — bruker turens deposit_eur som grunnlag per betalt booking
  const { data: paidWithTrip } = await supabase
    .from('bookings')
    .select('trip_id, trips(deposit_eur)')
    .eq('deposit_status', 'Betalt')
  const revenue = (paidWithTrip ?? []).reduce((sum, b) => {
    const t = b.trips as { deposit_eur: number } | null
    return sum + (t?.deposit_eur ?? 0)
  }, 0)

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-[--color-text] mb-6">Dashboard</h1>

      {/* Statskort */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Aktive turer"     value={activeTrips  ?? 0} color="text-[--color-cta]" />
        <StatCard label="Totale bookinger" value={totalBookings ?? 0} color="text-[--color-text]" />
        <StatCard label="Betalte deposita" value={paidBookings  ?? 0} color="text-[--color-success]" />
        <StatCard label="Inntekt (EUR)"    value={`€${revenue}`}     color="text-[--color-gold]" />
      </div>

      {/* Siste bookinger */}
      <div className="bg-[--color-surface] border border-[--color-border] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[--color-border] flex justify-between items-center">
          <h2 className="text-sm font-semibold text-[--color-text]">Siste bookinger</h2>
          <Link href="/admin/bookings" className="text-xs text-[--color-cta] hover:underline">Se alle</Link>
        </div>
        {!recentBookings?.length ? (
          <p className="text-[--color-muted] text-sm p-5">Ingen bookinger ennå.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-sand]">
                <th className="text-left px-5 py-2 text-xs font-medium text-[--color-muted]">Navn</th>
                <th className="text-left px-5 py-2 text-xs font-medium text-[--color-muted]">Tur</th>
                <th className="text-left px-5 py-2 text-xs font-medium text-[--color-muted]">Status</th>
                <th className="text-left px-5 py-2 text-xs font-medium text-[--color-muted]">Dato</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => {
                const trip = b.trips as { name: string } | null
                return (
                  <tr key={b.id} className="border-b border-[--color-border] last:border-0">
                    <td className="px-5 py-3 text-[--color-text]">{b.first_name} {b.last_name}</td>
                    <td className="px-5 py-3 text-[--color-muted]">{trip?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.deposit_status === 'Betalt'
                          ? 'bg-green-100 text-[--color-success]'
                          : 'bg-yellow-100 text-[--color-gold]'
                      }`}>
                        {b.deposit_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[--color-muted] text-xs">
                      {new Date(b.created_at).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-[--color-surface] border border-[--color-border] rounded-xl p-5">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[--color-muted] mt-1">{label}</div>
    </div>
  )
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

Forventet: exit 0.

- [ ] **Commit**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "feat: add admin dashboard with stats cards and recent bookings"
```

---

## Task 7: Bookinger-side

**Files:**
- Create: `app/admin/bookings/page.tsx`

- [ ] **Opprett `app/admin/bookings/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>
}) {
  const { trip_id } = await searchParams
  const supabase = await createClient()

  const [{ data: bookings }, { data: trips }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, first_name, last_name, email, room_type, deposit_status, created_at, trip_id, trips(name)')
      .order('created_at', { ascending: false })
      .then(res => trip_id
        ? { ...res, data: res.data?.filter(b => b.trip_id === trip_id) ?? null }
        : res
      ),
    supabase.from('trips').select('id, name').order('start_date'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-[--color-text]">Bookinger</h1>
        <form method="GET" className="flex gap-2 items-center">
          <select
            name="trip_id"
            defaultValue={trip_id ?? ''}
            className="border border-[--color-border] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[--color-cta]"
          >
            <option value="">Alle turer</option>
            {trips?.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="text-sm bg-[--color-sand] border border-[--color-border] rounded-lg px-3 py-1.5 hover:border-[--color-cta] transition-colors">
            Filtrer
          </button>
        </form>
      </div>

      {!bookings?.length ? (
        <p className="text-[--color-muted] text-sm">Ingen bookinger funnet.</p>
      ) : (
        <div className="bg-[--color-surface] border border-[--color-border] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-sand]">
                {['Navn', 'E-post', 'Tur', 'Rom', 'Status', 'Dato'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium text-[--color-muted]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const trip = b.trips as { name: string } | null
                return (
                  <tr key={b.id} className="border-b border-[--color-border] last:border-0 hover:bg-[--color-sand] transition-colors">
                    <td className="px-5 py-3 font-medium text-[--color-text]">{b.first_name} {b.last_name}</td>
                    <td className="px-5 py-3 text-[--color-muted]">{b.email}</td>
                    <td className="px-5 py-3 text-[--color-muted]">{trip?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-[--color-muted]">{b.room_type ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.deposit_status === 'Betalt'
                          ? 'bg-green-100 text-[--color-success]'
                          : 'bg-yellow-100 text-[--color-gold]'
                      }`}>
                        {b.deposit_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[--color-muted]">
                      {new Date(b.created_at).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add app/admin/bookings/page.tsx
git commit -m "feat: add admin bookings page with trip filter"
```

---

## Task 8: Venteliste-side

**Files:**
- Create: `app/admin/waitlist/page.tsx`

- [ ] **Opprett `app/admin/waitlist/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>
}) {
  const { trip_id } = await searchParams
  const supabase = await createClient()

  const [{ data: entries }, { data: trips }] = await Promise.all([
    supabase
      .from('waitlist')
      .select('id, email, joined_at, trip_id, trips(name)')
      .order('joined_at', { ascending: false })
      .then(res => trip_id
        ? { ...res, data: res.data?.filter(w => w.trip_id === trip_id) ?? null }
        : res
      ),
    supabase.from('trips').select('id, name').order('start_date'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-[--color-text]">Venteliste</h1>
          <form method="GET" className="flex gap-2 items-center">
          <select
            name="trip_id"
            defaultValue={trip_id ?? ''}
            className="border border-[--color-border] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[--color-cta]"
          >
            <option value="">Alle turer</option>
            {trips?.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="text-sm bg-[--color-sand] border border-[--color-border] rounded-lg px-3 py-1.5 hover:border-[--color-cta] transition-colors">
            Filtrer
          </button>
        </form>
      </div>

      {!entries?.length ? (
        <p className="text-[--color-muted] text-sm">Ingen på venteliste.</p>
      ) : (
        <div className="bg-[--color-surface] border border-[--color-border] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-sand]">
                {['E-post', 'Tur', 'Lagt til'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium text-[--color-muted]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(w => {
                const trip = w.trips as { name: string } | null
                return (
                  <tr key={w.id} className="border-b border-[--color-border] last:border-0 hover:bg-[--color-sand] transition-colors">
                    <td className="px-5 py-3 text-[--color-text]">{w.email}</td>
                    <td className="px-5 py-3 text-[--color-muted]">{trip?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-[--color-muted]">
                      {new Date(w.joined_at).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Verifiser TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add app/admin/waitlist/page.tsx
git commit -m "feat: add admin waitlist page with trip filter"
```

---

## Task 9: Final build-verifikasjon

- [ ] **Kjør full TypeScript-sjekk**

```bash
npx tsc --noEmit
```

Forventet: exit 0.

- [ ] **Kjør produksjonsbuild**

```bash
npm run build
```

Forventet: alle ruter kompilerer, ingen TypeScript-feil, exit 0. Forventede ruter i output:
```
ƒ /admin/dashboard
ƒ /admin/trips
ƒ /admin/trips/new
ƒ /admin/trips/[id]/edit
ƒ /admin/bookings
ƒ /admin/waitlist
```

- [ ] **Commit**

```bash
git add -A
git commit -m "feat: Fera Admin Panel fase 1 — dashboard, turer, bookinger, venteliste"
```

---

## Kjente begrensninger (fase 2)

- Bildeopplasting: `main_image` og coach-bilder er URL-felt — Supabase Storage-integrasjon kommer i fase 2
- Bookingstatus kan ikke endres manuelt — status settes av Stripe webhook
- Ingen paginering på bookinger/venteliste (holder til ~500 rader)
- `select`-filteret på bookinger/venteliste bruker `<form method="GET">` med submit-knapp — kan oppgraderes til auto-submit via Client Component i fase 2
