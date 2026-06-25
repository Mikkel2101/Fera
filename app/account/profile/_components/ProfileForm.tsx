'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  full_name:  string | null
  phone:      string | null
  padel_level: string | null
  newsletter_consent: boolean
}

const PADEL_LEVELS = ['Nybegynner', 'Nybegynner+', 'Viderekommen-', 'Viderekommen+', 'Proff']

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState<ProfileData>(initial)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const supabase = createClient()

  function update(key: keyof ProfileData, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); setError('Ikke innlogget'); return }

    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id:                 user.id,
        full_name:          form.full_name?.trim() || null,
        phone:              form.phone?.trim() || null,
        padel_level:        form.padel_level || null,
        newsletter_consent: form.newsletter_consent,
      }, { onConflict: 'id' })

    setSaving(false)
    if (updateError) {
      setError('Noe gikk galt. Prøv igjen.')
    } else {
      setSaved(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      {/* Navn */}
      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1.5">
          Fullt navn
        </label>
        <input
          type="text"
          value={form.full_name ?? ''}
          onChange={e => update('full_name', e.target.value)}
          placeholder="Ola Nordmann"
          className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-dark) transition"
        />
      </div>

      {/* Telefon */}
      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1.5">
          Telefonnummer
        </label>
        <input
          type="tel"
          value={form.phone ?? ''}
          onChange={e => update('phone', e.target.value)}
          placeholder="+47 400 00 000"
          className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-dark) transition"
        />
      </div>

      {/* Padel-nivå */}
      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1.5">
          Padel-nivå
        </label>
        <select
          value={form.padel_level ?? ''}
          onChange={e => update('padel_level', e.target.value)}
          className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-dark) transition"
        >
          <option value="">Ikke oppgitt</option>
          {PADEL_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* Nyhetsbrev */}
      <div className="flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-sand-light) p-4">
        <input
          type="checkbox"
          id="newsletter"
          checked={form.newsletter_consent}
          onChange={e => update('newsletter_consent', e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-(--color-cta)"
        />
        <label htmlFor="newsletter" className="text-sm text-(--color-text) cursor-pointer">
          Jeg vil motta nyhetsbrev med tilbud, nyheter og reiser fra Fera
        </label>
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-(--color-success) font-medium">Profilen er lagret!</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-(--color-cta) text-white font-semibold rounded-full px-6 py-3 hover:bg-(--color-dark-mid) transition-colors disabled:opacity-60 text-sm"
      >
        {saving ? 'Lagrer...' : 'Lagre endringer'}
      </button>
    </form>
  )
}
