'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Step1Data, Step2Data, BookingData } from '@/lib/booking/schema'

type Props = {
  trip: { id: string; title: string }
  step1: Step1Data
  step2: Step2Data
  onBack: () => void
}

const ROOM_LABELS: Record<string, string> = {
  Dobbel: 'Dobbeltrom',
  Single: 'Enkeltrom',
}

export default function Step3Confirm({ trip, step1, step2, onBack }: Props) {
  const router = useRouter()
  const [gdprConsent,       setGdprConsent]       = useState(false)
  const [termsAccepted,     setTermsAccepted]     = useState(false)
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState('')
  const [isFull,            setIsFull]            = useState(false)

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
      <div className="bg-(--color-sand) rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-(--color-subtle)">Tur</span>
          <span className="text-(--color-text) font-medium text-right">{trip.title}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--color-subtle)">Navn</span>
          <span className="text-(--color-text) font-medium">{step1.first_name} {step1.last_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--color-subtle)">E-post</span>
          <span className="text-(--color-text)">{step1.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--color-subtle)">Romtype</span>
          <span className="text-(--color-text)">{ROOM_LABELS[step2.room_type] ?? step2.room_type}</span>
        </div>
        {step2.selected_extras.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-(--color-subtle)">Tilvalg</span>
            <span className="text-(--color-text) text-right">{step2.selected_extras.join(', ')}</span>
          </div>
        )}
        <p className="border-t border-(--color-border) pt-3 text-sm text-(--color-text)">
          Reservasjonen er <strong>uforpliktende</strong> og koster ingenting nå. Vi holder av plassen
          din og tar kontakt med betalingsinformasjon før påmeldingen blir bindende.
        </p>
      </div>

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
            Jeg samtykker til at Fera Padel lagrer og behandler mine personopplysninger
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
            Ja takk, send meg nyheter om nye turer og tilbud fra Fera.
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
