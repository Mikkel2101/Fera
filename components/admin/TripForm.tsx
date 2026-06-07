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

  const inputClass = 'border border-(--color-border) rounded-lg px-3 py-2 w-full focus:outline-none focus:border-(--color-cta) text-sm'
  const labelClass = 'block text-xs font-medium text-(--color-subtle) mb-1'
  const sectionClass = 'bg-(--color-surface) border border-(--color-border) rounded-xl p-5 space-y-4'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-(--color-text)">
          {trip ? 'Rediger tur' : 'Ny tur'}
        </h1>
        <label className="flex items-center gap-2 text-sm text-(--color-text) cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            className="accent-(--color-cta) w-4 h-4"
          />
          Publisert
        </label>
      </div>

      {/* Grunninfo */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-(--color-text)">Grunninfo</h2>
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
        <h2 className="text-sm font-semibold text-(--color-text)">Priser (EUR)</h2>
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
        <h2 className="text-sm font-semibold text-(--color-text)">Innhold</h2>
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
        <h2 className="text-sm font-semibold text-(--color-text)">Inkludert / Ikke inkludert</h2>
        <StringListEditor label="Inkludert" items={included} onChange={setIncluded} />
        <StringListEditor label="Ikke inkludert" items={notIncluded} onChange={setNotIncluded} />
      </div>

      {/* Extras */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-(--color-text)">Tilvalg (extras)</h2>
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
              className="border border-(--color-border) rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-(--color-cta) text-sm"
              min={0} step={0.01}
            />
            <button type="button" onClick={() => setExtras(prev => prev.filter((_, j) => j !== i))}
              className="text-(--color-muted) hover:text-red-500 text-sm px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setExtras(prev => [...prev, { name: '', price_eur: 0 }])}
          className="text-(--color-cta) text-sm hover:underline">+ Legg til tilvalg</button>
      </div>

      {/* Coaches */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-(--color-text)">Coaches</h2>
        {coaches.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 border border-(--color-border) rounded-lg p-3">
            <input type="text" value={c.name}  onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}  placeholder="Navn"   className={inputClass} />
            <input type="text" value={c.title} onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, title: ev.target.value } : x))} placeholder="Tittel" className={inputClass} />
            <input type="text" value={c.image} onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, image: ev.target.value } : x))} placeholder="Bilde URL" className={inputClass} />
            <input type="text" value={c.bio}   onChange={ev => setCoaches(prev => prev.map((x, j) => j === i ? { ...x, bio: ev.target.value } : x))}   placeholder="Bio"    className={inputClass} />
            <button type="button" onClick={() => setCoaches(prev => prev.filter((_, j) => j !== i))}
              className="col-span-2 text-(--color-muted) hover:text-red-500 text-xs text-right">Fjern coach</button>
          </div>
        ))}
        <button type="button" onClick={() => setCoaches(prev => [...prev, { name: '', title: '', bio: '', image: '' }])}
          className="text-(--color-cta) text-sm hover:underline">+ Legg til coach</button>
      </div>

      {/* FAQ */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-(--color-text)">FAQ</h2>
        {faq.map((f, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input type="text" value={f.question} onChange={ev => setFaq(prev => prev.map((x, j) => j === i ? { ...x, question: ev.target.value } : x))} placeholder="Spørsmål" className={inputClass} />
              <textarea value={f.answer} onChange={ev => setFaq(prev => prev.map((x, j) => j === i ? { ...x, answer: ev.target.value } : x))} placeholder="Svar" className={inputClass} rows={2} />
            </div>
            <button type="button" onClick={() => setFaq(prev => prev.filter((_, j) => j !== i))}
              className="text-(--color-muted) hover:text-red-500 text-sm px-2 mt-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setFaq(prev => [...prev, { question: '', answer: '' }])}
          className="text-(--color-cta) text-sm hover:underline">+ Legg til FAQ</button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-4 pb-8">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 text-(--color-subtle) hover:text-(--color-text) text-sm transition-colors">
          Avbryt
        </button>
        <button type="submit" disabled={saving}
          className="bg-(--color-cta) text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
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
      <p className="text-xs font-medium text-(--color-subtle) mb-2">{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))}
              className="border border-(--color-border) rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-(--color-cta) text-sm"
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-(--color-muted) hover:text-red-500 text-sm px-2">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ''])}
        className="text-(--color-cta) text-sm hover:underline mt-2">+ Legg til</button>
    </div>
  )
}
