'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Address = {
  id: string
  label: string | null
  full_name: string
  address1: string
  address2: string | null
  postal_code: string
  city: string
  country: string
  is_default: boolean
}

type Props = {
  addresses: Address[]
}

export default function AddressList({ addresses: initial }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initial)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const supabase = createClient()

  const emptyForm = { label: '', full_name: '', address1: '', address2: '', postal_code: '', city: '', country: 'NO', is_default: false }
  const [form, setForm] = useState(emptyForm)

  function field(key: keyof typeof emptyForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data, error: insertError } = await supabase
      .from('addresses')
      .insert({
        user_id:     user.id as string,
        label:       form.label.trim() || null,
        full_name:   form.full_name.trim(),
        address1:    form.address1.trim(),
        address2:    form.address2.trim() || null,
        postal_code: form.postal_code.trim(),
        city:        form.city.trim(),
        country:     form.country,
        is_default:  form.is_default,
      })
      .select('*')
      .single()

    setSaving(false)

    if (insertError) {
      setError('Kunne ikke lagre adresse. Prøv igjen.')
      return
    }

    if (data) {
      if (form.is_default) {
        setAddresses(prev => prev.map(a => ({ ...a, is_default: false })).concat(data as Address))
      } else {
        setAddresses(prev => [...prev, data as Address])
      }
    }
    setForm(emptyForm)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  async function handleSetDefault(id: string) {
    await supabase.from('addresses').update({ is_default: true } as { is_default: boolean }).eq('id', id)
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
  }

  return (
    <div className="space-y-4">
      {/* Adresseliste */}
      {addresses.length === 0 && !showForm && (
        <div className="rounded-2xl border border-(--color-border) p-8 text-center text-(--color-muted) text-sm">
          Ingen lagrede adresser ennå.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className={[
              'relative rounded-2xl border p-5 bg-white',
              addr.is_default ? 'border-(--color-dark)' : 'border-(--color-border)',
            ].join(' ')}
          >
            {addr.is_default && (
              <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-(--color-dark) text-white">
                Standard
              </span>
            )}
            {addr.label && (
              <p className="text-xs font-semibold uppercase tracking-wider text-(--color-muted) mb-1">{addr.label}</p>
            )}
            <p className="text-sm font-medium text-(--color-text)">{addr.full_name}</p>
            <p className="text-sm text-(--color-muted)">{addr.address1}</p>
            {addr.address2 && <p className="text-sm text-(--color-muted)">{addr.address2}</p>}
            <p className="text-sm text-(--color-muted)">{addr.postal_code} {addr.city}</p>
            <p className="text-sm text-(--color-muted)">{addr.country}</p>

            <div className="flex gap-3 mt-4">
              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-(--color-dark) underline hover:no-underline"
                >
                  Sett som standard
                </button>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deleting === addr.id}
                className="text-xs text-red-500 underline hover:no-underline disabled:opacity-50"
              >
                {deleting === addr.id ? 'Sletter...' : 'Slett'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Legg til ny adresse */}
      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-2xl border border-(--color-border) p-6 space-y-4 bg-white">
          <h3 className="font-display text-lg font-semibold text-(--color-text)">Ny adresse</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">Navn (valgfritt)</label>
              <input type="text" value={form.label} onChange={e => field('label', e.target.value)} placeholder="Hjemme, Jobb..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">Fullt navn *</label>
              <input required type="text" value={form.full_name} onChange={e => field('full_name', e.target.value)} placeholder="Ola Nordmann" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-(--color-muted) mb-1">Adresse *</label>
              <input required type="text" value={form.address1} onChange={e => field('address1', e.target.value)} placeholder="Storgata 1" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-(--color-muted) mb-1">Adresse linje 2</label>
              <input type="text" value={form.address2} onChange={e => field('address2', e.target.value)} placeholder="Leil. 4B" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">Postnummer *</label>
              <input required type="text" value={form.postal_code} onChange={e => field('postal_code', e.target.value)} placeholder="0001" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-muted) mb-1">Poststed *</label>
              <input required type="text" value={form.city} onChange={e => field('city', e.target.value)} placeholder="Oslo" className="input-field" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={form.is_default}
              onChange={e => field('is_default', e.target.checked)}
              className="h-4 w-4 accent-(--color-cta)"
            />
            <label htmlFor="is_default" className="text-sm text-(--color-text) cursor-pointer">
              Sett som standardadresse
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-(--color-cta) text-white font-semibold rounded-full px-5 py-2.5 text-sm hover:bg-(--color-dark-mid) transition-colors disabled:opacity-60"
            >
              {saving ? 'Lagrer...' : 'Lagre adresse'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyForm); setError(null) }}
              className="border border-(--color-border) text-(--color-text) font-medium rounded-full px-5 py-2.5 text-sm hover:bg-(--color-sand-light) transition-colors"
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="border border-(--color-border) text-(--color-text) font-medium rounded-full px-5 py-2.5 text-sm hover:bg-(--color-sand-light) transition-colors"
        >
          + Legg til adresse
        </button>
      )}
    </div>
  )
}
