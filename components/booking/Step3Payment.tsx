'use client'

import { useState } from 'react'
import type { Step1Data, Step2Data, BookingData } from '@/lib/booking/schema'

type Props = {
  trip: { id: string; title: string; deposit_eur: number }
  step1: Step1Data
  step2: Step2Data
  onBack: () => void
}

const ROOM_LABELS: Record<string, string> = {
  Dobbel: 'Dobbeltrom',
  Single: 'Enkeltrom',
}

export default function Step3Payment({ trip, step1, step2, onBack }: Props) {
  const [gdprConsent,    setGdprConsent]    = useState(false)
  const [termsAccepted,  setTermsAccepted]  = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  async function handleSubmit() {
    setError('')
    if (!gdprConsent || !termsAccepted) {
      setError('Du må godta GDPR-samtykket og vilkårene for å fortsette.')
      return
    }

    setLoading(true)
    try {
      const body: BookingData = {
        ...step1,
        ...step2,
        trip_id:        trip.id,
        gdpr_consent:   gdprConsent,
        terms_accepted: termsAccepted,
      }

      const res = await fetch('/api/travels/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Noe gikk galt. Prøv igjen.')
        setLoading(false)
        return
      }

      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold text-(--color-text) mt-6">
        Oppsummering og betaling
      </h2>

      {/* Oppsummering */}
      <div className="bg-(--color-sand) rounded-xl p-5 space-y-3">
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
            <span className="text-(--color-text)">{step2.selected_extras.join(', ')}</span>
          </div>
        )}
        <div className="border-t border-(--color-border) pt-3 flex justify-between font-bold text-(--color-gold)">
          <span>Depositum</span>
          <span>{trip.deposit_eur} EUR</span>
        </div>
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
            i henhold til personvernreglene (GDPR). <span className="text-red-500">*</span>
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
            Jeg aksepterer vilkårene for booking. <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

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
          className="flex-1 bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? 'Sender til betaling…' : `Betal depositum ${trip.deposit_eur} EUR →`}
        </button>
      </div>
    </div>
  )
}
