'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  // Intern sti brukeren sendes til etter innlogging
  next?: string
}

// Felles innlogging/registrering for privatkunder. Magic link oppretter
// kontoen automatisk første gang, så det finnes ingen egen signup-flyt.
export function LoginForm({ next = '/' }: Props) {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function callbackUrl() {
    return `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: callbackUrl() },
    })
    if (error) {
      setError('Kunne ikke starte Google-innlogging. Prøv e-post i stedet.')
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    })
    setLoading(false)
    if (error) {
      setError('Kunne ikke sende innloggingslenke. Sjekk e-postadressen og prøv igjen.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center" role="status">
        <p className="font-display text-2xl font-semibold text-(--color-text)">Sjekk e-posten din</p>
        <p className="mt-2 text-sm text-(--color-muted)">
          Vi har sendt en innloggingslenke til <span className="font-medium text-(--color-text)">{email}</span>.
          Lenken logger deg inn og tar deg tilbake hit.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-(--color-subtle) underline hover:text-(--color-text)"
        >
          Bruk en annen e-post
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-(--color-border) bg-white px-6 py-3 font-sans text-sm font-semibold text-(--color-text) transition-colors hover:bg-(--color-sand-light) disabled:opacity-60"
      >
        Fortsett med Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-(--color-border)" />
        <span className="text-xs text-(--color-muted)">eller med e-post</span>
        <div className="h-px flex-1 bg-(--color-border)" />
      </div>

      <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
        <label htmlFor="login-email" className="sr-only">E-post</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="epost@eksempel.no"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="rounded-lg border border-(--color-border) px-4 py-3 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:border-(--color-cta) focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="rounded-full bg-(--color-cta) px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-(--color-dark-mid) disabled:opacity-60"
        >
          {loading ? 'Sender…' : 'Send innloggingslenke'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}

      <p className="mt-5 text-center text-xs text-(--color-muted)">
        Ny hos Fera? Kontoen opprettes automatisk. Ved å fortsette godtar du{' '}
        <a href="/personvern" className="underline hover:text-(--color-text)">personvernerklæringen</a>.
      </p>
    </div>
  )
}
