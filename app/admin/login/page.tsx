'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Feil e-post eller passord.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-(--color-bg) flex items-center justify-center px-4">
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-(--color-text) mb-1">
          Fera Admin
        </h1>
        <p className="text-sm text-(--color-muted) mb-6">Logg inn for å fortsette</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-(--color-subtle) mb-1">
              E-post
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="border border-(--color-border) rounded-lg px-3 py-2 w-full focus:outline-none focus:border-(--color-cta) text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-(--color-subtle) mb-1">
              Passord
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border border-(--color-border) rounded-lg px-3 py-2 w-full focus:outline-none focus:border-(--color-cta) text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--color-cta) text-white py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? 'Logger inn…' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
