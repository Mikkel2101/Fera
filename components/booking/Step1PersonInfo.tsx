'use client'

import { useState } from 'react'
import { step1Schema } from '@/lib/booking/schema'
import type { Step1Data } from '@/lib/booking/schema'

type Props = {
  data: Partial<Step1Data>
  // E-posten kommer fra Fera-kontoen og kan ikke endres i skjemaet
  lockedEmail: string
  onNext: (data: Step1Data) => void
}

const LEVELS = [
  { value: 'beginner', label: 'Begynner' },
  { value: 'intermediate', label: 'Mellomnivå' },
  { value: 'advanced', label: 'Avansert' },
  { value: 'elite', label: 'Elite' },
]

export default function Step1PersonInfo({ data, lockedEmail, onNext }: Props) {
  const [formData, setFormData] = useState({
    first_name:  data.first_name  ?? '',
    last_name:   data.last_name   ?? '',
    email:       lockedEmail,
    phone:       data.phone       ?? '',
    padel_level: data.padel_level ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleBlur(field: string) {
    const result = step1Schema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field]?.[0] ?? '' }))
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = formData.padel_level
      ? step1Schema.safeParse(formData)
      : step1Schema.safeParse({ ...formData, padel_level: undefined })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = (msgs as string[])[0] ?? ''
      }
      setErrors(fieldErrors)
      return
    }
    onNext(parsed.data)
  }

  const inputClass = (field: string) =>
    `border rounded-lg px-4 py-3 w-full focus:outline-none ${
      errors[field]
        ? 'border-red-400 focus:border-red-400'
        : 'border-(--color-border) focus:border-(--color-cta)'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-display font-semibold text-(--color-text) mb-6">
        Dine opplysninger
      </h2>

      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1">
          Fornavn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.first_name}
          onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
          onBlur={() => handleBlur('first_name')}
          className={inputClass('first_name')}
        />
        {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1">
          Etternavn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.last_name}
          onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
          onBlur={() => handleBlur('last_name')}
          className={inputClass('last_name')}
        />
        {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
      </div>

      <div>
        <label htmlFor="booking-email" className="block text-sm font-medium text-(--color-text) mb-1">
          E-post
        </label>
        <input
          id="booking-email"
          type="email"
          value={lockedEmail}
          readOnly
          aria-describedby="booking-email-hint"
          className="border border-(--color-border) bg-(--color-sand-light) text-(--color-subtle) rounded-lg px-4 py-3 w-full"
        />
        <p id="booking-email-hint" className="text-xs text-(--color-muted) mt-1">
          E-posten fra Fera-kontoen din. Bekreftelsen sendes hit.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1">Telefon</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
          className={inputClass('phone')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-(--color-text) mb-1">Padelnivå</label>
        <select
          value={formData.padel_level}
          onChange={e => setFormData(p => ({ ...p, padel_level: e.target.value }))}
          className={inputClass('padel_level')}
        >
          <option value="">Velg nivå (valgfritt)</option>
          {LEVELS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        Neste: Rom &amp; tilvalg →
      </button>
    </form>
  )
}
