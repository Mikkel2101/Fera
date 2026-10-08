'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import type { NewsletterList } from '@/lib/newsletter/subscribe'

type Props = {
  list?:        NewsletterList
  eyebrow?:     string
  heading?:     ReactNode
  body?:        string
  successText?: string
}

export default function NewsletterSignup({
  list,
  eyebrow     = 'Meld deg på vårt nyhetsbrev',
  heading     = <>Bli med i<br />FERA Community</>,
  body        = 'Få tilgang til prelanseringer, eksklusive tilbud og utvalgte padelreiser før alle andre. Et fellesskap for deg som vil være først ute når nye opplevelser åpner.',
  successText = 'Du er med i FERA Select. Velkommen!',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, list }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">

        {/* Left — image (3/5) */}
        <div className="relative min-h-[320px] lg:min-h-0 lg:col-span-3">
          <Image
            src="/fonts/static/manuel-pappacena-zTwzxr4BbTA-unsplash.jpg"
            alt="Padel utendørs i solen"
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-(--color-overlay)/20" />
        </div>

        {/* Right — content (2/5) */}
        <div className="bg-(--color-community) flex flex-col justify-center px-10 py-16 lg:px-12 lg:col-span-2">
          <p className="text-white text-xs uppercase tracking-widest font-medium mb-4">
            {eyebrow}
          </p>
          <h2 className="font-sans font-normal text-white text-4xl sm:text-5xl leading-tight mb-6">
            {heading}
          </h2>
          <p className="font-sans text-[16px] text-white leading-relaxed mb-10">
            {body}
          </p>

          {status === 'success' ? (
            <div className="flex items-center gap-3 text-(--color-sand)">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-sans font-normal text-base">{successText}</span>
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
