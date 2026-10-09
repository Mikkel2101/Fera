'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CommunitySignup() {
  const [email, setEmail] = useState('')
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newsletterError, setNewsletterError] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNewsletterError(false)
    setLoading(true)

    const normalizedEmail = email.trim()
    const emailRedirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent('/account')}`
    const { error: authError } = await createClient().auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo, shouldCreateUser: true },
    })

    if (authError) {
      setError('Kunne ikke sende innloggingslenken. Sjekk e-postadressen og prøv igjen.')
      setLoading(false)
      return
    }

    if (newsletterConsent) {
      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        })
        if (!response.ok) setNewsletterError(true)
      } catch {
        setNewsletterError(true)
      }
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-white" role="status">
        <h3 className="font-sans text-2xl font-semibold">Sjekk e-posten din</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Vi har sendt en innloggingslenke til <span className="font-semibold text-white">{email.trim()}</span>.
          Første gang oppretter lenken FERA-kontoen din. Har du allerede konto, logger den deg inn.
        </p>
        {newsletterError && (
          <p className="mt-3 text-sm text-(--color-sand)" role="alert">
            Kontoopprettelsen er i orden, men nyhetsbrev-påmeldingen gikk ikke gjennom. Prøv igjen senere.
          </p>
        )}
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 min-h-11 text-sm text-white underline underline-offset-4 hover:text-(--color-sand)"
        >
          Bruk en annen e-post
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="community-email" className="mb-2 block text-sm font-medium text-white">
          E-postadresse
        </label>
        <input
          id="community-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="din@epost.no"
          className="w-full rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-base text-white placeholder:text-white/45 focus:border-white/60 focus:outline-none"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white/80">
        <input
          type="checkbox"
          checked={newsletterConsent}
          onChange={(event) => setNewsletterConsent(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-(--color-sand)"
        />
        <span>Ja takk, jeg vil motta nyheter fra FERA på e-post.</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-(--color-community) transition-colors hover:bg-(--color-sand) disabled:opacity-60"
      >
        {loading ? 'Sender lenke…' : 'Opprett konto / logg inn'}
      </button>

      {error && <p className="text-sm text-red-200" role="alert">{error}</p>}
      <p className="text-xs leading-relaxed text-white/55">
        Første gang opprettes kontoen automatisk. Ved å fortsette godtar du vår{' '}
        <Link href="/personvern" className="underline underline-offset-2 hover:text-white">personvernerklæring</Link>.
      </p>
    </form>
  )
}