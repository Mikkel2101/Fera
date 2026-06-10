'use client'

import { useState, FormEvent } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-dark)">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-(--color-sand) text-xs uppercase tracking-widest font-medium mb-3">Hold deg oppdatert</p>
        <h2 className="font-display italic font-bold text-white text-3xl sm:text-4xl mb-4">
          Få nyhetsbrev fra Fera
        </h2>
        <p className="text-white/60 text-base leading-relaxed mb-8">
          Nye turer, utstyr-nyheter og ekklusive tilbud — rett i innboksen din. Ingen spam, kun det som gjelder.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-(--color-sand)">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Du er påmeldt! Takk.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.no"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-(--color-dark) font-semibold text-sm px-6 py-3 rounded-full hover:bg-(--color-sand) transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {status === 'loading' ? 'Melder på…' : 'Meld meg på →'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-sm mt-3">Noe gikk galt. Prøv igjen.</p>
        )}

        <p className="text-white/30 text-xs mt-4">Ingen spam. Meld av når som helst.</p>
      </div>
    </section>
  )
}
