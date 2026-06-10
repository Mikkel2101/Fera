'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">

        {/* Left — image (2/3) */}
        <div className="relative min-h-[320px] lg:min-h-0 lg:col-span-2">
          <Image
            src="/fonts/static/manuel-pappacena-zTwzxr4BbTA-unsplash.jpg"
            alt="Padel utendørs i solen"
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-(--color-overlay)/20" />
        </div>

        {/* Right — content (1/3) */}
        <div className="bg-(--color-community) flex flex-col justify-center px-10 py-16 lg:px-12">
          <p className="text-(--color-sand) text-xs uppercase tracking-widest font-medium mb-4">
            Meld deg på vårt nyhetsbrev
          </p>
          <h2 className="font-sans font-normal text-white text-4xl sm:text-5xl leading-tight mb-6">
            Bli med i<br />FERA Community
          </h2>
          <p className="font-sans text-[18px] text-white/65 leading-relaxed mb-10">
            Få tilgang til prelanseringer, eksklusive tilbud og utvalgte padelreiser før alle andre. Et fellesskap for deg som vil være først ute når nye opplevelser åpner.
          </p>

          {status === 'success' ? (
            <div className="flex items-center gap-3 text-(--color-sand)">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-sans font-normal text-base">Du er med i FERA Select. Velkommen!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
                className="bg-white/10 border border-white/20 rounded-full px-5 py-3.5 text-white placeholder-white/35 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-white text-(--color-community) font-sans font-normal text-sm px-6 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? 'Melder på…' : 'Meld på'}
              </button>
              {status === 'error' && (
                <p className="text-red-400 text-xs pl-1">Noe gikk galt. Prøv igjen.</p>
              )}
              <p className="text-white/30 text-xs pl-1 mt-1">Ingen spam. Meld av når som helst.</p>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}
