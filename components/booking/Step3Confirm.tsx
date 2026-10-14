'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Step1Data, Step2Data, BookingData } from '@/lib/booking/schema'
import { courtSideLabel, padelLevelLabel, tripGoalLabel } from '@/lib/booking/levels'
import { previewExtras, formatBookedExtra } from '@/lib/booking/extras'
import { calculatePrice } from '@/lib/booking/pricing'
import { ROOM_SHARE_GENDERS, roomPreferenceLabel, roomTypeFor } from '@/lib/booking/rooms'
import type { BookingTrip } from './BookingShell'
import PriceSummary from './PriceSummary'

type Props = {
  trip: BookingTrip
  step1: Step1Data
  step2: Step2Data
  onBack: () => void
}

function summaryRows(trip: BookingTrip, step1: Step1Data, step2: Step2Data, extras: string[]): Array<[string, string]> {
  const gender = ROOM_SHARE_GENDERS.find(g => g.value === step2.room_share_gender)?.label
  const rows: Array<[string, string]> = [
    ['Tur',        trip.title],
    ['Navn',       `${step1.first_name} ${step1.last_name}`],
    ['E-post',     step1.email],
    ['Mobil',      step1.phone],
    ['Padelnivå',  padelLevelLabel(step1.padel_level)],
    ['Romønske',   roomPreferenceLabel(step2.room_preference)],
  ]
  if (step1.preferred_side) rows.push(['Banehalvdel', courtSideLabel(step1.preferred_side)])
  if (step2.roommate_name) rows.push(['Reisepartner', step2.roommate_name])
  if (gender)              rows.push(['Kjønn (romdeling)', gender])
  if (step1.trip_goal)     rows.push(['Mål for turen', tripGoalLabel(step1.trip_goal)])
  if (step1.special_requests) rows.push(['Ønsker', step1.special_requests])
  if (step1.allergies_preferences) rows.push(['Allergier og preferanser', step1.allergies_preferences])
  if (extras.length > 0)   rows.push(['Tillegg', extras.join(', ')])
  return rows
}

export default function Step3Confirm({ trip, step1, step2, onBack }: Props) {
  const router = useRouter()
  const [gdprConsent,       setGdprConsent]       = useState(false)
  const [termsAccepted,     setTermsAccepted]     = useState(false)
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState('')
  const [isFull,            setIsFull]            = useState(false)

  const extras = previewExtras(step2.extras, trip.extras)
  const price  = calculatePrice(trip, roomTypeFor(step2.room_preference), extras)
  const rows   = summaryRows(trip, step1, step2, extras.map(formatBookedExtra))

  async function handleSubmit() {
    setError('')
    if (!gdprConsent || !termsAccepted) {
      setError('Du må godta personvern og vilkår for å reservere.')
      return
    }

    setLoading(true)
    try {
      const body: BookingData = {
        ...step1,
        ...step2,
        trip_id:            trip.id,
        gdpr_consent:       gdprConsent,
        terms_accepted:     termsAccepted,
        newsletter_consent: newsletterConsent,
      }

      const res  = await fetch('/api/travels/reserve', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setIsFull(json.code === 'TRIP_FULL')
        setError(typeof json.error === 'string' ? json.error : 'Noe gikk galt. Prøv igjen.')
        setLoading(false)
        return
      }

      router.push(`/travels/${trip.id}/book/success?booking=${json.booking_id}`)
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold text-(--color-text) mt-6">
        Bekreft reservasjon
      </h2>

      {/* Oppsummering */}
      <div className="bg-(--color-sand-light) rounded-xl p-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-(--color-subtle) shrink-0">{label}</span>
            <span className="text-(--color-text) font-medium text-right break-words min-w-0">{value}</span>
          </div>
        ))}
        <p className="border-t border-(--color-border) pt-3 text-sm text-(--color-text)">
          Reservasjonen er <strong>uforpliktende</strong> og koster ingenting nå. Vi holder av plassen
          din og tar kontakt med betalingsinformasjon før påmeldingen blir bindende.
        </p>
      </div>

      <PriceSummary price={price} extras={extras} />

      {/* Samtykker */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={e => setGdprConsent(e.target.checked)}
            className="accent-(--color-cta) w-4 h-4 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-(--color-text)">
            Jeg samtykker til at FERA Padel lagrer og behandler mine personopplysninger
            i henhold til <Link href="/personvern" target="_blank" className="underline">personvernerklæringen</Link>.{' '}
            <span className="text-red-500">*</span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="accent-(--color-cta) w-4 h-4 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-(--color-text)">
            Jeg har lest <Link href="/vilkar" target="_blank" className="underline">vilkårene for reservasjon</Link>.{' '}
            <span className="text-red-500">*</span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={newsletterConsent}
            onChange={e => setNewsletterConsent(e.target.checked)}
            className="accent-(--color-cta) w-4 h-4 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-(--color-text)">
            Ja takk, send meg nyheter om nye turer og tilbud fra FERA.
          </span>
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm" role="alert">
          <p>{error}</p>
          {isFull && (
            <Link href={`/travels/${trip.id}#venteliste`} className="underline font-medium">
              Gå til ventelisten
            </Link>
          )}
        </div>
      )}

      {/* Knapper */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 text-(--color-subtle) hover:text-(--color-text) transition-colors disabled:opacity-50"
        >
          ← Tilbake
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:bg-(--color-dark-mid) transition-colors disabled:opacity-60"
        >
          {loading ? 'Reserverer…' : 'Reserver plass →'}
        </button>
      </div>
    </div>
  )
}
