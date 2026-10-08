'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WaitlistForm({ tripId }: { tripId: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({ trip_id: tripId, email })

    setLoading(false)
    if (dbError) {
      setError(true)
    } else {
      setSuccess(true)
    }
  }

  return (
    <section id="venteliste" className="bg-(--color-sand) px-4 sm:px-6 lg:px-8 py-12 border-t border-(--color-border)">
      <div className="max-w-md mx-auto text-center">
        <h2 className="font-display text-2xl font-bold text-(--color-text) mb-3">
          Meld deg på venteliste
        </h2>
        <p className="text-(--color-muted) mb-6">
          Denne turen er fullbooket. Vi gir deg beskjed hvis en plass blir ledig.
        </p>

        {success ? (
          <p className="text-(--color-success) font-medium">
            Du er på ventelisten! Vi gir deg beskjed hvis en plass blir ledig.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-(--color-border) rounded-lg px-4 py-3 text-(--color-text) bg-white focus:outline-none focus:ring-2 focus:ring-(--color-gold)/40 w-full"
            />
            {error && (
              <p className="text-(--color-cta) text-sm">Noe gikk galt — prøv igjen.</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Sender...' : 'Meld meg på'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
