'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export function AuthModal({ isOpen, onClose, redirectTo = '/' }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Escape lukker, Tab fanges inne i dialogen (fokus-trap), fokus settes på
  // første fokuserbare element ved åpning, og returneres til elementet som
  // åpnet modalen når den lukkes.
  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      )

    getFocusable()[0]?.focus()

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const nodes = getFocusable()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      previouslyFocused.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
      },
    })
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
      },
    })
    setLoading(false)
    if (!error) setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Logg inn på Fera"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-dark p-8 shadow-xl"
      >

        {sent ? (
          <div className="text-center">
            <p className="font-display text-2xl text-light">Sjekk eposten din 📬</p>
            <p className="mt-2 text-sm text-muted">Vi har sendt en innloggingslenke til {email}</p>
            <button onClick={onClose} className="mt-6 text-sm text-muted underline">Lukk</button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="font-display text-2xl text-light">Logg inn på Fera</p>
              <p className="mt-1 text-xs text-muted">Én konto — alle Fera-brands</p>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-gray-100 disabled:opacity-60"
            >
              <span>🔵</span> Fortsett med Google
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-700" />
              <span className="text-xs text-muted">eller</span>
              <div className="h-px flex-1 bg-gray-700" />
            </div>

            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="epost@eksempel.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-light transition hover:bg-primary/90 disabled:opacity-60"
              >
                Send magic link
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-muted">
              Ved å logge inn godtar du{' '}
              <a href="/personvern" className="underline">personvernerklæringen</a>
            </p>

            <button
              onClick={onClose}
              className="mt-4 w-full text-center text-xs text-muted hover:text-light"
            >
              Avbryt
            </button>
          </>
        )}
      </div>
    </div>
  )
}
